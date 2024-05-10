const { pool } = require("../../dbConfig");
const queries = require('../student/queries');  // Import SQL queries from queries.js
// Function to add a student ID
async function addStudentID (req, res) {  
    const studentId = req.user.student_id;
    try {
        await pool.query('BEGIN');  // Start transaction

    //check if student as a car
        const carCheck = await pool.query(queries.SELECT_NON_NULL_CAR_BY_STUDENT_ID, [studentId]);
        if (carCheck.rowCount === 0) {
            req.flash('error_msg', 'You must have a car registered to enter the ballot');
            await pool.query('ROLLBACK');
            return res.redirect('/students/dashboard');
        }

        // Check if the student has already entered the ballot
        const checkResult = await pool.query(queries.CHECK_STUDENT_IN_BALLOT, [studentId]);
        if (checkResult.rowCount > 0) {
           
            req.flash('error_msg', 'You have already entered the ballot for a parking spot');
            await pool.query('ROLLBACK');  // Roll back any potential changes made
            return res.redirect('/students/dashboard'); 
        
        }

        

        // Update the inBallotcolum in students table
        await pool.query(queries.UPDATE_STUDENT_IN_BALLOT, [true, studentId]);

        // Add student to ballot
        await pool.query(queries.ADD_STUDENT_TO_BALLOT, [studentId]);
        await pool.query('COMMIT');  // Commit transaction
        console.log('Student successfully entered into the ballot'); // Log or handle successful entry
        req.flash('success_msg', 'You have successfully entered the ballot for a parking spot');
        res.redirect('/students/dashboard');
    } catch (error) {
        await pool.query('ROLLBACK');  // Rollback transaction on error
        console.error('Error entering the ballot:', error);
        throw error; // Rethrow the error so that the caller can handle it, perhaps in your route or controller


    }
}
// Function to get all student IDs
function getStudentIDs() {
    return studentIDs;
}

// Function to clear student IDs (if needed, e.g., after allocation)
function clearStudentIDs() {
    // clear the db
}

module.exports = {
    addStudentID,
    getStudentIDs,
    clearStudentIDs
};
