var express = require("express");
var	app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/yelp_camp", {
	useMongoClient: true
});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//Schema Setup
var campgroundSchema = new mongoose.Schema({
	name: String,
	image: String,
	description: String
});

var Campground = mongoose.model("Campground", campgroundSchema);

app.get("/", function(req, res) {
	res.render("landing");
});

app.get("/campgrounds", function(req, res) {
	Campground.find({}, function(err, campgrounds){
		if(err) {
			console.log(err);
		} else {
			res.render("index", {campgrounds: campgrounds});
		}
	})
});

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

app.get("/campgrounds/new", function(req, res) {
	res.render("new");
});

app.get("/campgrounds/:id", function(req,res) {
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err) {
			console.log(err);
		} else {
			res.render("show", {campground: foundCampground});
		}
	})
});

app.listen(3000, function() {
	console.log("The Yelp Camp server has started");
});