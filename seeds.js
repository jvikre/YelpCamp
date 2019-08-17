var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment   = require("./models/comment");

var data = [
    {
        name: "Cloud's Rest", 
        image: "https://images.unsplash.com/photo-1475564481606-0f9f5d97c047?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
        description: "Cat ipsum dolor sit amet, eat half my food and ask for more and sniff sniff hate dog so that box? i can fit in that box. Touch my tail, i shred your hand purrrr groom forever, stretch tongue and leave it slightly out, blep. Cat cat moo moo lick ears lick paws yowling nonstop the whole night or sleep on dog bed, force dog to sleep on floor yet chew on cable i’m so hungry i’m so hungry but ew not for that , or flop over, meow to be let in. Yowling nonstop the whole night sleep, but behind the couch. Sniff catnip and act crazy check cat door for ambush 10 times before coming in for scream at teh bath, who's the baby eat from dog's food or munch on tasty moths. Take a big fluffing crap 💩 step on your keyboard while you're gaming and then turn in a circle or where is my slave? I'm getting hungry sleep on keyboard, or caticus cuteicus, for push your water glass on the floor. Push your water glass on the floor pushes butt to face. Scream for no reason at 4 am make it to the carpet before i vomit mmmmmm. Licks your face dismember a mouse and then regurgitate parts of it on the family room floor always ensure to lay down in such a manner that tail can lightly brush human's nose , yet eat grass, throw it back up. Mewl for food at 4am annoy owner until he gives you food say meow repeatedly until belly rubs, feels good or cats go for world domination for lick sellotape meow to be let out sleep nap. Mrow. Eat all the power cords claw drapes, somehow manage to catch a bird but have no idea what to do next, so play with it until it dies of shock yet pet me pet me don't pet me. The dog smells bad gnaw the corn cob so if it fits i sits, do not try to mix old food with new one to fool me!. Cat walks in keyboard mark territory, swat at dog, but i show my fluffy belly but it's a trap! if you pet it i will tear up your hand ooh, are those your $250 dollar sandals? lemme use that as my litter box rub butt on table. Mesmerizing birds kitty kitty so gimme attention gimme attention gimme attention gimme attention gimme attention gimme attention just kidding i don't want it anymore meow bye or ask for petting sit and stare. "
    },
    {
        name: "Desert Mesa", 
        image: "https://images.unsplash.com/photo-1468956398224-6d6f66e22c35?ixlib=rb-1.2.1&auto=format&fit=crop&w=755&q=80",
        description: "Cupcake ipsum dolor sit amet cake cheesecake dessert. Dessert lemon drops topping dessert cotton candy cake danish croissant pie. Croissant danish icing jelly-o donut lollipop gingerbread. Brownie toffee apple pie chocolate bar muffin icing tiramisu macaroon toffee."
    },
    {
        name: "Canyon Floor", 
        image: "https://images.unsplash.com/photo-1455763916899-e8b50eca9967?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
        description: " Haxx0r ipsum stdio.h private bytes segfault stack trace terminal. Var grep foo malloc hello world cache it's a feature tera bang function sql afk highjack. Ip endif semaphore headers python do public spoof blob Trojan horse syn Donald Knuth d00dz crack Dennis Ritchie kilo. "
    }
]

function seedDB(){
   //Remove all campgrounds
   Campground.deleteMany({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed campgrounds!");
         //add a few campgrounds
        data.forEach(function(seed){
            Campground.create(seed, function(err, campground){
                if(err){
                    console.log(err)
                } else {
                    console.log("added a campground");
                    //create a comment
                    Comment.create(
                        {
                            text: "This place is great, but I wish there was internet",
                            author: "Homer"
                        }, function(err, comment){
                            if(err){
                                console.log(err);
                            } else {
                                campground.comments.push(comment);
                                campground.save();
                                console.log("Created new comment");
                            }
                        });
                }
            });
        });
    }); 
    //add a few comments
}

module.exports = seedDB;