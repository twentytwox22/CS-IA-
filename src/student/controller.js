// Import necessary modules
const bcrypt = require("bcrypt");  // Used for hashing passwords
const passport = require("passport");  // Used for handling authentication
const { pool } = require("../../dbConfig");  // Database pool for PostgreSQL
const { addStudentID } = require('../ballot/studentBallotManager');  // Function to add student ID to the ballot
const queries = require('./queries');  // Import SQL queries from queries.js

// Function to log out the user
function logoutUser(req, res) {
    console.log("Logging out user...");
        req.logout((err) => { // Log out the user
            if (err) {
                console.error("Error logging out:", err);
                return res.status(500).send("Error logging out");
            }
            req.flash('success_msg', "You have logged out"); // Notify user of successful logout
            console.log("User logged out");
            res.redirect('/students/login'); // Redirect to login page
        });
}

// Function to handle user login
function loginUser(req, res, next){
    const { student_ID } = req.body;
    let errors = [];

    // Error Handling -- Validate student ID format
    if (!/^\d+$/.test(student_ID)) { // Ensure student ID is numeric
        errors.push({ message: "Invalid student ID format" });
    }

    if (errors.length > 0) {
        res.render("login", { errors, student_ID }); //Display Error Msg
    } else {
        passport.authenticate('local', {
            successRedirect: "/students/dashboard",
            failureRedirect: "/students/login",
            failureFlash: true
        })(req, res, next);
        console.log(`User ${student_ID} logged in`);
    }
};

// Function to register user
async function registerUser (req, res) {
    let { student_name,student_ID, student_year, student_house, password, password2 } = req.body;
    let errors = [];

    // Log user registration details
    console.log("Registering user:", { 
        student_name,
        student_ID,
        student_year,
        student_house,
        password,
        password2 
      }, " in controller.js");

    //error handling
    if (!student_name || !student_ID || !password || !password2) {
        errors.push({ message: "Please enter all fields" });
      }
    if (!/^\d+$/.test(student_ID)) { // Ensure student ID is numeric
        errors.push({ message: "Invalid student ID format" });
    }
    if (password.length < 6) {
        errors.push({ message: "Password must be a least 6 characters long" });
    }
    if (password !== password2) {
        errors.push({ message: "Passwords do not match" });
    }
    
    // If there are any errors, render the register page with error messages
    if (errors.length > 0) {
        res.render("register", { errors, student_name, student_ID, student_year, student_house}); 
        // This pre-fills the form fields with error messages
        return;
      } else { // If everything is filled out properly
        //hash the password
        hashedPassword = await bcrypt.hash(password, 10); 
        console.log("hashed pw is: " + hashedPassword + " from controller.js");
    
        pool.query( 
             //check if a student with the given student_ID already exists in the database.
            queries.SELECT_STUDENT_BY_ID, [student_ID], (err, results) => { 
                if (err) console.error("Error executing SQL query:", err);
            console.log("existing students: " + results.rows); // Log existing students
           
            if(results.rows.length > 0){ // If student ID already exists
                    errors.push({message:'Student ID already in use'})
                    res.render('register', { errors, student_name, student_ID, student_year, student_house});
                } else { // If new student ID
                    // Insert new student into the database
                    pool.query(
                        queries.INSERT_NEW_STUDENT, 
                        [student_name,student_ID, student_year, student_house, hashedPassword], (err,results)=>{
                            if (err) throw err
                            console.log("inserted new student: " + student_name + " " + student_ID); // Log inserted new student
                            req.flash('success_msg',"You are now registered. Please log in");
                            res.redirect('/students/login'); // Redirect to login page after successful registration
                        }
                    )
                }
            }
        )
    }
}

// Function to add car (WIP)
async function addCar(req, res) {
    const { car_plate, make, model, colour } = req.body;
    let errors = [];
   
    console.log("Received car details:", car_plate, make, model, colour);
    console.log("Student ID from session:", req.user.student_id);


    try {
        // Check for existing car or car assigned to the student in a single query
        const carCheckResult = await pool.query(queries.CHECK_CAR_PLATE_AND_STUDENT_ASSIGNMENT, 
            [car_plate, req.user.student_id]);

        // Handle errors based on query results
        if (carCheckResult.rows.length > 0) {
            let errorMessage = carCheckResult.rows.find(row => row.car_plate === car_plate) ?
                `A car with plate number '${car_plate}' already exists.` :
                "You already have a car assigned. Only one car per student is allowed.";
            req.flash('error_msg', errorMessage);
            return res.redirect("/students/dashboard");
        }

        // If car does not exist, 
        // Insert new car and update student record atomically using transaction
        await pool.query('BEGIN');
        await pool.query(queries.INSERT_NEW_CAR, [car_plate, make, model, colour]);
        await pool.query(queries.UPDATE_STUDENT_CAR_ID, [car_plate, req.user.student_id]);
        await pool.query('COMMIT');

        // Flash success message and redirect to dashboard
        req.flash('success_msg', "Car successfully added");
        res.redirect("/students/dashboard");

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("Error when trying to add car:", error);
        req.flash('error_msg', 'Failed to add car due to an unexpected error.');
        res.redirect("/students/dashboard");
    }
}  





module.exports = {
    logoutUser,
    registerUser,
    loginUser,
    addCar,
};