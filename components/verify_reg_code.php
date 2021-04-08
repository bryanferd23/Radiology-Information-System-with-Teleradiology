<?php
    session_start();
    date_default_timezone_set('Asia/Singapore');

    if (!isset($_POST['reg_code']) || !isset($_SESSION['reg_id'])) {
        header('location: ../registration.php');
        exit;
    }
    
    $con = mysqli_connect("localhost", "root", "", "vsu_i_ris");
    if (!$con)
        exit(mysqli_connect_error());

    $session_id = substr(md5(session_id()), 0, 31);
    $remote_ip = substr(md5($_SERVER['REMOTE_ADDR']), 0, 31);
    $user_agent = substr(md5($_SERVER['HTTP_USER_AGENT']), 0, 31);
    $reg_id = $_SESSION['reg_id'];

    $stmt=$con->prepare('SELECT attempts, unlock_time FROM pending_registration_tracker WHERE reg_id = ? OR session_id = ? AND remote_ip = ? AND user_agent = ?');
    $stmt->bind_param('ssss', $reg_id, $session_id, $remote_ip, $user_agent);

    if ($stmt->execute()) {
        $stmt->store_result();
        if ($stmt->num_rows <= 0) {
            $stmt=$con->prepare('INSERT INTO pending_registration_tracker (reg_id, session_id, remote_ip, user_agent) values (?, ?, ?, ?)');
            $stmt->bind_param('ssss', $reg_id, $session_id, $remote_ip, $user_agent);
            if ($stmt->execute()) {
                $attempts = 0; $unlock_time = 0;
            }
            else {
                echo mysqli_error($con);
                $con->close();
                exit;
            }
        }
        else {
            $stmt->bind_result($attempts, $unlock_time);
            $stmt->fetch();
        }

        if ($attempts >= 10) {
            if ($unlock_time == 0) {
                $unlock_time = time() + 60*5;
                $stmt=$con->prepare('UPDATE pending_registration_tracker SET unlock_time = ? WHERE reg_id = ? OR session_id = ? AND remote_ip = ? AND user_agent = ?');
                $stmt->bind_param('sssss', $unlock_time, $reg_id, $session_id, $remote_ip, $user_agent);
                $stmt->execute();
                $con->close();
                exit('Too many attempts. Please try again later.');
            }
            else if ($unlock_time <= time()) {
                $stmt=$con->prepare('UPDATE pending_registration_tracker SET attempts = "0", unlock_time = "0" WHERE reg_id = ? OR session_id = ? AND remote_ip = ? AND user_agent = ?');
                $stmt->bind_param('ssss', $reg_id, $session_id, $remote_ip, $user_agent);
                $stmt->execute();
                $attempts = 0; $unlock_time = 0;
            }
            else {
                $con->close();
                exit('Too many login attempts. Please try again later.');
            }
        }

        $stmt=$con->prepare('SELECT email, reg_code, role FROM pending_registration WHERE reg_id = '.$reg_id.'');
        if ($stmt->execute()) {
            $stmt->store_result();
            if ($stmt->num_rows() > 0) {
                $stmt->bind_result($email, $reg_code, $role);
                $stmt->fetch();
                if (password_verify($_POST['reg_code'], $reg_code)) {
                    $stmt=$con->prepare('UPDATE pending_registration_tracker SET attempts = "0" WHERE reg_id = ? OR session_id = ? AND remote_ip = ? AND user_agent = ?');
                    $stmt->bind_param('ssss', $reg_id, $session_id, $remote_ip, $user_agent);
                    $stmt->execute();
                    $_SESSION['reg_unlock'] = $reg_id;
                    $_SESSION['role'] = $role;
                    $_SESSION['email'] = $email;
                    echo 'Success!';
                }
                else {
                    $attempts+=1;
                    $stmt=$con->prepare('UPDATE pending_registration_tracker SET attempts = ? WHERE reg_id = ? OR session_id = ? AND remote_ip = ? AND user_agent = ?');
                    $stmt->bind_param('sssss', $attempts , $reg_id, $session_id, $remote_ip, $user_agent);
                    $stmt->execute();
                    echo 'Incorrect password!';
                }
            }
            else
                echo 'invalid reg_id';
        }
        else
            echo mysqli_error($con);
    }
    else
        echo mysqli_error($con);
    $con->close();
    exit;
?>