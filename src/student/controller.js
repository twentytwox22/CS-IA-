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
async function loginUser(req, res, next){
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
    }
};

// Function to register user
async function registerUser (req, res) {
    let { student_name,student_ID, student_year, student_house, password, password2 } = req.body;
    let errors = [];

    // Log user registration details
    console.log("Registering user: ", { 
        student_name,
        student_ID,
        student_year,
        student_house,
        password,
        password2 
      }, "in controller.js");

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
    if (student_year !== "11" && student_year !== "12") {
        errors.push({ message: "Please enter a valid year" });
    }
    // If there are any errors, render the register page with error messages
    if (errors.length > 0) {
        res.render("register", { errors, student_name, student_ID, student_year, student_house}); 
        // This pre-fills the form fields with error messages
        return;
      } else { // If everything is filled out properly
        //hash the password
        hashedPassword = await bcrypt.hash(password, 10); 
        console.log("hashed pw is: " + hashedPassword + "from controller.js");
    
        pool.query( 
             //check if a student with the given student_ID already exists in the database.
            queries.SELECT_STUDENT_BY_ID, [student_ID], (err, results) => { 
                if (err) console.error("Error executing SQL query:", err);
            console.log("existing students: " + results.rows); // Log existing students
           
            if(results.rows.length > 0){ // If student ID already exists
                    errors.push({message:'student id already in use'})
                    res.render('register', { errors, student_name, student_ID, student_year, student_house});
                } else { // If new student ID
                    // Insert new student into the database
                    pool.query(
                        queries.INSERT_NEW_STUDENT, 
                        [student_name,student_ID, student_year, student_house, hashedPassword], (err,results)=>{
                            if (err) throw err
                        
                            console.log("inserted new student: " + results.rows); // Log inserted new student
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
        // Check if the car already exists to prevent duplicate entries
        const existingStudentCar = await pool.query(
            queries.SELECT_STUDENT_CAR_ID, [req.user.student_id]
        );

        if (existingStudentCar.rows.length > 0) {
            req.flash('error_msg', "You already have a car assigned. Only one car per student is allowed.");
            return res.redirect("/students/dashboard");
        }

        // Check if the car plate already exists in the database
        const existingCarResult = await pool.query(
            queries.SELECT_CAR_BY_PLATE,
            [car_plate]
        );

        if (existingCarResult.rows.length > 0) {
            req.flash('error_msg', `A car with plate number '${car_plate}' already exists.`);
            return res.redirect("/students/dashboard");
        }

        // If car does not exist, add the new car
        const result = await pool.query(
            queries.INSERT_NEW_CAR, [car_plate, make, model, colour]
        );

        // Update the student's car_id after successfully adding the car
        await pool.query(
            queries.UPDATE_STUDENT_CAR_ID, [car_plate, req.user.student_id]
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
            queries.SELECT_CAR_BY_STUDENT_ID_AND_PLATE, [car_plate, studentId]
        );

        if (carCheck.rows.length === 0) {
            req.flash('error_msg', 'No car found with that plate registered to your account.');
            return res.redirect('/students/dashboard');
        }

        // If changing the car plate, check for potential duplicate plates
        if (new_car_plate && new_car_plate !== car_plate) {
            const duplicateCheck = await pool.query(
                queries.SELECT_CAR_BY_PLATE,
                [new_car_plate]
            );
            if (duplicateCheck.rows.length > 0) {
                req.flash('error_msg', 'Another car with the new plate already exists.');
                return res.redirect('/students/dashboard');
            }
        }

        // Update car details
        const updateQuery = queries.UPDATE_CAR;
        await pool.query(updateQuery, [car_plate, new_car_plate, new_make, new_model, new_colour]);

        // Update the student's car_id if the plate was changed
        if (new_car_plate && new_car_plate !== car_plate) {
            await pool.query(
                queries.UPDATE_STUDENT_CAR_ID,
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

async function deleteCar(req, res) {
    if (!req.user || !req.user.student_id) {
        req.flash('error_msg', 'You must be logged in to perform this operation.');
        return res.redirect('/students/login');
    }

    const studentId = req.user.student_id;

    try {
        // First, fetch the car_plate to ensure the student currently has a car assigned
        const fetchCarQuery = `
            SELECT car_id FROM students WHERE student_id = $1;
        `; // how is this different from the not null condition? 
        const carResult = await pool.query(fetchCarQuery, [studentId]);
        if (carResult.rows.length === 0 || carResult.rows[0].car_id === null) {
            req.flash('error_msg', 'No car assigned to you to delete.');
            return res.redirect('/students/dashboard');
        }

        const carPlate = carResult.rows[0].car_id;

        // Delete the car entry from the cars table
        const deleteCarQuery = queries.DELETE_CAR_BY_PLATE;
        await pool.query(deleteCarQuery, [carPlate]);

        // Update the student's record to remove the car_id
        const updateStudentQuery = `
            UPDATE students SET car_id = NULL WHERE student_id = $1;
        `;
        await pool.query(updateStudentQuery, [studentId]);

        req.flash('success_msg', 'Car successfully deleted.');
        res.redirect('/students/dashboard');
    } catch (error) {
        console.error('Failed to delete car:', error);
        req.flash('error_msg', 'Failed to delete car due to an unexpected error.');
        res.redirect('/students/dashboard');
    }
}


async function enterBallot(req, res) {
    if (!req.user || !req.user.student_id) {
        req.flash('error_msg', 'You must be logged in to enter the ballot.');
        return res.redirect('/students/login');
    }

    const studentId = req.user.student_id;

    try {
        // Check if the student has a car assigned
        const carCheckQuery = queries.SELECT_STUDENT_BY_ID;
        const carCheckResult = await pool.query(carCheckQuery, [studentId]);

        if (carCheckResult.rows.length === 0) {
            req.flash('error_msg', 'You do not have a car assigned and cannot enter the ballot.');
            return res.redirect('/students/dashboard');
        }

        // Proceed with entering the ballot
        addStudentID(studentId); // Assuming addStudentID handles logic to prevent duplicates
        req.flash('success_msg', "You have successfully entered the ballot.");
        res.redirect("/students/dashboard");

    } catch (error) {
        console.error("Error when trying to enter ballot:", error);
        req.flash('error_msg', 'Failed to enter the ballot due to an unexpected error.');
        res.redirect("/students/dashboard");
    }
}


module.exports = {
    logoutUser,
    registerUser,
    loginUser,
    addCar,
    changeCarDetails,
    deleteCar,
    enterBallot,
};