const { getStudentIDs } = require('./studentBallotManager'); 
let studentIDs = getStudentIDs();

function allocateParkingSpots(numberOfSpots) {
    
    let winners = new Set();

    // Ensure the number of spots does not exceed the number of students
    numberOfSpots = Math.min(numberOfSpots, studentIDs.length);
    while (winners.size < numberOfSpots) {
        let randomIndex = Math.floor(Math.random() * studentIDs.length);
        winners.add(studentIDs[randomIndex]);
    }
    return Array.from(winners);
}

// This can be called via a route or a scheduled task
function performAllocation() {
    
    const numberOfSpots = 3; // Total parking spots available
    const allocatedSpots = allocateParkingSpots(numberOfSpots);

    console.log("Student ID:", studentIDs);
    console.log("Number of Student IDs:", studentIDs.length);
    console.log(numberOfSpots);
    console.log("Allocated Spots:", allocatedSpots);

    // Additional logic as needed (e.g., database updates, notifications)
    return allocatedSpots;
}

console.log(performAllocation());



module.exports = { performAllocation };