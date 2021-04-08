<?php
    session_start();
    if (!isset($_GET['status'])) {
        header('location: ../login.php');
        exit;
    }

    $con = mysqli_connect("localhost", "root", "", "vsu_i_ris");
    if (!$con)
        exit(mysqli_connect_error());
    
    echo 'Searching...!';
    $con->close();
    exit;
?>