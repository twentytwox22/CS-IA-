require("dotenv").config();
const {Pool} = require ("pg");
const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  user: 'postgres', // Your PostgreSQL username
  host: 'localhost', // Your PostgreSQL server host
  database: 'csia', // Your PostgreSQL database name
  password: 'test', // Your PostgreSQL password
  port: 5432, // Your PostgreSQL server port
});

module.exports = {pool};