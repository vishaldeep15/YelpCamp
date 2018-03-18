var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var multer = require("multer");

var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dxxdhb7ti', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

//INDEX - show all campgrounds
router.get("/", function(req, res) {
	if(req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campground.find({name: regex}, function(err, allcampgrounds){
			if(err) {
				console.log(err);
			} else {
				res.render("campgrounds/index", {campgrounds: allcampgrounds, page: "campgrounds"});
			}
		});
	} else {
		Campground.find({}, function(err, allcampgrounds){
			if(err) {
				console.log(err);
			} else {
				res.render("campgrounds/index", {campgrounds: allcampgrounds, page: "campgrounds"});
			}
		})
	}	
});

//CREATE a new campground
router.post("/", middleware.isLoggedIn, upload.single("image"), function(req, res) {
	geocoder.geocode(req.body.location, function (err, data) {
		//console.log(process.env.GEOCODER_API_KEY);
		//eval(require('locus'));
	    if (err || !data.length) {
	      req.flash('error', 'Invalid address');
	      return res.redirect('back');
	    }
	    var lat = data[0].latitude;
	    var lng = data[0].longitude;
	    var location = data[0].formattedAddress;
	    console.log(location);
	    cloudinary.uploader.upload(req.file.path, function(result) {
  			// add cloudinary url for the image to the campground object under image property
  			req.body.image = result.secure_url;
  			// add author to campground
  			var author = {
				id: req.user._id,
				username: req.user.username
			}
		    var newCampground = {
		    	name: req.body.name, 
		    	image: req.body.image, 
		    	description: req.body.description, 
	    		author: author, 
	    		price: req.body.price, 
	    		location: location, 
	    		lat: lat, 
	    		lng: lng
	    	};
    		//eval(require('locus'));
		
			Campground.create(newCampground, function(err, newlyCreated){
				if(err) {
					req.flash("error", err);
					res.redirect('back');
				} else {
					req.flash("success", "Campground successfully added");
					res.redirect("/campgrounds");
				}
			});
		});
	});
});

// Add a new campground page
router.get("/new", middleware.isLoggedIn, function(req, res) {
	res.render("campgrounds/new");
});

// retrieve a campground
router.get("/:id", function(req,res) {
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err) {
			console.log(err);
		} else {
			//console.log(foundCampground);
			res.render("campgrounds/show", {campground: foundCampground});
		}
	})
});

// EDIT campground  route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){	
	Campground.findById(req.params.id, function(err, foundCampground){			
		res.render("campgrounds/edit", {campground: foundCampground});		
	});	
});

// UPDATE campground route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
  	console.log(req.body.location);
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    console.log(location);
    var newData = {name: req.body.name, image: req.body.image, description: req.body.description, 
    				price: req.body.price, location: location, lat: lat, lng: lng};
    
    Campground.findByIdAndUpdate(req.params.id, newData, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

// Destroy Campground route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err) {
		if(err){
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds");
		}
	});
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;