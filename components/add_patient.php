<?php
    session_start();
    if (!isset($_POST['x_ray_no']) && !isset($_POST['inf_no']) && !isset($_POST['or_no']) && !isset($_POST['patient_fname']) && !isset($_POST['patient_lname']) && !isset($_POST['b_date']) && !isset($_POST['exam_date']) && !isset($_POST['patient_gender']) && !isset($_POST['age']) && !isset($_POST['patient_cnumber']) && !isset($_POST['patient_lname']) && !isset($_POST['standing_or_status']) && !isset($_POST['physician']) && !isset($_POST['procedure']) && !isset($_POST['film_size'])) {
        header('location: ../home.php');
        exit;
    }
    
    $con = mysqli_connect("localhost", "root", "", "vsu_i_ris");
    if (!$con)
        exit(mysqli_connect_error());
    

    $patient_id = '';
    $fname = strtolower($_POST['patient_fname']);
    $lname = strtolower($_POST['patient_lname']);
    $history_or_purpose = strtolower($_POST['history_or_purpose']);

//--- first check if patient already exist else insert patient --------------------------------------------------------------------------------------------------//
    if ($stmt=$con->prepare('SELECT id FROM patients WHERE fname = ? && lname = ?')) {
        $stmt->bind_param('ss', $fname, $lname);
        if ($stmt->execute()) {
            $stmt->store_result();
            if ($stmt->num_rows() > 0) {
                $stmt->bind_result($patient_id);
                $stmt->fetch();
            }
        }
    }
    if ($patient_id == '') {
        if ($stmt = $con->prepare('INSERT INTO patients(fname, lname, b_date, age, gender, standing_or_status, cnumber) values(?,?,?,?,?,?,?)')) {
            $stmt->bind_param('sssssss', $fname, $lname, $_POST['b_date'], $_POST['age'], $_POST['patient_gender'], $_POST['standing_or_status'], $_POST['patient_cnumber']);
            if ($stmt->execute()) {
                $patient_id = $con->insert_id;
            }
        }
    }

    //--- second insert examination --------------------------------------------------------------------------------------------------//
    if ($stmt = $con->prepare('INSERT INTO examination(x_ray_no, inf_no, or_no, date, patient_id, history_or_purpose, physician_id, no_of_film_spoilage, reason_for_spoilage, radtech_id) values(?,?,?,?,?,?,?,?,?,?)')) {
        $stmt->bind_param('sssssssss', $_POST['x_ray_no'], $_POST['inf_no'], $_POST['or_no'], $_POST['exam_date'], $patient_id, $history_or_purpose, $_POST['physician'], $_POST['no_of_film_spoilage'], $_POST['reason_for_spoilage'], $_SESSION['uid']);
        if ($stmt->execute()) {
            $procedures_used = explode(', ', $_POST['procedure']);
            $film_sizes_used = explode(', ', $_POST['film_size']);
            //--- third insert procedure --------------------------------------------------------------------------------------------------//
            $index = 0;
            $inserted = true;
            foreach ($procedures_used as $procedure) {
                $procedure = explode(' ', $procedure);
                if ($stmt = $con->prepare('INSERT INTO procedures(x_ray_no, type, views, film_size) values(?,?,?,?)')) {
                    $stmt->bind_param('ssss', $_POST['x_ray_no'], $procedure[0], $procedure[1], $film_sizes_used[$index]);
                    if (!$stmt->execute())
                        $inserted = false;
                }
                else
                    $inserted = false;
                if (isset($film_sizes_used[$index+1]))
                    $index++;
            }
            if ($inserted) {
                echo 'Success!';
                $con->close();
                exit;
            }
            else
                echo 'Failed to add the patient! (error code: #45-#56)';
        }
        else
            echo 'X-ray number already exist!';
    }



    //delete patient if there is an error inserting from tables
    //if patient already exist this will not take effect because of foreign key checks which is what we want
    //we only want to delete the newly created patient
    //no need to bind_param since $patient_id is the auto_increment from the table
    $stmt = $con->prepare('DELETE from patients WHERE id = '.$patient_id.'');
    if ($stmt->execute()) {
        $stmt=$con->prepare('ALTER TABLE patients AUTO_INCREMENT = '.$patient_id.'');
        $stmt->execute();
    }
    $con->close();
    exit;

    
   
?>