const { pool } = require("../../dbConfig");
const queries = require('../student/queries');  // Import SQL queries from queries.js


const numberOfSpots = 3; // Total parking spots available -- set by school 24? 

// function allocateParkingSpots(numberOfSpots) {
//     let winners = new Set();
//     // Ensure the number of spots does not exceed the number of students
//     numberOfSpots = Math.min(numberOfSpots, queries.COUNT_ALL_BALLOT_ENTRIES);
//     while (winners.size < numberOfSpots) {
//         let randomIndex = Math.floor(Math.random() * queries.COUNT_ALL_BALLOT_ENTRIES);
//         winners.add(studentIDs[randomIndex]);
//     }
//     return Array.from(winners);
// }


// This can be called via a route or a scheduled task
function performAllocation() {
    const allocatedSpots = allocateParkingSpots(numberOfSpots);
    return allocatedSpots;
}

console.log(performAllocation());



module.exports = { performAllocation };