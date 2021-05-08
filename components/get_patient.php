<?php
    session_start();

    if (!isset($_GET['unknown_date']) && !isset($_GET['x_ray_no']) && !isset($_GET['lname']) && !isset($_GET['date']) && !isset($_GET['info'])) {
        header('location: ../home.php');
        exit;
    }
    if (!isset($_SESSION['loggedin']))
        header("location: ../login.php");
    
    $con = mysqli_connect("localhost", "root", "", "vsu_i_ris");
    if (!$con)
        exit(mysqli_connect_error());
    
    //$today = date("Y-m-d");
    if (isset($_GET['unknown_date'])) {
        if ($stmt=$con->prepare('SELECT date from examination WHERE date < ? ORDER BY date DESC LIMIT 1')) {
            $stmt->bind_param('s', $_GET['unknown_date']);
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

    if (isset($_GET['info'])){
        $stmt=$con->prepare('SELECT x_ray_no, inf_no, or_no, date, p.fname as p_fname, p.lname as p_lname, b_date, gender, cnumber, standing_or_status, history_or_purpose, d.fname as d_fname, d.lname as d_lname, specialization, no_of_film_spoilage, reason_for_spoilage 
                FROM examination e INNER JOIN patients p, physicians d 
                WHERE p.id = e.patient_id && physician_id = d.id && x_ray_no = ?');
                $stmt->bind_param('s', $_GET['info']);
    }
    else {
        $stmt='SELECT x_ray_no, fname as p_fname, lname as p_lname, date FROM examination INNER JOIN patients WHERE ';
        if (isset($_GET['x_ray_no'])) {
            $stmt .= 'patient_id = id && x_ray_no = ?';
            $stmt=$con->prepare($stmt);
            $stmt->bind_param('s', $_GET['x_ray_no']);
        }
        else if (isset($_GET['lname'])) {
            $stmt .= 'patient_id = id && lname = ?';
            $stmt=$con->prepare($stmt);
            $stmt->bind_param('s', $_GET['lname']);
        }
        else {
            $stmt .= 'patient_id = id && date = ?';
            $stmt=$con->prepare($stmt);
            $stmt->bind_param('s', $_GET['date']);
        }
    }
    
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $array = array();
        while ($row = $result->fetch_assoc()) {
            $array[] = $row;
        }
        if (isset($_GET['info'])) {
            $_SESSION['prev_x_ray_no'] = $_GET['info'];
            if ($stmt=$con->prepare('SELECT type, views, film_size FROM procedures WHERE x_ray_no = ?')) {
                $stmt->bind_param('s', $_GET['info']);
                if ($stmt->execute()) {
                    $result = $stmt->get_result();
                    $procedures = '';
                    $film_size = '';
                    while ($row = $result->fetch_assoc()) {
                        if ($film_size != $row["film_size"])
                            $film_size .= $row["film_size"].", ";
                        $procedures .= $row["type"];
                        $procedures .= " ".$row["views"].", ";
                    }
                    array_push($array[0], substr($procedures, 0, strlen($procedures)-2), substr($film_size, 0, strlen($film_size)-2));
                }
            }
        }
        echo json_encode($array);
    }
    else
        echo mysqli_errno($con);
    $con->close();
    exit;

?>