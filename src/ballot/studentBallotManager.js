const { pool } = require("../../dbConfig");

let studentIDs = []; // This holds the student IDs

// Function to add a student ID
function addStudentID(studentId) {
    if (!studentIDs.includes(studentId)) {
        studentIDs.push(studentId);
        console.log('Updated Student IDs:', studentIDs);
    }
}

// Function to get all student IDs
function getStudentIDs() {
    return studentIDs;
}

// Function to clear student IDs (if needed, e.g., after allocation)
function clearStudentIDs() {
    studentIDs = [];
}

module.exports = {
    addStudentID,
    getStudentIDs,
    clearStudentIDs
};
