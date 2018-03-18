var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

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

// forgot password
router.get("/forgot", function(req, res){
	res.render("forgot");
});

router.post("/forgot", function(req, res, next){
	async.waterfall([
		function(done) {
			crypto.randomBytes(20, function(err, buf){
				var token = buf.toString("hex");
				done(err, token);
			});
		},
		function(token, done) {
			User.findOne({email: req.body.email}, function(err, user){
				if(!user) {
					req.flash("error", "No account is associated with this email!");
					return res.redirect("/forgot");
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
				service: "Gmail",
				auth: {
					user: "vishal.unisuggest@gmail.com",
					pass: process.env.GMAILPW1
				}
			});
			var mailOption = {
				to: user.email,
				from: "vishal.unisuggest@gmail.com",
				subject: "Password Reset Request",
				text: " You are receiving this because you  (or someone else) have requested to reset you password.\n\n" + 
					"Please click on the following link or paste into your browser to complete the process: \n\n" +
					"http://" + req.headers.host + "/reset/" + token + "\n\n" +
					"If you did not request this, please ignore this email and your password will remain unchaged.\n"
			};
			smtpTransport.sendMail(mailOption, function(err){
				console.log("Mail sent");
				req.flash("success", "An email has been sent to " + user.email + " with further instructions.");
				done(err, "done");
			});
		}
	], function(err) {
		if(err) return next(err);
		res.redirect("/forgot");
	});
});

router.get("/reset/:token", function(req, res){
	User.findOne({resetPasswordToken: req.params.token, 
					resetPasswordExpires: {$gt: Date.now()}}, function(err, user){
		if(!user) {
			req.flash("error", "Password token value is invalid or expired");
			return res.redirect("/forgot");
		}
		res.render("reset", {token: req.params.token});
	});
});

router.post("reset/:token", function(req, res) {
	async.waterfall([
		function(done) {
			User.findOne({resetPasswordToken: req.params.token, 
				resetPasswordExpires: {$gt: Date.now()}}, function(err, user){
					if(!user) {
						req.flash("error", "Password reset token is invalid or expired");
						res.redirect("back");
					}
					if(req.body.password === req.body.confirm){
						user.setPassword(req.body.password, function(err){
							user.resetPasswordToken = undefined;
							user.resetPasswordExpires = undefined;

							user.save(function(err){
								req.login(user, function(err){
									done(err, user);
								});
							});
						});
					} else {
						req.flash("error", "Password do not match");
						return res.redirect("back");
					}
			});
		},
		function(user, done) {
			var smtpTransport = nodemailer.createTransport({
				service: "Gmail",
				auth: {
					user: "vishal.unisuggest@gmail.com",
					pass: process.env.GMAILPW1
				}
			});
			var mailOption = {
				to: user.email,
				from: "vishal.unisuggest@gmail.com",
				subject: "Password Updated",
				text: " Hello \n\n" +
						"This is confirmation that your password has been changed for account\n\n" +
						user.email
			};
			smtpTransport.sendMail(mailOption, function(err){
				console.log("Mail sent");
				req.flash("success", "Your password has been updated!");
				done(err);
			});			
		}
	], function(err){
		if(err) return next(err);
		res.redirect("/campgrounds");
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