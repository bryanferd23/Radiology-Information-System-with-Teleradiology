<?php
    use PHPMailer\PHPMailer\PHPMailer;
    //Load Composer's autoloader
    require '../vendor/autoload.php';
    session_start();
    date_default_timezone_set('Asia/Singapore');
    
    if (!isset($_POST['email'])) {
        header('location: ../home.php');
        exit;
    }
    
    $con = mysqli_connect("localhost", "root", "", "vsu_i_ris");
    if (!$con)
        exit(mysqli_connect_error());

//--- check if email exist in users ---///
    if ($stmt=$con->prepare('SELECT u_id, u_name FROM users WHERE email = "'.$_POST['email'].'"')) {
        if ($stmt->execute()) {
            $stmt->store_result();
            if ($stmt->num_rows() > 0) {
                $stmt->bind_result($u_id, $u_name);
                $stmt->fetch();
                //--- check if an email was already sent ---//
                if (not_in_pending_forgot_pass($con, $u_id)) {
                    //--- add u_id to pending forgot pass table ---//
                    if (add_to_pending_forgot_pass($con, $u_id)) {
                        //--- generate new pass and change pass in users table ---//
                        $new_pass = bin2hex(random_bytes(8));
                        if (change_pass($con, $new_pass, $u_id)) {
                            if (send_email($_POST['email'], $u_name, $new_pass))
                                echo 'Success! a new password was sent to your email.';
                            else {
                                //--- remove from pending table since email was not sent ---//
                                if (remove_from_pending_forgot_pass($con, $u_id))
                                    echo 'Failed to send an email. Make sure you have a working internet connection!';
                                else
                                    echo 'Failed to send an email. Make sure you have a working internet connection...';
                            }
                        }
                    }
                }
                else
                    echo 'A new password was already sent to your email address! Please try again later..';
            }
            else
                echo 'Your email address is not associated with any accounts! Please make sure you entered your correct email address and try again.';
            $con->close();
            exit;
        }
    }
    echo mysqli_error($con);
    $con->close();
    exit;

    function remove_from_pending_forgot_pass($con, $u_id) {
        if ($stmt = $con->prepare('DELETE FROM pending_forgot_pass WHERE u_id = '.$u_id.'')) {
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

    function change_pass($con, $new_pass, $u_id) {
        $hash = password_hash($new_pass, PASSWORD_BCRYPT, array('cost' => 10));
        if ($stmt=$con->prepare('UPDATE users SET u_pass = "'.$hash.'" WHERE u_id = '.$u_id.'')) {
            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0 )
                    return true;
            }
        }
        echo mysqli_error($con);
        $con->close();
        exit;
    }

    function add_to_pending_forgot_pass($con, $u_id) {
        $cooldown_time = time()+60*5;
        if ($stmt=$con->prepare('INSERT INTO pending_forgot_pass (u_id, cooldown_time) VALUE ('.$u_id.', "'.$cooldown_time.'")')) {
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

    function not_in_pending_forgot_pass($con, $u_id) {
        $cooldown_time = '';
        if ($stmt=$con->prepare('SELECT cooldown_time FROM pending_forgot_pass WHERE u_id = '.$u_id.'')) {
            if ($stmt->execute())  {
                $stmt->store_result();
                if ($stmt->num_rows() <= 0)
                    return true;
                $stmt->bind_result($cooldown_time);
                $stmt->fetch();
                if ($cooldown_time <= time()) {
                    if ($stmt=$con->prepare('DELETE FROM pending_forgot_pass WHERE u_id = '.$u_id.'')) {
                        if ($stmt->execute())
                            return true;
                    }
                }
                else 
                    return false;
            }   
        }
        echo mysqli_error($con);
        $con->close();
        exit;
    }

    function send_email($email, $u_name, $new_pass) {
        $sender_email = 'ris.email.system@gmail.com';
        $sender_pass = 'ris.email.system@gmail.com123';
        $sender_name = 'RISystem';
        $message_html = '<i>This is an automated message. Please do not reply to this email.</i>
                        <hr>
                        <p>Hello '.$u_name.',</p>
                        <p>Your account password was reset! Please use this new password to login: <b>'.$new_pass.'</b></p>';

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
        $mail->Subject = "Account password reset!";
        $mail->Body = $message_html;

        try {
            if ($mail->send() == true)
                return true;
        }catch (Exception) {
            return false;
        }
    }
?>