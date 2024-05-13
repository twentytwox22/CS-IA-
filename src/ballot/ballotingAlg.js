const { pool } = require("../../dbConfig");
const queries = require('../student/queries');  // Import SQL queries from queries.js


const numberOfSpots = 3; // Total parking spots available -- set by school 24? 

async function fetchStudentIDs() {
      
    try {
        const result = await pool.query(queries.SELECT_ALL_STUDENT_IDS_FROM_BALLOT_ENTRIES);
        return result.rows.map(row => row.student_id_fk);
    } catch (error) {
        console.error('Error fetching student IDs:', error);
        throw error;
    }
}

// Fisher-Yates shuffle function
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

async function allocateParkingSpots(numberOfSpots) {
    let studentIDs = await fetchStudentIDs();
    // Shuffle the array of student IDs
    shuffleArray(studentIDs);
    // Ensure the number of spots does not exceed the number of students
    numberOfSpots = Math.min(numberOfSpots, studentIDs.length);
    // Select the first 'numberOfSpots' students after shuffling
    return studentIDs.slice(0, numberOfSpots);
}

// Called via npm run ballot
async function performAllocation() {
    try {
        const allocatedSpots = await allocateParkingSpots(numberOfSpots);
        console.log("Allocated Spots:", allocatedSpots);
        // Additional logic here (e.g., update database, notify winners)
    } catch (error) {
        console.error('Failed to allocate parking spots:', error);
    }
}

console.log(performAllocation());

module.exports = { performAllocation };