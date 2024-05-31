const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");

function initialize(passport) {
  console.log("Initialized");

  const authenticateUser = (student_ID, password, done) => {
    console.log("Attempting to authenticate user with ID:", student_ID);
    console.log(student_ID, password);
    pool.query( //check if student exist
      `SELECT * FROM students WHERE student_id = $1`,
      [student_ID], 
      (err, results) => {
        if (err) {
            console.error("Error querying database:", err);
          throw err;
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          const student = results.rows[0];

          bcrypt.compare(password, student.password, (err, isMatch) => {
            if (err) {
                console.error("Error comparing passwords:", err);
                console.log("Password comparison failed");
            }
            if (isMatch) {
              return done(null, student);
            } else {
              //password is incorrect
              return done(null, false, { message: "Password is incorrect" });
            }
          });
        } else {
          // No user
          console.log("No user found with ID:", student_ID);
          return done(null, false, {
            message: "No student with that ID"
          });
        }
      }
    );
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "student_ID", passwordField: "password" },
      authenticateUser
    )
  );

passport.serializeUser((student, done) => done(null, student.student_id));

// In deserializeUser that key is matched with the in memory array / database or any data resource.
// The fetched object is attached to the request object as req.user
passport.deserializeUser((student_ID, done) => {
  pool.query(`SELECT * FROM students WHERE student_ID = $1`, [student_ID], (err, results) => {
    if (err) {
      return done(err);
      }
    console.log(`ID is ${student_ID}`);
    return done(null, results.rows[0]);
    });
  });
}

module.exports = initialize;