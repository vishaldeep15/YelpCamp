var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment")

// New Comment
router.get("/new", isLoggedIn, function(req, res){
	Campground.findById(req.params.id, function(err, fcampground){
		if(err) {
			console.log(err);
		} else {
			res.render("comments/new", {campground: fcampground});
		}
	});
	
});

// Create comment
router.post("/", isLoggedIn, function(req, res){
	Campground.findById(req.params.id, function(err, campground) {
		if(err){
			console.log(err);
			redirect("/campgrounds");
		} else {
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					console.log(err);
				} else {
					campground.comments.push(comment._id);
					campground.save();
					res.redirect("/campgrounds/" + campground._id);
				}
			});
		}
	});
});

// middleware
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

module.exports = router;