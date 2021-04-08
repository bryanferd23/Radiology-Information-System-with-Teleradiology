<?php
    session_start();
    error_reporting(E_ERROR | E_PARSE);
    if (!isset($_POST['old_u_pass']) && !isset($_POST['new_u_pass2']) && !isset($_POST['fname']) && !isset($_POST['lname']) && !isset($_POST['edit-profile-email']) && !isset($_POST['cnumber']) && !isset($_POST['gender']) && !isset($_POST['change_status_to']) && !isset($_POST['u_id'])) {
        header('location: ../home.php');
        exit;
    }

    $con = mysqli_connect("localhost", "root", "", "vsu_i_ris");
    if (!$con)
        exit(mysqli_connect_error());
    //--- changing pass ---//
    if (isset($_POST['old_u_pass']) && isset($_POST['new_u_pass2'])) {
        //--- check old pass if valid ---//
        if (old_pass_valid($con)) {
            //--- change pass ---//
            if (change_pass($con))
                echo 'Success!';
            else
                echo 'Your u_id is invalid. Please contact technical support immediately';
        }
        else
            echo 'Old password is invalid!';
    }
    else{
        //--- updating profile ---//
        if (update_user_profile($con))
            echo 'Success!';
        else
            echo 'Failed! u_id is invalid..';
    }
    $con->close();
    exit;



    
    function change_pass($con) {
        $hashed_pass = password_hash($_POST['new_u_pass2'], PASSWORD_BCRYPT, array('cost' => 10));

        if($stmt = $con->prepare('UPDATE users SET u_pass = "'.$hashed_pass.'" WHERE u_id = '.$_SESSION['uid'].'')) {
            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) 
                    return true;
                else
                    return false;
            }
        }
        echo mysqli_error($con);
        $con->close();
        exit;
    }

    function old_pass_valid($con) {
        $upass = '';
        if($stmt = $con->prepare('SELECT u_pass FROM users WHERE u_id = '.$_SESSION['uid'].'')) {
            if ($stmt->execute()) {
                $stmt->store_result();
                if ($stmt->num_rows() > 0) {
                    $stmt->bind_result($upass);
                    $stmt->fetch();
                    if (password_verify($_POST['old_u_pass'], $upass))
                        return true;
                    else
                        return false;
                }
                else {
                    echo 'Your u_id can\'t be found!. Please contact technical support immediately';
                    $con->close();
                    exit;
                }
            }
        }
        echo mysqli_error($con);
        $con->close();
        exit;
    }


    function update_user_profile($con) {
        $u_id = $_SESSION['uid'];
        $stmt = "UPDATE users SET ";

        //--- for update status ---//
        if (isset($_POST['change_status_to']) && isset($_POST['u_id'])) {
            $stmt .= 'status="'.$_POST['change_status_to'].'"';
            $u_id = $_POST['u_id'];
        }
        else {
            //--- for update profile ---//
            if ($_POST['fname'] != '')
                $stmt .= 'fname="'.$_POST['fname'].'",';
            if ($_POST['lname'] != '')
                $stmt .= 'lname="'.$_POST['lname'].'",';
            if ($_POST['edit-profile-email'] != '')
                $stmt .= 'email="'.$_POST['edit-profile-email'].'",';
            if ($_POST['cnumber'] != '')
                $stmt .= 'cnumber="'.$_POST['cnumber'].'",';
            $stmt .= 'gender="'.$_POST['gender'].'"';
        }
            
        //--- if a file is uploaded check and validate the file and add to statement ---//
        if ($_FILES['customFile']['error'] == 0 && $_FILES['customFile']['name'] != ''){
            $uploadto = '../resources/images/';
            $uploaded_filename = $_FILES['customFile']['name'];
            $uploaded_file = $_FILES['customFile']['tmp_name'];
            $uploaded_filesize = $_FILES['customFile']['size'];
            $extension = (pathinfo($uploaded_filename))['extension'];
            $new_filename = $u_id.'.'.$extension;
            
            if (!check_file_uploaded_name($uploaded_filename)) {
                $con->close();
                exit('Image name should be composed of [a-z, A-Z, 0-9, -_/.] only!');
            }
            else if (!check_file_uploaded_length($uploaded_filename)) {
                $con->close();
                exit('Image name is too long!');
            }
            else if (!check_file_uploaded_size( $uploaded_filesize)) {
                $con->close();
                exit('Image size too large! Please select an image 2mb and below..');
            }
            else {
                $stmt .= ',img_file="'.$new_filename.'"';
                //--- change file name to "none" since updating the column with the same data (filename) will result to affected rows = 0 ---//
                $query = $con->prepare('UPDATE users SET img_file = "none" WHERE u_id = '.$u_id.'');
                $query->execute();
                if (!move_uploaded_file($uploaded_file, $uploadto.$new_filename))
                    echo 'File upload failed!';
            }
        }

        $stmt .= ' WHERE u_id = '.$u_id.'';
        if ($stmt = $con->prepare($stmt)) {
            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0)
                    return true;
                else
                    return false;
            }
        }
        echo mysqli_error($con);
        $con->close();
        exit;
    }

    //--- validate image file ---//
    function check_file_uploaded_name ($filename){
        return ((preg_match('`^[-0-9A-Za-z_\.]+$`i',$filename)) ? true : false);
    }
    function check_file_uploaded_length ($filename){
        return ((mb_strlen($filename,'UTF-8') < 225) ? true : false);
    }
    function check_file_uploaded_size ($size){
        return (($size < 2097152) ? true : false);
    }
?>