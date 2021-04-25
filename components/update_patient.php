<?php
    session_start();
    if (!isset($_POST['update_patient']) && $_SESSION['role'] != "Radiologic technologist") {
        header('location: ../home.php');
        exit;
    }
    
    $con = mysqli_connect("localhost", "root", "", "vsu_i_ris");
    if (!$con)
        exit(mysqli_connect_error());
    
    $x_ray_no = $_SESSION['prev_x_ray_no'];

    if (isset($_POST['patient-info-x_ray_no'])) {
        $stmt=$con->prepare('SELECT * FROM examination WHERE x_ray_no = ?');
        $stmt->bind_param('s', $_POST['patient-info-x_ray_no']);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows() > 0) {
            echo 'X-ray number already exist!';
            $con->close();
            exit;
        }
        else {
            $con->query('SET foreign_key_checks = 0');
            $stmt = $con->prepare('UPDATE procedures SET x_ray_no = ? WHERE x_ray_no = ?');
            $stmt->bind_param('ss', $_POST['patient-info-x_ray_no'], $x_ray_no);
            $stmt->execute();
            $stmt=$con->prepare('UPDATE examination SET x_ray_no = ? WHERE x_ray_no = ?');
            $stmt->bind_param('ss', $_POST['patient-info-x_ray_no'], $x_ray_no);
            $stmt->execute();
            $con->query('SET foreign_key_checks = 1');
            $x_ray_no = $_POST['patient-info-x_ray_no'];
        }
    }
    if (mysqli_error($con)) {
        echo mysqli_error($con);
        $con->close();
        exit;
    }
    if (isset($_POST['patient-info-inf_no'])) {
        $stmt=$con->prepare('UPDATE examination SET inf_no = ? WHERE x_ray_no = ?');
        $stmt->bind_param('ss', $_POST['patient-info-inf_no'], $x_ray_no);
        $stmt->execute();
    }
    if (isset($_POST['patient-info-or_no'])) {
        $stmt=$con->prepare('UPDATE examination SET or_no = ? WHERE x_ray_no = ?');
        $stmt->bind_param('ss', $_POST['patient-info-or_no'], $x_ray_no);
        $stmt->execute();
    }
    if (mysqli_error($con)) {
        echo mysqli_error($con);
        $con->close();
        exit;
    }
    if (isset($_POST['patient-info-exam_date'])) {
        $stmt=$con->prepare('UPDATE examination SET date = ? WHERE x_ray_no = ?');
        $stmt->bind_param('ss', $_POST['patient-info-exam_date'], $x_ray_no);
        $stmt->execute();
    }
    if (mysqli_error($con)) {
        echo mysqli_error($con);
        $con->close();
        exit;
    }
    if (isset($_POST['patient-info-patient_fname']) || isset($_POST['patient-info-patient_lname']) || isset($_POST['patient-info-b_date']) || isset($_POST['patient-info-patient_gender']) || isset($_POST['patient-info-patient_cnumber']) || isset($_POST['patient-info-standing_or_status'])) {
        //--- before updating the patient table, get the patient_id ---//
        $stmt=$con->prepare('SELECT patient_id FROM examination WHERE x_ray_no = ?');
        $stmt->bind_param('s', $x_ray_no);
        $stmt->execute();
        $stmt->store_result();
        $stmt->bind_result($patient_id);
        $stmt->fetch();
        
        if (mysqli_error($con)) {
            echo mysqli_error($con);
            $con->close();
            exit;
        }
        //update patient table
        if (isset($_POST['patient-info-patient_fname'])) {
            $fname = strtolower($_POST['patient-info-patient_fname']);
            $stmt=$con->prepare('UPDATE patients SET fname = ? WHERE id = ?');
            $stmt->bind_param('si', $fname, $patient_id);
            $stmt->execute();
        }
        if (mysqli_error($con)) {
            echo mysqli_error($con);
            $con->close();
            exit;
        }
        if (isset($_POST['patient-info-patient_lname'])) {
            $lname = strtolower($_POST['patient-info-patient_lname']);
            $stmt=$con->prepare('UPDATE patients SET lname = ? WHERE id = ?');
            $stmt->bind_param('si', $lname, $patient_id);
            $stmt->execute();
        }
        if (mysqli_error($con)) {
            echo mysqli_error($con);
            $con->close();
            exit;
        }
        if (isset($_POST['patient-info-patient_gender'])) {
            $stmt=$con->prepare('UPDATE patients SET gender = ? WHERE id = ?');
            $stmt->bind_param('ii', $_POST['patient-info-patient_gender'], $patient_id);
            $stmt->execute();
        }
        if (mysqli_error($con)) {
            echo mysqli_error($con);
            $con->close();
            exit;
        }
        if (isset($_POST['patient-info-b_date'])) {
            $stmt=$con->prepare('UPDATE patients SET b_date = ?, age = ? WHERE id = ?');
            $stmt->bind_param('sii', $_POST['patient-info-b_date'], $_POST['patient-info-age'], $patient_id);
            $stmt->execute();
        }
        if (mysqli_error($con)) {
            echo mysqli_error($con);
            $con->close();
            exit;
        }
        if (isset($_POST['patient-info-patient_cnumber'])) {
            $stmt=$con->prepare('UPDATE patients SET cnumber = ? WHERE id = ?');
            $stmt->bind_param('si', $_POST['patient-info-patient_cnumber'], $patient_id);
            $stmt->execute();
        }
        if (mysqli_error($con)) {
            echo mysqli_error($con);
            $con->close();
            exit;
        }
        if (isset($_POST['patient-info-standing_or_status'])) {
            $stmt=$con->prepare('UPDATE patients SET standing_or_status = ? WHERE id = ?');
            $stmt->bind_param('ii', $_POST['patient-info-standing_or_status'], $patient_id);
            $stmt->execute();
        }
        if (mysqli_error($con)) {
            echo mysqli_error($con);
            $con->close();
            exit;
        }
    }
    if (isset($_POST['patient-info-history_or_purpose'])) {
        $stmt=$con->prepare('UPDATE examination SET history_or_purpose = ? WHERE x_ray_no = ?');
        $stmt->bind_param('ss', $_POST['patient-info-history_or_purpose'], $x_ray_no);
        $stmt->execute();
    }
    if (mysqli_error($con)) {
        echo mysqli_error($con);
        $con->close();
        exit;
    }
    if (isset($_POST['patient-info-physician'])) {
        $stmt=$con->prepare('UPDATE examination SET physician_id = ? WHERE x_ray_no = ?');
        $stmt->bind_param('is', $_POST['patient-info-physician'], $x_ray_no);
        $stmt->execute();
    }
    if (mysqli_error($con)) {
        echo mysqli_error($con);
        $con->close();
        exit;
    }
    if (isset($_POST['patient-info-no_of_film_spoilage'])) {
        $stmt=$con->prepare('UPDATE examination SET no_of_film_spoilage = ? WHERE x_ray_no = ?');
        $stmt->bind_param('is', $_POST['patient-info-no_of_film_spoilage'], $x_ray_no);
        $stmt->execute();
    }
    if (mysqli_error($con)) {
        echo mysqli_error($con);
        $con->close();
        exit;
    }
    if (isset($_POST['patient-info-reason_for_spoilage'])) {
        $stmt=$con->prepare('UPDATE examination SET reason_for_spoilage = ? WHERE x_ray_no = ?');
        $stmt->bind_param('is', $_POST['patient-info-reason_for_spoilage'], $x_ray_no);
        $stmt->execute();
    }
    if (mysqli_error($con)) {
        echo mysqli_error($con);
        $con->close();
        exit;
    }
    if (isset($_POST['patient-info-procedure']) || isset($_POST['patient-info-film_size'])) {
        //--- delete record from table first then insert ---//
        //--- this is becuase 1 x_ray_no has 1 or many procedures and if we do not delete all the records, the ratio will not match leaving data duplicates---//
        $stmt=$con->prepare('DELETE FROM procedures WHERE x_ray_no = ?');
        $stmt->bind_param('s', $x_ray_no);
        $stmt->execute();
        if (mysqli_error($con)) {
            echo mysqli_error($con);
            $con->close();
            exit;
        }
        $procedures_used = explode(', ', $_POST['patient-info-procedure']);
        $film_sizes_used = explode(', ', $_POST['patient-info-film_size']);
        //--- third insert procedure --------------------------------------------------------------------------------------------------//
        $index = 0;
        foreach ($procedures_used as $procedure) {
            $procedure = explode(' ', $procedure);
            $stmt = $con->prepare('INSERT INTO procedures(x_ray_no, type, views, film_size) values(?,?,?,?)');
            $stmt->bind_param('ssss', $x_ray_no, $procedure[0], $procedure[1], $film_sizes_used[$index]);
            $stmt->execute();
            
            if (isset($film_sizes_used[$index+1]))
                $index++;
        }
    }
    if (mysqli_error($con))
        echo mysqli_error($con);
    else
        echo "Success!";
    $con->close();
    exit;
?>