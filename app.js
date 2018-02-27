// include all packages
var express = require("express"),
	app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    seedDB = require("./seeds");

seedDB();
mongoose.connect("mongodb://localhost/yelp_camp");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


// renders landing page
app.get("/", function(req, res) {
	res.render("landing");
});

// Gets campgrounds page
app.get("/campgrounds", function(req, res) {
	Campground.find({}, function(err, campgrounds){
		if(err) {
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds: campgrounds});
		}
	})
});

//Create a new campground
app.post("/campgrounds", function(req, res) {
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
app.get("/campgrounds/new", function(req, res) {
	res.render("campgrounds/new");
});

// retrieve a campground
app.get("/campgrounds/:id", function(req,res) {
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err) {
			console.log(err);
		} else {
			console.log(foundCampground);
			res.render("campgrounds/show", {campground: foundCampground});
		}
	})
});

// ========================
// COMMENTS ROUTES
// ========================

app.get("/campgrounds/:id/comments/new", function(req, res){
	Campground.findById(req.params.id, function(err, fcampground){
		if(err) {
			console.log(err);
		} else {
			res.render("comments/new", {campground: fcampground});
		}
	});
	
});

app.post("/campgrounds/:id/comments", function(req, res){
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

// local server listening to port 3000
app.listen(3000, function() {
	console.log("The Yelp Camp server has started");
});