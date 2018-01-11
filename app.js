var express = require("express");
var	app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var campgrounds = [
		{name: "Simon Creek", image: "https://farm5.staticflickr.com/4153/4835814837_feef6f969b.jpg"},
		{name: "Granite Hill", image: "https://farm3.staticflickr.com/2311/2123340163_af7cba3be7.jpg"},
		{name: "Simon Creek", image: "https://farm3.staticflickr.com/2927/14442300701_7952568539.jpg"}
	];

app.get("/", function(req, res) {
	res.render("landing");
});

app.get("/campgrounds", function(req, res) {
	res.render("campground", {campgrounds: campgrounds});
});

app.post("/campgrounds", function(req, res) {
	var name = req.body.name;
	var image = req.body.image;
	var newCamground = {name: name, image: image};
	campgrounds.push(newCamground);

	res.redirect("/campgrounds");
});

app.get("/campgrounds/new", function(req, res) {
	res.render("new");
});

app.listen(3000, function() {
	console.log("The Yelp Camp server has started");
});