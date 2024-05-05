// Import necessary modules and initialize Express router
const {Router} = require('express');
const controller = require('./controller');
// const { getStudentByID } = require('./queries');
const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
require("dotenv").config();
const initializePassport = require("../../passportConfig");
const { pool } = require("../../dbConfig");


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
router.post('/add-car', checkAuthenticated, controller.addCar); // Adds a car, requires authentication
router.post('/change-car-details', checkAuthenticated, controller.changeCarDetails); // Changes car details, requires authentication
router.post('/delete-car', checkAuthenticated, controller.deleteCar); // Deletes a car, requires authentication
router.post('/enter-ballot', checkAuthenticated, controller.enterBallot); // Enter a ballot, requires authentication

//Authenticaton functions
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/students/dashboard");
    }
    console.log("user authed");
    next();
}
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    console.log("user not authed");
    res.redirect("/students/login");
}

module.exports = router; 