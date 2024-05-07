const express = require("express");
const expressLayouts = require('express-ejs-layouts');
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
require("dotenv").config();
const studentRoutes = require('./src/student/routes') //change
const app = express();
const PORT = process.env.PORT || 4000;
const initializePassport = require("./passportConfig");
initializePassport(passport);

//middleware
app.use(session({
    // Key we want to keep secret which will encrypt all of our information
    secret: 'secret',
    // Should we resave our session variables if nothing has changes which we dont
    resave: false,
    // Save empty value if there is no vaue which we do not want to do
    saveUninitialized: false
}));
app.use(passport.session());
app.use(passport.initialize());
app.use(express.urlencoded({ extended: false }));


app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(express.static('public'));

app.use(flash());

app.use('/students',studentRoutes);

app.get('/', (req,res)=> {
    res.send("hello world");                
})

app.listen(PORT, ()=> {
    console.log('listening on port '+ PORT)
})
