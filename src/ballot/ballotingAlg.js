const { pool } = require("../../dbConfig");
const queries = require('../student/queries');  // Import SQL queries from queries.js
const { sendEmail, successfulHtmlBody, successfulTextBody, unsuccessfulHtmlBody, unsuccessfulTextBody } = require('../email/email');



const numberOfSpots = 3; // Total parking spots available -- set by school

async function fetchStudentDetails(studentIDs) {
    try {
        const result = await pool.query(queries.SELECT_STUDENT_DETAILS_BY_IDS, [studentIDs]);
        return result.rows.map(row => ({
            id: row.student_id,
            name: row.student_name
        }));
    } catch (error) {
        console.error('Error fetching student details:', error);
        throw error;
    }
}



async function fetchStudentIDs() {
    try {
        const result = await pool.query(queries.SELECT_ALL_STUDENT_IDS_FROM_BALLOT_ENTRIES);
        return result.rows.map(row => row.student_id_fk);
    } catch (error) {
        console.error('Error fetching student IDs:', error);
        throw error;
    }
}

function generateStudentEmail(studentID) {
    return `${studentID}@cgs.act.edu.au`;
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

async function performAllocation() {
    try {
        await pool.query(queries.UPDATE_HAS_PERMIT_FALSE_FOR_ALL);

        const allocatedSpots = await allocateParkingSpots(numberOfSpots);
        console.log("Allocated Spots:", allocatedSpots);

        for (const studentID of allocatedSpots) {
            await pool.query(queries.UPDATE_HAS_PERMIT_TRUE_FOR_STUDENT, [studentID]);
            console.log("student id:", studentID);
        }

        const allStudentIDs = await fetchStudentIDs();
        const allStudents = await fetchStudentDetails(allStudentIDs);

        const unsuccessfulStudents = allStudents.filter(student => !allocatedSpots.includes(student.id));

        for (const studentID of allocatedSpots) {
            const student = allStudents.find(s => s.id === studentID);
            const studentEmail = generateStudentEmail(studentID);
            console.log("Sending email to successful student:", studentEmail, student.name);
            const htmlBody = successfulHtmlBody.replace('[Student Name]', student.name);
            const textBody = successfulTextBody.replace('[Student Name]', student.name);
            await sendEmail(studentEmail, htmlBody, textBody);
        }

        for (const student of unsuccessfulStudents) {
            const studentEmail = generateStudentEmail(student.id);
            console.log("Sending email to unsuccessful student:", studentEmail, student.name);
            const htmlBody = unsuccessfulHtmlBody.replace('[Student Name]', student.name);
            const textBody = unsuccessfulTextBody.replace('[Student Name]', student.name);
            await sendEmail(studentEmail, htmlBody, textBody);
        }

        await pool.query(queries.DELETE_ALL_BALLOT_ENTRIES);
        await pool.query(queries.UPDATE_IN_BALLOT_FALSE_FOR_ALL);

    } catch (error) {
        console.error('Failed to allocate parking spots:', error);
    }
}

performAllocation();

module.exports = { performAllocation };