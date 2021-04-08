<?php
    session_start();
    if ((!isset($_POST['u_name']) || !isset($_POST['u_pass']) || !isset($_POST['fname']) || !isset($_POST['lname']) || !isset($_POST['gender']) || !isset($_POST['cnumber']) || !isset($_POST['email']) || !isset($_POST['role'])) && !isset($_GET['check_u_name_availability'])) {
        header('location: ../home.php');
        exit;
    }
    
    $con = mysqli_connect("localhost", "root", "", "vsu_i_ris");
    if (!$con)
        exit(mysqli_connect_error());


    if (isset($_GET['check_u_name_availability'])) {
        if ($stmt = $con->prepare('SELECT u_id FROM users WHERE u_name = "'.$_GET['check_u_name_availability'].'"')) {
            $stmt->execute();
            $stmt->store_result();
            if ($stmt->num_rows() <= 0) {
                echo 'Username available!';
            }
            else {
                echo 'Username already taken!';
            }
        }
        else {
            echo mysqli_error($con);
        }
    }
    else {
        $hashed_pass = password_hash($_POST['u_pass'], PASSWORD_BCRYPT, array('cost' => 10));

        if ($stmt = $con->prepare('INSERT INTO users (u_name, u_pass, fname, lname, gender, cnumber, email, role, status) values (?, ?, ?, ?, ?, ?, ?, ?, "ACTIVE")')) {
            $stmt->bind_param('ssssssss', $_POST['u_name'], $hashed_pass, $_POST['fname'], $_POST['lname'], $_POST['gender'], $_POST['cnumber'], $_POST['email'], $_POST['role']);
            if ($stmt->execute()) {
                echo    '<div class="modal-body alert alert-success m-0" role="alert">
                            <h4 class="alert-heading">Congrats!</h4>
                            <p class="text-dark">Your account was created successfully. We will automatically redirect you to the login page or click the link below.</p>
                            <hr>
                            <a class="mb-0" href="../login.php">Click here to proceed to the login page</a>
                        </div>';
                remove_from_pending_registration($con);
            }
            else
                echo mysqli_error($con);
        }
        else
            echo mysqli_error($con);
        $con->close();
        exit;
    }




    function remove_from_pending_registration($con) {
        if ($stmt=$con->prepare('SELECT reg_id FROM pending_registration WHERE email = "'.$_POST['email'].'"')) {
            if ($stmt->execute()) {
                $result = $stmt->get_result();
                //--- remove pending tracker record for reg_id to avoid foregin key constrains ---//
                //--- then remove reg_id from pending registration ---//
                while ($row = $result->fetch_assoc()) {
                    $stmt = $con->prepare('DELETE FROM pending_registration_tracker WHERE reg_id = '.$row['reg_id'].'');
                    $stmt->execute();
                    $stmt = $con->prepare('DELETE FROM pending_registration WHERE reg_id = '.$row['reg_id'].'');
                    $stmt->execute();
                }
                session_unset();
                session_destroy();
            }
            else
                echo mysqli_error($con);
        }
        else
            echo mysqli_error($con);
    }
?>