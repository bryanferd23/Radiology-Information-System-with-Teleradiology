<?php
    session_start();

    if (!isset($_POST['x_ray_no']) && !isset($_GET['results_by_x_ray_no']) && !isset($_POST['update']) && !isset($_POST['procedure_type'])) {
        header('location: ../home.php');
        exit;
    }
    
    $con = mysqli_connect("localhost", "root", "", "vsu_i_ris");
    if (!$con)
        exit(mysqli_connect_error());

    //update x-ray result
    if (isset($_POST['update'])) {
        if ($stmt = $con->prepare('SELECT id FROM procedures WHERE x_ray_no = ? && type = ?')) {
            $stmt->bind_param('ss', $_POST['update'], $_POST['procedure_type']);
            if ($stmt->execute()) {
                $stmt->store_result();
                $stmt->bind_result($procedure_id);
                $stmt->fetch();
                if ($stmt = $con->prepare('UPDATE x_ray_results SET findings = ?, diagnosis = ?, radiologist_id = ? WHERE procedure_id = ?')) {
                    $stmt->bind_param('ssii', $_POST['findings'], $_POST['diagnosis'], $_SESSION['uid'], $procedure_id);
                    if ($stmt->execute()) {
                        echo 'Success!';
                    }
                }
            }
        }
    }
    //get the x-ray result with x-ray no. of..
    if (isset($_GET['results_by_x_ray_no'])) {
        if ($stmt = $con->prepare('SELECT EX.inf_no, EX.x_ray_no, EX.date, PT.lname as p_lname, PT.fname as p_fname, PT.age, PT.gender, D.fname as d_fname, D.lname as d_lname, P.type, P.views, XR.findings, XR.diagnosis, EX.radtech_id, XR.radiologist_id 
                                    FROM examination EX, physicians D, patients PT, procedures P, x_ray_results XR 
                                    WHERE EX.x_ray_no = P.x_ray_no && P.id = XR.procedure_id && EX.physician_id = D.id && PT.id = EX.patient_id && EX.x_ray_no = ?')) {
            $stmt->bind_param('s', $_GET['results_by_x_ray_no']);
            if ($stmt->execute()) {
                $result = $stmt->get_result();
                $array = Array();
                while ($row = $result->fetch_assoc()) {
                    $stmt = $con->prepare('SELECT fname as radtech_fname, lname as radtech_lname FROM users WHERE u_id = '.$row['radtech_id'].'');
                    $stmt->execute();
                    $result2 = $stmt->get_result();
                    $row2 = $result2->fetch_assoc();

                    $stmt = $con->prepare('SELECT fname as radiologist_fname, lname as radiologist_lname FROM users WHERE u_id = '.$row['radiologist_id'].'');
                    $stmt->execute();
                    $result3 = $stmt->get_result();
                    $row3 = $result3->fetch_assoc();
                    $array[] = array_merge($row,$row2,$row3);
                }
                echo json_encode($array);
            }
        }
    }
    //add an x-ray result/s
    if (isset($_POST['x_ray_no']) && isset($_POST['type'])) {
        if ($stmt = $con->prepare('SELECT id FROM procedures WHERE x_ray_no = ? && type = ?')) {
            $stmt->bind_param('ss', $_POST['x_ray_no'], $_POST['type']);
            if ($stmt->execute()) {
                $stmt->store_result();
                $stmt->bind_result($id);
                $stmt->fetch();

                if ($stmt = $con->prepare('SELECT * FROM x_ray_results WHERE procedure_id = '.$id.'')) {
                    if ($stmt->execute()) {
                        $stmt->store_result();
                        if ($stmt->num_rows > 0)
                            echo 'Reading already added!';
                        else {
                            if ($stmt = $con->prepare('INSERT INTO x_ray_results (procedure_id, findings, diagnosis, radiologist_id) values(?, ?, ?, ?)')) {
                                $stmt->bind_param('issi', $id, $_POST['findings'], $_POST['diagnosis'], $_SESSION['uid']);
                                if ($stmt->execute()) {
                                    echo 'Success!';
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    echo mysqli_error($con);
    $con->close();
    exit;
?>