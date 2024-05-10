// Import necessary modules and initialize Express router
const express = require('express');
const router = express.Router();
const controller = require('./controller');
const passport = require("passport");
const initializePassport = require("../../passportConfig");


// Initialize passport for authentication purposes
initializePassport(passport);

//Views Routes 
    // Route for the home page
    router.get('/', (req, res) => {
        res.render('index');
    }); 

    // Route for the registration page 
    router.get('/register', checkAuthenticated, (req, res) => {
    res.render("register");
    });

    // Route for the login page 
    router.get('/login', checkAuthenticated, (req, res) => {
        res.render("login");
    });

    // Route for the dashboard - accessible only if authenticated
    router.get('/dashboard', checkNotAuthenticated, (req,res)=>{
        const student_name = req.user.student_name;
        //res.render("dashboard", { student_name});
        res.render('dashboard', { title: 'Dashboard', student_name});
    });

    
// Authentication Routes
router.get('/logout', controller.logoutUser); // Handles user logout
router.post('/register', controller.registerUser); // Handles user registration
router.post("/login", controller.loginUser); // Handles user login


// Car related routes
router.post('/add-car', ensureAuthenticated, controller.addCar); // Adds a car, requires authentication
router.post('/change-car-details', ensureAuthenticated, controller.updateCarDetails); // Changes car details, requires authentication
router.post('/delete-car', ensureAuthenticated, controller.deleteCar); // Deletes a car, requires authentication
// router.post('/enter-ballot', checkAuthenticated, controller.enterBallot); // Enter a ballot, requires authentication

//Authenticaton functions
function checkAuthenticated(req, res, next) {
    console.log("checking if authed...");
    if (req.isAuthenticated()) {
    console.log("user authed");
      return res.redirect("/students/dashboard")
    }
    console.log("user not authed");
    next();
}
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    console.log("user not authed");
    res.redirect("/students/login");
}
function ensureAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        req.flash('error_msg', 'Please log in to view that resource');
        res.redirect('/students/login');
    } else {
        next();
    }
}

module.exports = router; 