// Import necessary modules
const bcrypt = require("bcrypt");  // Used for hashing passwords
const passport = require("passport");  // Used for handling authentication
const { pool } = require("../../dbConfig");  // Database pool for PostgreSQL
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
    let { student_name,student_ID, student_house, password, password2 } = req.body;
    let errors = [];



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
        res.render("register", { errors, student_name, student_ID, student_house}); 
        
        return;
      } else { 
        //hash the password
        
        pool.query( 
            queries.SELECT_STUDENT_BY_ID, [student_ID], async (err, results) => { 
                if (err) console.error("Error executing SQL query:", err);
            console.log("existing students: " + results.rows); 
           
            if(results.rows.length > 0){ // If student ID already exists
                    errors.push({message:'Student ID already in use'})
                    res.render('register', { errors, student_name, student_ID, student_house});
                } else { // If new student ID
                    // Insert new student into the database
                    hashedPassword = await bcrypt.hash(password, 10); 
                    console.log("hashed pw is: " + hashedPassword + " from controller.js");
    
                    pool.query(
                        queries.INSERT_NEW_STUDENT, 
                        [student_name,student_ID, student_house, hashedPassword], (err,results)=>{
                            if (err) throw err
                            console.log("inserted new student: " + student_name + " " + student_ID); // Log inserted new student
                            req.flash('success_msg',"You are now registered. Please log in");
                            res.redirect('/students/login'); // Redirect to login page after successful registration
                        }
                    )
                }
            }
        )
            // Log user registration details
    console.log("Registering user:", { 
        student_name,
        student_ID,
        student_house,
        password,
        password2 
      }, " in controller.js");
    }
}
async function getDashboard (req,res){
    
    const student_id = req.user.student_id;
    const student_name = req.user.student_name;

    try { //code for balloting status
        const result = await pool.query(queries.SELECT_BALLOT_STATUS_BY_STUDENT_ID, [student_id]); 
        console.log(result.rows) //[ { inballot: true } ]
        const { inballot } = result.rows[0];  // Ensure correct casing
        console.log('inballot:', inballot);


        if (inballot == true) { //if user is in the ballot

            const studentPermit = await pool.query(queries.SELECT_PERMIT_STATUS_BY_STUDENT_ID, [student_id]);
            console.log(studentPermit.rows)
            const { haspermit } = studentPermit.rows[0];
            console.log('haspermit:', haspermit);

            if (haspermit == true) { //if student has permit
                    ballotStatus = 'Accepted';
            } else { //student is in ballot but doesnt have permit
                ballotStatus = 'Not accepted';
            }

        } else { //user not in the ballot and doesnt have permit 
            ballotStatus = 'No ballot entry';
        }
        res.render('dashboard', { title: 'Dashboard', student_name, ballotStatus });
    }    
    catch (error) {
        console.error('Error fetching ballot status:', error);
        res.status(500).send("Error fetching ballot status");
    }
}

