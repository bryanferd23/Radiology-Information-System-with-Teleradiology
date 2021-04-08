<?php
    session_start();
    if (!isset($_GET['logout'])) 
        header("location: ../home.php");
    else {
        session_unset();
        session_destroy();
        echo "login.php";
    }
    exit;
?>