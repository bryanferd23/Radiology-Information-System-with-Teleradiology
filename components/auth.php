<?php
    session_start();
    date_default_timezone_set('Asia/Singapore');
    
    if (!isset($_POST['u_name']) && !isset($_POST['u_pass'])) {
        header('location: ../login.php');
        exit;
    }
    else {
        $con = mysqli_connect("localhost", "root", "", "vsu_i_ris");
        if (!$con)
            exit(mysqli_connect_error());
        else {
//----------------------------- check if username exist ---------------------------------------------------------//
            if ($stmt = $con->prepare('SELECT u_id, u_pass, status, img_file, role FROM users WHERE u_name = ?')){
                $stmt->bind_param('s',  $_POST['u_name']);
                $stmt->execute();
                $stmt->store_result();
                if ($stmt->num_rows() > 0){
                    $stmt->bind_result($uid, $upass, $status, $img_file, $role);
                    $stmt->fetch();
//---------------------------- check if account is active/disabled ------------------------------------------------//
                    if ($status == "ACTIVE") {

//---------------------------- hash session_id, remote_ip, and user_agent -----------------------------------------//
                        $session_id = substr(md5(session_id()), 0, 32);
                        $remote_ip = substr(md5($_SERVER['REMOTE_ADDR']), 0, 32);
                        $user_agent = substr(md5($_SERVER['HTTP_USER_AGENT']), 0, 32);
//---------------------------- fetch current login_tracker by the specific user ----------------------------------//
                        $stmt=$con->prepare('SELECT attempts, unlock_time FROM login_tracker WHERE u_id = ? OR session_id = ? AND remote_ip = ? AND user_agent = ?');
                        $stmt->bind_param('ssss', $uid, $session_id, $remote_ip, $user_agent);
                        $stmt->execute();
                        $stmt->store_result();
//---------------------------- if no record in login tracker table, will create one for added login security --------------------------------------//
                        if ($stmt->num_rows <= 0) {
                            $stmt=$con->prepare('INSERT INTO login_tracker (u_id, session_id, remote_ip, user_agent) values (?, ?, ?, ?)');
                            $stmt->bind_param('ssss', $uid, $session_id, $remote_ip, $user_agent);
                            $stmt->execute();
                            $attempts = 0; $unlock_time = 0;
                        }
                        else {
                            $stmt->bind_result($attempts, $unlock_time);
                            $stmt->fetch();
                        }
//--------------------------- check the login tracker table if the user had exhaust his/her login attempts -------------------------------------//
//--------------------------- If 10/10 attempts the user that is trying to log in will be blocked temporarily---------------------------//
                        if ($attempts >= 10) {
                            if ($unlock_time == 0) {
                                $unlock_time = time() + 60*5;
                                $stmt=$con->prepare('UPDATE login_tracker SET unlock_time = ? WHERE u_id = ? OR session_id = ? AND remote_ip = ? AND user_agent = ?');
                                $stmt->bind_param('sssss', $unlock_time, $uid, $session_id, $remote_ip, $user_agent);
                                $stmt->execute();
                                $con->close();
                                exit('Too many login attempts. Please try again later.');
                            }
                            else if ($unlock_time <= time()) {
                                $stmt=$con->prepare('UPDATE login_tracker SET attempts = "0", unlock_time = "0" WHERE u_id = ? OR session_id = ? AND remote_ip = ? AND user_agent = ?');
                                $stmt->bind_param('ssss', $uid, $session_id, $remote_ip, $user_agent);
                                $stmt->execute();
                                $attempts = 0; $unlock_time = 0;
                            }
                            else {
                                $con->close();
                                exit('Too many login attempts. Please try again later.');
                            }
                        }
//-------------------------- verify password. If successfull resets the user attempts ------------------------------------------------------------------------------------//                        
                        if (password_verify($_POST['u_pass'], $upass)) {
                            $stmt=$con->prepare('UPDATE login_tracker SET attempts = "0" WHERE u_id = ? OR session_id = ? AND remote_ip = ? AND user_agent = ?');
                            $stmt->bind_param('ssss', $uid, $session_id, $remote_ip, $user_agent);
                            $stmt->execute();
                            session_regenerate_id();
                            $_SESSION['loggedin'] = time();
                            $_SESSION['uid'] = $uid;
                            $_SESSION['u_name'] = $_POST['u_name'];
                            $_SESSION['img_file'] = $img_file;
                            $_SESSION['role'] = $role;
                            echo 'home.php';
                        }
//------------------------- Wrong password will increase the user attempt by 1 ------------------------------------------------------------------------------------------//
                        else {
                            $attempts+=1;
                            $stmt=$con->prepare('UPDATE login_tracker SET attempts = ? WHERE u_id = ? OR session_id = ? AND remote_ip = ? AND user_agent = ?');
                            $stmt->bind_param('sssss',$attempts , $uid, $session_id, $remote_ip, $user_agent);
                            $stmt->execute();
                            echo 'Incorrect password!';
                        }
                    }
                    else
                        echo 'Your account is disabled. Please contact the admin right away!';
                }
                else
                    echo 'Incorrect username!';
            }
            else
                echo mysqli_error($con);
            $con->close();
        }
    }
    exit;
?>