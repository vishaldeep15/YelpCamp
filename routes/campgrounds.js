var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");

// Gets campgrounds page
router.get("/", function(req, res) {
	Campground.find({}, function(err, allcampgrounds){
		if(err) {
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds: allcampgrounds});
		}
	})
});

//Create a new campground
router.post("/", function(req, res) {
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var newCamground = {name: name, image: image, description: desc};
	
	Campground.create(newCamground, function(err, newlyCreated){
		if(err) {
			console.log(err);
		} else {
			res.redirect("/campgrounds");
		}
	});
});

// Add a new campground page
router.get("/new", function(req, res) {
	res.render("campgrounds/new");
});

// retrieve a campground
router.get("/:id", function(req,res) {
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err) {
			console.log(err);
		} else {
			console.log(foundCampground);
			res.render("campgrounds/show", {campground: foundCampground});
		}
	})
});

//middleware
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

module.exports = router;
