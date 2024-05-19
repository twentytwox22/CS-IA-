-- Create the 'cars' table
CREATE TABLE cars (
    car_plate VARCHAR(30) PRIMARY KEY, -- Stores Car Plate (e.g., ACT123), up to 30 characters, must be unique
    make VARCHAR(30) NOT NULL,         -- Stores Car make (e.g., Tesla), up to 30 characters, must be entered
    colour VARCHAR(30) NOT NULL,       -- Stores Car colour (e.g., White), up to 30 characters, must be entered
    model VARCHAR(50) NOT NULL         -- Stores Car model (e.g., Model X), up to 50 characters, must be entered
);

-- Create the 'students' table
CREATE TABLE students (
    student_id INT PRIMARY KEY NOT NULL,           -- Stores Student ID (e.g., 280671), must be entered
    student_name VARCHAR(200) NOT NULL,            -- Stores Student name (e.g., Elon Musk), must be entered
    student_house VARCHAR(20) NOT NULL,            -- Stores Student house (e.g., Hay), must be entered
    password VARCHAR(200) NOT NULL,                -- Stores Student password (e.g., i<3elonmusk), must be entered
    hasPermit BOOLEAN DEFAULT FALSE,               -- Stores boolean value (e.g., TRUE), set to false by default
    car_plate_fk VARCHAR(30),                      -- Foreign key referencing car plate in cars table
    FOREIGN KEY (car_plate_fk) REFERENCES cars(car_plate)
        ON UPDATE CASCADE ON DELETE SET NULL,      -- Cascading update and delete when a car record is updated or deleted
    UNIQUE(car_plate_fk)                           -- Ensures one-to-one relationship between car and student
);

CREATE TABLE ballot_entries (
    student_id_fk INT PRIMARY KEY,                     -- Foreign key referencing student ID in students table
    entered_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Stores timestamp of ballot entry
    FOREIGN KEY (student_id_fk) REFERENCES students(student_id)
        ON DELETE NO ACTION                            -- Prevents deletion of student if there are associated ballot entries
);