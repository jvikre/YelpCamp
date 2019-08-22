

var express       = require("express"),
      app           = express(),
      bodyParser    = require("body-parser"),
      mongoose      = require("mongoose"),
      passport      = require("passport"),
      LocalStrategy = require("passport-local"),
      flash         = require("connect-flash"),
      Campground    = require("./models/campground"),
      Comment       = require("./models/comment"),
      User          = require("./models/user"),
      session       = require("express-session"),
      seedDB        = require("./seeds"),
      methodOverride = require("method-override"),
      parseStack = require("parse-stack")

// configure dotenv
require('dotenv').config();

// requiring routes      
var commentRoutes       = require("./routes/comments"),
    campgroundRoutes    = require("./routes/campgrounds"),
    indexRoutes         = require("./routes/index")
    port    			      = process.env.PORT || 3000;
      
var url = process.env.DATABASEURL || "mongodb://localhost:27017/yelp_camp";
mongoose.connect(url, { useNewUrlParser: true });


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

// require moment
app.locals.moment = require('moment');

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Dexter wins cutest cat!",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error =  req.flash("error");
    next();
});


app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(process.env.PORT || 3000, function(){
   console.log("YelpCamp server has started...") 
});