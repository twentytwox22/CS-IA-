async function addCar(req, res) {
    const { car_plate, make, model, colour } = req.body;
    let errors = [];
   
    console.log("Received car details:", car_plate, make, model, colour);
    // console.log("Student ID from session:" + req.user.student_id);

    //error handling
        // Check if the car already exists to prevent duplicate entries
        const existingStudentCar = await pool.query(
            queries.SELECT_STUDENT_CAR_ID, [req.user.student_id]
        );
        if (existingStudentCar.rows.length > 0) {
            errors.push({ message: "You already have a car assigned. Only one car per student is allowed." });
        }

        // Check if the car plate already exists in the database
        const existingCarResult = await pool.query(
          queries.SELECT_CAR_BY_PLATE, [car_plate]
        );
        if (existingCarResult.rows.length > 0) {
            errors.push({ message: `A car with plate number '${car_plate}' already exists.` });
        }

    if (errors.length > 0) {
        console.log("Errors detected:", errors);
        return res.render("dashboard", { errors });
    } else { 

        // If car does not exist, add the new car
        const result = await pool.query(
            queries.INSERT_NEW_CAR, [car_plate, make, model, colour]
        );
        // Update the student's car_id after successfully adding the car
        await pool.query(
            queries.UPDATE_STUDENT_CAR_ID, [car_plate, req.user.student_id]
        );

        // Log and flash success message
        console.log("Car added:", result.rows);
        req.flash('success_msg', "Car successfully added");
        res.redirect("/students/dashboard");
    }
}  
