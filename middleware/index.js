// All middleware goes here
var middlewareObj = {};
var Campground = require("../models/campground");
var Comment = require("../models/comment");

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
	// is user logged in
	if(req.isAuthenticated()){
		Campground.findById(req.params.id, function(err, foundCampground){
			if(err){
				res.redirect("back");		
			} else {
				// does user own the campground (both id doesn't have same type therefore using mongoose method)
				if(foundCampground.author.id.equals(req.user._id)){
					next();
				} else {
					res.redirect("back");				}
			}
		});	
	} else {
		res.redirect("back");
	}
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
	// is user logged in
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err){
				res.redirect("back");		
			} else {
				// does user own the comment (both id doesn't have same type therefore using mongoose method)
				if(foundComment.author.id.equals(req.user._id)){
					next();
				} else {
					res.redirect("back");				}
			}
		});	
	} else {
		res.redirect("back");
	}
}

//middleware
middlewareObj.isLoggedIn = function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

module.exports = middlewareObj;