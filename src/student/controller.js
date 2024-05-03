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
const { addStudentID} = require('../ballot/studentBallotManager');


initializePassport(passport);

function logoutUser(req, res) {
    req.logout((err) => {
        if (err) {
            console.error("Error logging out:", err);
            return res.status(500).send("Error logging out");
        }
        req.flash('success_msg', "You have logged out");
        res.redirect('/students/login');
    });
}
async function loginUser(req, res, next){
    const { student_ID, password } = req.body;
    let errors = [];
    // Validate student ID format
    if (!/^\d+$/.test(student_ID)) {
        errors.push({ message: "Invalid student ID format" });
    }

    if (errors.length > 0) {
        res.render("login", { errors, student_ID });
    } else {
        passport.authenticate('local', {
            successRedirect: "/students/dashboard",
            failureRedirect: "/students/login",
            failureFlash: true
        })(req, res, next);
    }
};

async function registerUser (req, res) {
    let { student_name,student_ID, student_year, student_house, password, password2 } = req.body;
    let errors = [];

    console.log({ //check if information comes through
      student_name,
      student_ID,
      student_year,
      student_house,
      password,
      password2
    });

    //error checking
    if (!student_name || !student_ID || !password || !password2) {
        errors.push({ message: "Please enter all fields" });
      }
    if (password.length < 6) {
        errors.push({ message: "Password must be a least 6 characters long" });
    }
    if (password !== password2) {
        errors.push({ message: "Passwords do not match" });
      }
    if (errors.length > 0) {
        res.render("register", { errors, student_name, student_ID, password, password2 });
      } else { // if everything is filled out properly
    
        //hash the password
        hashedPassword = await bcrypt.hash(password, 10); 
        console.log(hashedPassword);
    
    pool.query(
        `SELECT * FROM students
          WHERE student_id = $1`,
        [student_ID],
        (err, results) => {
          if (err) {
            console.error("Error executing SQL query:", err);
          }
          console.log(results.rows); 

          if(results.rows.length > 0){
                errors.push({message:'student id already in use'})
                res.render('register', {errors});
            } else {//if successful
                pool.query(
                    `INSERT INTO students (student_name,student_id, student_year, student_house, password)
                    VALUES ($1,$2,$3,$4,$5)
                    RETURNING student_id, password`, 
                    [student_name,student_ID, student_year, student_house, hashedPassword], (err,results)=>{
                        if (err){
                            throw err
                        }
                        console.log(results.rows); 
                        req.flash('success_msg',"You are now registered. Please log in");
                        
                        res.redirect('/students/login');
})}})}
}

async function addCar(req, res) {
    const { car_plate, make, model, colour } = req.body;
    let errors = [];
   
    console.log("Received car details:", car_plate, make, model, colour);
    console.log("Student ID from session:", req.user.student_id);


    try {
        // Check if the car already exists to prevent duplicate entries
        const existingStudentCar = await pool.query(
            `SELECT car_id FROM students WHERE student_id = $1 AND car_id IS NOT NULL`,
            [req.user.student_id]
        );

        if (existingStudentCar.rows.length > 0) {
            req.flash('error_msg', "You already have a car assigned. Only one car per student is allowed.");
            return res.redirect("/students/dashboard");
        }

        // Check if the car plate already exists in the database
        const existingCarResult = await pool.query(
            `SELECT * FROM cars WHERE car_plate = $1`,
            [car_plate]
        );

        if (existingCarResult.rows.length > 0) {
            req.flash('error_msg', `A car with plate number '${car_plate}' already exists.`);
            return res.redirect("/students/dashboard");
        }

        // If car does not exist, add the new car
        const result = await pool.query(
            `INSERT INTO cars (car_plate, make, model, colour) VALUES ($1, $2, $3, $4)`,
            [car_plate, make, model, colour]
        );

        // Update the student's car_id after successfully adding the car
        await pool.query(
            `UPDATE students SET car_id = $1 WHERE student_id = $2`,
            [car_plate, req.user.student_id]
        );

        // Log and flash success message
        console.log("Car added:", result.rows);
        req.flash('success_msg', "Car successfully added");
        res.redirect("/students/dashboard");

    } catch (error) {
        console.error("Error when trying to add car:", error);
        console.log(error);  // Log the full error object to get more details
        req.flash('error_msg', 'Failed to add car due to an unexpected error.');
        res.redirect("/students/dashboard");
    }
}  

async function changeCarDetails(req, res) {
    const { car_plate, new_car_plate, new_make, new_model, new_colour } = req.body;
    const studentId = req.user.student_id;

    try {
        // Check if the car belongs to the logged-in student
        const carCheck = await pool.query(
            `SELECT * FROM cars WHERE car_plate = $1 AND car_plate = (SELECT car_id FROM students WHERE student_id = $2)`,
            [car_plate, studentId]
        );

        if (carCheck.rows.length === 0) {
            req.flash('error_msg', 'No car found with that plate registered to your account.');
            return res.redirect('/students/dashboard');
        }

        // If changing the car plate, check for potential duplicate plates
        if (new_car_plate && new_car_plate !== car_plate) {
            const duplicateCheck = await pool.query(
                `SELECT * FROM cars WHERE car_plate = $1`,
                [new_car_plate]
            );
            if (duplicateCheck.rows.length > 0) {
                req.flash('error_msg', 'Another car with the new plate already exists.');
                return res.redirect('/students/dashboard');
            }
        }

        // Update car details
        const updateQuery = `
            UPDATE cars
            SET car_plate = COALESCE($2, car_plate),
                make = COALESCE($3, make),
                model = COALESCE($4, model),
                colour = COALESCE($5, colour)
            WHERE car_plate = $1;
        `;
        await pool.query(updateQuery, [car_plate, new_car_plate, new_make, new_model, new_colour]);

        // Update the student's car_id if the plate was changed
        if (new_car_plate && new_car_plate !== car_plate) {
            await pool.query(
                `UPDATE students SET car_id = $1 WHERE student_id = $2`,
                [new_car_plate, studentId]
            );
        }

        req.flash('success_msg', 'Car details updated successfully.');
        res.redirect('/students/dashboard');
    } catch (error) {
        console.error('Failed to update car details:', error);
        req.flash('error_msg', 'Failed to update car details due to an unexpected error.');
        res.redirect('/students/dashboard');
    }
}


async function enterBallot(req, res) {
    const studentId = req.user.student_id; 

    // Add student ID to the global list, checks for duplicates internally
    addStudentID(studentId);

    req.flash('success_msg', "You have successfully entered the ballot.");
    res.redirect("/students/dashboard");
}
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

module.exports = {
    logoutUser,
    registerUser,
    loginUser,
    addCar,
    enterBallot,
};