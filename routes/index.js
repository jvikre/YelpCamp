var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var middleware = require("../middleware");
var async = require("async");
var nodemailer = require("nodemailer");
var { google } = require("googleapis");
var OAuth2 = google.auth.OAuth2;
var crypto = require("crypto");


// root route
router.get("/", function(req, res){
    res.render("landing");
});

// show register form
router.get("/register", function(req,res){
    res.render("register", {page: 'register'});
});

//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar
      });

    if(req.body.adminCode === 'secretcode123') {
      newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, function(){
           req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
           res.redirect("/campgrounds"); 
        });
    });
});

// show login form
router.get("/login", function(req, res){
    res.render("login", {page: 'login'});
});

// handling login logic
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: 'Welcome to YelpCamp!' 
    }), function(req,res){
});

// logout route
router.get("/logout", function(req,res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/campgrounds");
});


var oauth2Client = new OAuth2 (
	'103686683463-rf6va1dce7s333kklorvf5b5umv7l4vu.apps.googleusercontent.com', // ClientID
	process.env.OAUTH2SECRET, // Client Secret
	'https://developers.google.com/oauthplayground' // Redirect URL
);

oauth2Client.setCredentials({
     refresh_token: "1/Ybs8pHgpuJ7MPpS95DiN4hUO27qxB8duziEl-qLmV9M"
});
const accessToken = oauth2Client.getAccessToken()

// forgot password
router.get("/forgot", function(req, res) {
	res.render("forgot");
});
router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
	function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
      	host: 'www.googleapis.com',
        service: 'gmail',
        auth: {
        	type: 'OAuth2',
        	user: 'julievikre@gmail.com',
	    	clientId: '103686683463-rf6va1dce7s333kklorvf5b5umv7l4vu.apps.googleusercontent.com',
	    	clientSecret: process.env.OAUTH2SECRET,
	    	refreshToken: '1/Ybs8pHgpuJ7MPpS95DiN4hUO27qxB8duziEl-qLmV9M',
	    	accessToken: accessToken
        	}
        });
      var mailOptions = {
        from: 'julievikre@gmail.com',
        to: user.email,
        subject: 'YelpCamp Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };

      smtpTransport.sendMail(mailOptions, function(err, res) {
      	if(err){
      		console.log(err.message);
      	} else {
      		console.log('email sent');
	        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
	        done(err, 'done');
      	}
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req,res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if(!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm){
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash('error', 'Passwords do not match.');
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        host: 'www.googleapis.com',
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: 'julievikre@gmail.com',
          clientId: '103686683463-rf6va1dce7s333kklorvf5b5umv7l4vu.apps.googleusercontent.com',
          clientSecret: process.env.OAUTH2SECRET,
          refreshToken: '1/Ybs8pHgpuJ7MPpS95DiN4hUO27qxB8duziEl-qLmV9M',
          accessToken: accessToken
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'julievikre@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
    ], function(err) {
      res.redirect('/campgrounds');
    });
});

// USER PROFILE
router.get("/users/:id", function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if(err) {
      req.flash("error", "Something went wrong.");
      return res.redirect("/");
    }
    Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds) {
      if(err) {
        req.flash("error", "Something went wrong.");
        return res.redirect("/");
      }
      res.render("user/show", {user: foundUser, campgrounds: campgrounds});
    })
  });
});

// EDIT USER ROUTE
router.get("/users/:id/edit", middleware.checkUserOwnership, function(req,res){
    User.findById(req.params.id, function(err, foundUser){
    	if(err) {
    		console.log(err);
    	} else {
			res.render("user/edit", {user: foundUser});
    	}
    });
});

// UPDATE USER ROUTE
router.put("/users/:id", middleware.checkUserOwnership, function(req, res){
	// find and update the correct user profile
	User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedUser){
        if(err){
            req.flash("error", "Could not update profile due to: " + err.message);
            res.redirect("/users/" + req.params.id);
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/users/" + req.params.id);
        }
    });
});

module.exports = router;