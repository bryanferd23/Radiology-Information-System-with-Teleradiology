<?php
    use PHPMailer\PHPMailer\PHPMailer;
    //Load Composer's autoloader
    require '../vendor/autoload.php';
    session_start();

    if (!isset($_POST['reg_code']) && !isset($_POST['email']) && !isset($_POST['role']) && !isset($_POST['check_email_availability'])) {
        header('location: ../home.php');
        exit;
    }
    
    $con = mysqli_connect("localhost", "root", "", "vsu_i_ris");
    if (!$con)
        exit(mysqli_connect_error());

    if (isset($_POST['check_email_availability'])) {
        check_email_availability($con, $_POST['check_email_availability']);
    }
    
    if ($stmt = $con->prepare('INSERT INTO pending_registration (email, reg_code, role) values (?, ?, ?)')){
        $reg_code = password_hash($_POST['reg_code'], PASSWORD_BCRYPT, array('cost' => 10));
        $stmt->bind_param('sss', $_POST['email'], $reg_code, $_POST['role']);
        if ($stmt->execute()) {
            if (send_email($_POST['email'], $_POST['reg_code'], $_POST['role'], $con))
                echo 'Success!';
            else {
                $stmt = $con->prepare('DELETE from pending_registration WHERE email = "'.$_POST['email'].'"');
                $stmt->execute();
                echo 'Failed to send an email! Please make sure you have a working internet connection!';
            }
        }
        else
            echo mysqli_error($con);
    }
    else 
        echo mysqli_error($con);
    $con->close();
    exit;

    function check_email_availability($con, $email) {
        if ($stmt=$con->prepare('SELECT reg_id FROM pending_registration WHERE email = "'.$email.'"')) {
            if ($stmt->execute()) {
                $stmt->store_result();
                if ($stmt->num_rows() > 0) {
                    echo 'Registration was already sent to this email!';
                    $con->close();
                    exit;
                }
                else{
                    if ($stmt=$con->prepare('SELECT u_id FROM users WHERE email = "'.$email.'"')) {
                        if ($stmt->execute()) {
                            $stmt->store_result();
                            if ($stmt->num_rows() > 0)
                                echo 'Email is already taken!';
                            else
                                echo 'Email available!';
                            $con->close();
                            exit;
                        }
                    }
                }
            }
        }
        echo mysqli_error($con);
        $con->close();
        exit;
    }

    function send_email($email, $reg_code, $role, $con) {
        $domain_name =  $_SERVER['HTTP_HOST'];
        $file = "registration.php";
        $registration_page = $domain_name.'/'.$file.'?reg_id='.$con->insert_id;
        $sender_email = 'ris.email.system@gmail.com';
        $sender_pass = 'ris.email.system@gmail.com123';
        $sender_name = 'RISystem';
        $message_html = '<i>This is an automated message. Please do not reply to this email.</i>
                        <hr>
                        <p>Hi there,</p>
                        <p>The current admin of the VSU infirmary has granted you the permission to create an <br> account to their Radiological Information System as a new <b>'.$role.'</b>. <br><br>
                        Proceed to registration page by clicking this link: <a href="https://'.$registration_page.'">https://'.$registration_page.'</a> <br>
                        To unlock the registration page, use this code: <b>'.$reg_code.'</b></p>';

        // passing true in constructor enables exceptions in PHPMailer
        $mail = new PHPMailer(true);
        // Server settings
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        $mail->Username = $sender_email; // YOUR gmail email
        $mail->Password = $sender_pass; // YOUR gmail password

        // Sender and recipient settings
        $mail->setFrom($sender_email, $sender_name);
        $mail->addAddress($email, '');
        $mail->addReplyTo($sender_email, $sender_name); // to set the reply to

        // Setting the email content
        $mail->IsHTML(true);
        $mail->Subject = "Register to RISystem now!";
        $mail->Body = $message_html;

        try {
            if ($mail->send() == true)
                return true;
        }catch (Exception) {
            return false;
        }
    }
?>