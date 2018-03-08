// include all packages
var express 			= require("express"),
	app 				= express(),
    bodyParser 			= require("body-parser"),
    mongoose 			= require("mongoose"),
    passport			= require("passport"),
    LocalStrategy		= require("passport-local"),
    Campground 			= require("./models/campground"),
    Comment 			= require("./models/comment"),
    User				= require("./models/user"),
    seedDB 				= require("./seeds");


mongoose.connect("mongodb://localhost/yelp_camp");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

seedDB();

//Passport Configuration
app.use(require("express-session")({
	secret: "Once again Rusty wins cutest dog!",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// renders landing page
app.get("/", function(req, res) {
	res.render("landing");
});

// Gets campgrounds page
app.get("/campgrounds", function(req, res) {
	Campground.find({}, function(err, allcampgrounds){
		if(err) {
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds: allcampgrounds});
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

app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res){
	Campground.findById(req.params.id, function(err, fcampground){
		if(err) {
			console.log(err);
		} else {
			res.render("comments/new", {campground: fcampground});
		}
	});
	
});

app.post("/campgrounds/:id/comments", isLoggedIn, function(req, res){
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

// ====================
// Auth Routes
// ====================

// Show register form
app.get("/register", function(req, res){
	res.render("register");
});

//handle sign up logic
app.post("/register", function(req, res){
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			return res.render("/register");
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("/campgrounds");
		});
	});
});

// Show Login form
app.get("/login", function(req, res){
	res.render("login");
});
// handling login logic
app.post("/login", passport.authenticate("local",
	{
		successRedirect: "/campgrounds",
		failureRedirect: "login"
	}), function(req, res){

});
// logout route
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/campgrounds");
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}


// local server listening to port 3000
app.listen(3000, function() {
	console.log("The Yelp Camp server has started");
});