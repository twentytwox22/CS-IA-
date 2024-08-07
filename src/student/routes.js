const express = require('express');
const router = express.Router();
const controller = require('./controller');
const studentBallotManager = require('../ballot/studentBallotManager');
const passport = require("passport");
const initializePassport = require("../../passportConfig");


// Initialize passport for authentication purposes
initializePassport(passport);


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
router.get('/dashboard', checkNotAuthenticated, controller.getDashboard);


// Authentication Routes
router.get('/logout', controller.logoutUser); // Handles user logout
router.post('/register', controller.registerUser); // Handles user registration
router.post("/login", controller.loginUser); // Handles user login


// Car related routes
router.post('/add-car', checkNotAuthenticated, controller.addCar); // Adds a car, requires authentication
router.post('/change-car-details', checkNotAuthenticated, controller.updateCarDetails); // Changes car details, requires authentication
router.post('/delete-car', checkNotAuthenticated, controller.deleteCar); // Deletes a car, requires authentication
router.post('/enter-ballot', checkNotAuthenticated, studentBallotManager.addStudentID); // Enter a ballot, requires authentication

//Authenticaton functions
function checkAuthenticated(req, res, next) { //checks if user is auth, if so redirect to dashboard
    console.log("checking if authed...");
    if (req.isAuthenticated()) {
    console.log("user authed");
      return res.redirect("/students/dashboard")
    }
    console.log("user not authed");
    next();
}
function checkNotAuthenticated(req, res, next) { //checks if user is not auth, if so redirect to login
    if (req.isAuthenticated()) {
      return next();
    }
    console.log("user not authed");
    res.redirect("/students/login");
}

module.exports = router; 