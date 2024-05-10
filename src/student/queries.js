const SELECT_STUDENT_BY_ID = `
    SELECT * 
    FROM students 
    WHERE student_id = $1`;
const SELECT_CAR_BY_PLATE = `
    SELECT * 
    FROM cars 
    WHERE car_plate = $1`;

const INSERT_NEW_STUDENT = `
    INSERT INTO students (student_name, student_id, student_year, student_house, password)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING student_id, password;`; 
const INSERT_NEW_CAR = `
    INSERT INTO cars (car_plate, make, model, colour) 
    VALUES ($1, $2, $3, $4)`

const UPDATE_STUDENT_CAR_FK = `
    UPDATE students 
    SET car_plate_fk = $1 
    WHERE student_id = $2`;

const CHECK_CAR_PLATE_AND_STUDENT_ASSIGNMENT = `
    SELECT 'car_exists' AS reason FROM cars WHERE car_plate = $1
    UNION ALL
    SELECT 'car_assigned' AS reason FROM students WHERE student_id = $2 AND car_plate_fk IS NOT NULL`;




//dump
const SELECT_CAR_BY_STUDENT_ID = `
    SELECT car_plate_fk 
    FROM students 
    WHERE student_id = $1 
`; //what is this??



const SELECT_CAR_BY_STUDENT_ID_AND_PLATE = `
    SELECT * 
    FROM cars 
    WHERE car_plate = $1 
    AND car_plate = (SELECT car_plate_fk FROM students WHERE student_id = $2)
`; //what does this do actually
const UPDATE_CAR = `
    UPDATE cars
    SET car_plate = COALESCE($1, car_plate),
        make = COALESCE($2, make),
        model = COALESCE($3, model),
        colour = COALESCE($4, colour)
    WHERE car_plate = $5;
`;





module.exports={
    SELECT_STUDENT_BY_ID,
    SELECT_CAR_BY_PLATE, 
    SELECT_CAR_BY_STUDENT_ID_AND_PLATE,
    SELECT_CAR_BY_STUDENT_ID, 

    INSERT_NEW_STUDENT,
    INSERT_NEW_CAR,
    
    UPDATE_STUDENT_CAR_FK,
    UPDATE_CAR,
    CHECK_CAR_PLATE_AND_STUDENT_ASSIGNMENT, 
};