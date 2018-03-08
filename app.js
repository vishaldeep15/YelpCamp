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

// requiring routes
var campgroundRoutes = require("./routes/campgrounds"),
	commentRoutes    = require("./routes/comments"),
	indexRoutes		 = require("./routes/index"); 

mongoose.connect("mongodb://localhost/yelp_camp");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

// seedDB(); //seed the database

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

app.use(indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);

// local server listening to port 3000
app.listen(3000, function() {
	console.log("The Yelp Camp server has started");
});