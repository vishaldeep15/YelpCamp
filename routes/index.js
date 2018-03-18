var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground")

// renders landing page
router.get("/", function(req, res) {
	res.render("landing");
});

// ====================
// Auth Routes
// ====================

// Show register form
router.get("/register", function(req, res){
	res.render("register", {page: "register"});
});

//handle sign up logic
router.post("/register", function(req, res){
	var newUser = new User({
			username: req.body.username, 
			firstName: req.body.firstname, 
			lastName: req.body.lastname, 
			email: req.body.email, 
			avatar: req.body.avatar
	});
	//eval(require('locus'));
	if(req.body.adminCode === process.env.SECRET_ADMIN_KEY) {
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, function(err, user){
		if(err){
    		console.log(err);
    		return res.render("register", {error: err.message});
		}
			passport.authenticate("local")(req, res, function(){
			req.flash("success", "Welcome to Yelp Camp " + user.username);
			res.redirect("/campgrounds");
		});
	});
});

// Show Login form
router.get("/login", function(req, res){
	res.render("login", {page: "login"});
});
// handling login logic
router.post("/login", passport.authenticate("local",
	{
		successRedirect: "/campgrounds",
		failureRedirect: "login"
	}), function(req, res){

});
// logout route
router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged out");
	res.redirect("/campgrounds");
});

//USER profile
router.get("/users/:id", function(req, res) {
	User.findById(req.params.id, function(err, foundUser){
		if(err) {
			req.flash("error", "something went wrong.");
			res.redirect("/campgrounds");
		}
		Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds){
			if(err) {
			req.flash("error", "something went wrong.");
			res.redirect("/campgrounds");
		}
		res.render("users/show", {user: foundUser, campgrounds: campgrounds});
		});		
	});
});

//middleware
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

module.exports = router;