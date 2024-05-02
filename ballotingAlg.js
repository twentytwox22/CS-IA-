function allocateParkingSpots(studentIDs, numberOfSpots) {
    let winners = new Set();

    // Ensure the number of spots does not exceed the number of students
    numberOfSpots = Math.min(numberOfSpots, studentIDs.length);

    while (winners.size < numberOfSpots) {
        let randomIndex = Math.floor(Math.random() * studentIDs.length);
        winners.add(studentIDs[randomIndex]);
    }

    return Array.from(winners);
}

// Example usage
const studentIDs = ["S1001", "S1002", "S1003", "S1004", "S1005", "S1006"];
const numberOfSpots = 3; // Total parking spots available
const allocatedSpots = allocateParkingSpots(studentIDs, numberOfSpots);

console.log("Allocated Spots:", allocatedSpots);