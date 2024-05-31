require("dotenv").config();
const {Pool} = require ("pg");
const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  user: 'postgres', 
  host: 'localhost', 
  database: 'csia', 
  password: 'test',
  port: 5432, 
});

module.exports = {pool};