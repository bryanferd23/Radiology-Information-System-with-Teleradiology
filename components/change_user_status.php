<?php
    session_start();

    if ($_SESSION['uid'] != 1 || $_SESSION['uid'] != '1' || !isset($_POST['change_status_to']) || !isset($_POST['u_id'])) {
        header('location: ../home.php');
        exit;
    }
        
    $con = mysqli_connect("localhost", "root", "", "vsu_i_ris");
    if (!$con)
        exit(mysqli_connect_error());
    
    if ($stmt=$con->prepare('UPDATE users SET status = "'.$_POST['change_status_to'].'" WHERE u_id = '.$_POST['u_id'].'')) {
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0)
                echo 'Success!';
            else
                echo 'Failed to change the user\'s status!';
        }
    }
    echo mysqli_error($con);
    $con->close();
    exit;

    
?>