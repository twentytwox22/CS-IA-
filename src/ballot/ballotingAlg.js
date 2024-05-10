const { pool } = require("../../dbConfig");
const queries = require('../student/queries');  // Import SQL queries from queries.js


const numberOfSpots = 3; // Total parking spots available -- set by school 24? 

async function fetchStudentIDs() {
    const query = 'SELECT student_id_fk FROM ballot_entries';  
    try {
        const result = await pool.query(query);
        return result.rows.map(row => row.student_id_fk);
    } catch (error) {
        console.error('Error fetching student IDs:', error);
        throw error;
    }
}

async function allocateParkingSpots(numberOfSpots) {
    let winners = new Set();

    // Fetch all student IDs eligible for the ballot
    const studentIDs = await fetchStudentIDs();

    // Ensure the number of spots does not exceed the number of students
    numberOfSpots = Math.min(numberOfSpots, studentIDs.length);
    
    while (winners.size < numberOfSpots) {
        let randomIndex = Math.floor(Math.random() * studentIDs.length);
        winners.add(studentIDs[randomIndex]);
    }
    
    return Array.from(winners);
}

// This can be called via a route or a scheduled task
async function performAllocation() {
    const numberOfSpots = 3; // Define how many spots are available
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