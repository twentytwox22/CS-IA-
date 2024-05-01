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

initializePassport(passport);

//routes
router.get('/', (req,res) => {
    res.render('index');
}); 
router.get('/register', checkAuthenticated, (req,res)=>{
    res.render("register");
});
router.get('/login', checkAuthenticated, (req,res)=>{
    res.render("login");
});
router.get('/dashboard', checkNotAuthenticated, (req,res)=>{
    const student_name = req.user.student_name;
    //res.render("dashboard", { student_name});
    res.render('dashboard', { title: 'Dashboard', student_name});
});



router.post('/add-car', controller.addCar);


router.get('/logout', controller.logoutUser);
router.post('/register', controller.registerUser);
router.post("/login",controller.loginUser);



function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/students/dashboard");
    }
    next();
}
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/students/login");
}
module.exports = router; 