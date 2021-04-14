<?php
    session_start();

    if (!isset($_GET['patient_list']) && !isset($_GET['known_date'])) {
        header('location: ../home.php');
        exit;
    }
    if (!isset($_SESSION['loggedin']))
        header("location: ../login.php");
    
    $con = mysqli_connect("localhost", "root", "", "vsu_i_ris");
    if (!$con)
        exit(mysqli_connect_error());
    
    //$today = date("Y-m-d");
    if (isset($_GET['known_date'])) {
        if ($stmt=$con->prepare('SELECT date from examination WHERE date < "'.$_GET['known_date'].'"')) {
            if ($stmt->execute()) {
                $stmt->store_result();
                if ($stmt->affected_rows > 0) {
                    $stmt->bind_result($date);
                    $stmt->fetch();
                    echo $date;
                }
                else
                    echo 'END';
                $con->close();
                exit;
            }
        }
    }
    if ($stmt=$con->prepare('SELECT 
                            x_ray_no, inf_no, or_no, date, patient_id, history_or_purpose, d.fname as d_fname, d.lname as d_lname, no_of_film_spoilage, reason_for_spoilage, p.fname as p_fname, p.lname as p_lname, b_date, age, gender, standing_or_status, cnumber 
                            FROM examination e INNER JOIN patients p, physicians d 
                            WHERE p.id = e.patient_id && physician_id = d.id && date = "'.$_GET['patient_list'].'"')) {
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $array = array();
            while ($row = $result->fetch_assoc()) {
                $array[] = $row;
            }
            echo json_encode($array);
            $con->close();
            exit;
        }
    }
    echo mysqli_errno($con);
    $con->close();
    exit;

?>