<?php
    session_start();
    if (!isset($_GET['profile_info']) && !isset($_GET['u_id']) && !isset($_GET['contacts']) && !isset($_GET['user_list'])) {
        header('location: ../home.php');
        exit;
    }
    
    $con = mysqli_connect("localhost", "root", "", "vsu_i_ris");
    if (!$con)
        exit(mysqli_connect_error());

    
    if (isset($_GET['contacts'])) {
        $stmt = $con->prepare('SELECT * FROM users WHERE role="Radiologic technologist" && status="ACTIVE" LIMIT 1');
    }
    else if (isset($_GET['u_id'])) {
        $stmt = $con->prepare('SELECT * FROM users WHERE u_id= ?');
        $stmt->bind_param('i', $_GET['u_id']);
    }
    else if (isset($_GET['user_list'])) {
        $stmt = $con->prepare('SELECT u_id, fname, email, role, status FROM users ORDER BY u_id ASC');
    }
    else {
        $stmt = $con->prepare('SELECT * FROM users WHERE u_id= ?');
        $stmt->bind_param('i', $_SESSION['uid']);
    }
    
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            if (isset($_GET['user_list'])) {
                $array = array();
                while ($row = $result->fetch_assoc()) {
                    $array[] = $row;
                }
                echo json_encode($array);
            }
            else {
                $row = $result->fetch_assoc();
                $img_url = "resources/images/".$row['img_file']."?t=".time();
                echo json_encode(array(
                    "img_url" => $img_url,
                    "fname" =>  $row['fname'],
                    "lname" => $row['lname'],
                    "role" => $row['role'],
                    "email" => $row['email'],
                    "cnumber" => $row['cnumber'],
                    "gender" => $row['gender'],
                    "status" => $row['status']
                ));
            }
        }
        else
            echo json_encode(array('error' => 'no match'));
    }
    else
        echo mysqli_error($con);
    $con->close();
    exit;
?>