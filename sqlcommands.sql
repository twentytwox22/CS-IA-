
--\i C:\Users\LIMJR\Documents\OneDrive - cgs.act.edu.au\IB - Onedrive\CS\trying-out-myself\sqlcommands.sql


CREATE TABLE car ( 
car_plate VARCHAR(30) NOT NULL PRIMARY KEY, --stores Car Plate eg ACT123, up to 30 characters, must be entered
make VARCHAR(30) NOT NULL, --stores Car make eg Telsa, up to 30 characters, must be entered
colour VARCHAR(30) NOT NULL, --stores Car colour eg white, up to 30 characters, must be entered
model VARCHAR(100) NOT NULL --stores Car model eg Model X, up to 100 characters, must be entered
); 

CREATE TABLE students(
    student_id INT PRIMARY KEY NOT NULL, --stores Student ID eg 280671 as a number, must be entered
    student_name VARCHAR(200) NOT NULL, --stores Student name eg Elon Musk as a string, must be entered
    student_year INT NOT NULL, --stores Student year eg 11 as a number, must be entered
    student_house VARCHAR(20) NOT NULL, --stores Student house eg Hay as a number, must be entered
    password VARCHAR(200) NOT NULL, --stores Student password eg i<3elonmusk as a string, must be entered
    hasPermit BOOLEAN DEFAULT FALSE, --stores boolean value eg TRUE, set to false by default
    car_id VARCHAR(30) REFERENCES car (car_plate), --stores student's carplate eg ACT123
    UNIQUE(car_id), --one car to one student 
    UNIQUE(student_id) --one studentid to one student 
);

/*
Updating Foreign Key Columns
UPDATE students SET car_plate = DC8422 WHERE student_id = 65563
*/