// Function to add car 
async function addCar(req, res) {
    const { car_plate, make, model, colour } = req.body;
   
    console.log("Received car details:", car_plate, make, model, colour);
    console.log("Student ID from session:", req.user.student_id);


    try {
        //Check if student already has a car or if the car has already been assigned to another student

        const carCheckResult = await pool.query(queries.CHECK_CAR_PLATE_AND_STUDENT_ASSIGNMENT, 
            [car_plate, req.user.student_id]);

        // Handle errors based on query results
        if (carCheckResult.rows.length > 0) {
            // Determine the specific error message based on the reason returned
            const reasons = carCheckResult.rows.map(row => row.reason);
            let errorMessage = reasons.includes('car_exists') ?
        `A car with plate number '${car_plate}' already exists.` :
        "You already have a car assigned. Only one car per student is allowed.";
        req.flash('error_msg', errorMessage);
        return res.redirect("/students/dashboard");
        }

        // If car does not exist, 
        // Insert new car and update student record atomically using transaction
        await pool.query('BEGIN');
        await pool.query(queries.INSERT_NEW_CAR, [car_plate, make, model, colour]);
        await pool.query(queries.UPDATE_STUDENT_CAR_FK, [car_plate, req.user.student_id]);
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
// Function to change car details
async function updateCarDetails(req, res) {
    const { new_car_plate, new_make, new_model, new_colour } = req.body;
    
    console.log("Received:", new_car_plate, new_make, new_model, new_colour, req.user.student_id, req.user.car_plate_fk);

    //error handling
    if (!new_car_plate || !new_make || !new_model || !new_colour) {
        req.flash('error_msg', 'All fields must be filled out');
        return res.redirect('/students/dashboard'); 
    }

    try {
       
        await pool.query('BEGIN');

        // check if there is a current car_plate associated with the user
        const currentCarResult = await pool.query(queries.SELECT_CAR_BY_STUDENT_ID, [req.user.student_id]);
        console.log(currentCarResult.rows);
        if (currentCarResult.rows.length === 0 || currentCarResult.rows[0].car_plate_fk === null) {
            req.flash('error_msg', 'You have not added a car. Update not possible.');
            await pool.query('ROLLBACK');  // Roll back any potential changes made
            return res.redirect('/students/dashboard'); 
        }
        // Check if the new_car_plate is already in use by another car (not the current one)
        const plateCheckResult = await pool.query(queries.SELECT_CAR_BY_PLATE, [new_car_plate]);
        if (plateCheckResult.rows.length > 0 && plateCheckResult.rows[0].car_plate !== req.user.car_plate_fk) {
            req.flash('error_msg', `The car plate '${new_car_plate}' is already in use. Please choose a different plate number.`);
            await pool.query('ROLLBACK');  // Roll back any potential changes
            return res.redirect('/students/dashboard');
        }
        

        //update cars table
        console.log("Updating car plate from",req.user.car_plate_fk, "to", new_car_plate);
        await pool.query(queries.UPDATE_CAR, [new_car_plate, new_make, new_model, new_colour, req.user.car_plate_fk]);

        // Update the students table -> car_plate_fk = new_car_plate
        if (req.user.car_plate_fk !== new_car_plate) {
            await pool.query(queries.UPDATE_STUDENT_CAR_FK, [new_car_plate, req.user.student_id]);
        }

        await pool.query('COMMIT');
        req.flash('success_msg', 'Car details and references updated successfully');
        res.redirect('/students/dashboard'); // Redirect to a suitable page
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Failed to update car details:', error);
        req.flash('error_msg', 'Failed to update car details due to an unexpected error.');
        res.redirect('/students/dashboard');
    }
}
// Function to delete car 
async function deleteCar(req, res) {
    try {
        await pool.query('BEGIN');

        // check if there is a current car_plate associated with the user
        const currentCarResult = await pool.query(queries.SELECT_CAR_BY_STUDENT_ID, [req.user.student_id]);
        console.log(currentCarResult.rows);
        if (currentCarResult.rows.length === 0 || currentCarResult.rows[0].car_plate_fk === null) {
            req.flash('error_msg', 'You have not added a car. Delete not possible.');
            await pool.query('ROLLBACK');  // Roll back any potential changes made
            return res.redirect('/students/dashboard'); 
        }
        // Delete the car from the cars table
        await pool.query(`DELETE FROM cars WHERE car_plate = $1;`, [req.user.car_plate_fk]);

        await pool.query('COMMIT');
        console.log(`Car with carplate ${req.user.car_plate_fk} deleted successfully`);
        req.flash('success_msg', 'Car successfully deleted');
        res.redirect('/students/dashboard');
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Failed to delete car:', error);
        req.flash('error_msg', 'Failed to delete car due to an unexpected error.');
        res.redirect('/students/dashboard');
    }
}





module.exports = {
    logoutUser,
    registerUser,
    getDashboard,
    loginUser,
    addCar,
    updateCarDetails,
    deleteCar,
};