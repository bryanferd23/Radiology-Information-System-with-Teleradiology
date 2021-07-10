<?php
    session_start();
    if (!isset($_POST['send-x-ray-image-form2-body-x_ray_no']) && !isset($_GET['exist']) && $_SESSION['role'] != 'Radiologic technologist') {
        header('location: ../home.php');
        exit;
    }

    $con = mysqli_connect("localhost", "root", "", "vsu_i_ris");
        if (!$con)
            exit(mysqli_connect_error());
    
    if (isset($_GET['exist'])) {
        $stmt=$con->prepare('SELECT procedure_id FROM x_ray_results XR INNER JOIN procedures P ON (XR.procedure_id=P.id) WHERE P.x_ray_no = ?');
        $stmt->bind_param('s', $_GET['exist']);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows() > 0)
            echo 'This record was already interpreted and has an X-ray result!<br>Please proceed to "Results" for printing.';
        else {
            $stmt=$con->prepare('SELECT id FROM teleradiology WHERE x_ray_no = ?');
            $stmt->bind_param('s', $_GET['exist']);
            $stmt->execute();
            $stmt->store_result();
            if ($stmt->num_rows() > 0)
                echo 'This record was already sent for interpretation!<br>Check "Pending interpretation" for more details.';
            else
                echo 'does not exist!';
        }
        echo mysqli_error($con);
    }

    if (isset($_POST['send-x-ray-image-form2-body-x_ray_no'])) {
        $stmt=$con->prepare('SELECT id, type, views FROM procedures WHERE x_ray_no = ?');
        $stmt->bind_param('s', $_POST['send-x-ray-image-form2-body-x_ray_no']);
        $stmt->execute();
        $result = $stmt->get_result();

        while($row = $result->fetch_assoc()) {
            $temp = 'image_of_'.$row['type'].'_'.$row['views'];
            if ($_FILES[$temp]) {
                $file_ary = reArrayFiles($_FILES[$temp]);
                $index = 1;
                
                foreach ($file_ary as $file) {
                    $uploadto = '../resources/images/for_reading/';
                    $uploaded_filename = $file['name'];
                    $uploaded_file = $file['tmp_name'];
                    $uploaded_filesize = $file['size'];
                    $extension = (pathinfo($uploaded_filename))['extension'];
                    $new_filename = $_POST['send-x-ray-image-form2-body-x_ray_no'].'_'.$row['type'].'_'.$row['views'].'_'.$index++.'.'.$extension;
                    
                    if (!check_file_uploaded_name($uploaded_filename)) {
                        $con->close();
                        exit('Image name should be composed of [a-z, A-Z, 0-9, -_/.] only!');
                    }
                    else if (!check_file_uploaded_length($uploaded_filename)) {
                        $con->close();
                        exit('Image name is too long!');
                    }
                    else if (!check_file_uploaded_size($uploaded_filesize)) {
                        $con->close();
                        exit('Image size too large! Please select an image 10mb and below..');
                    }
                    else {
                        if (!move_uploaded_file($uploaded_file, $uploadto.$new_filename)) {
                            echo 'File upload failed!';
                        }
                        else {
                            $stmt=$con->prepare('INSERT INTO radiographs (procedure_id, img_file) values (?,?)');
                            $stmt->bind_param('is', $row['id'], $new_filename);
                            $stmt->execute();
                        }
                    }
                }
            }
        }
        $stmt=$con->prepare('INSERT INTO teleradiology (x_ray_no, stage) values (?, "for_reading")');
        $stmt->bind_param('s', $_POST['send-x-ray-image-form2-body-x_ray_no']);
        $stmt->execute();
        echo 'Success!';
    }
    
    $con->close();
    exit;

    

    function reArrayFiles(&$file_post) {

        $file_ary = array();
        $file_count = count($file_post['name']);
        $file_keys = array_keys($file_post);
    
        for ($i=0; $i<$file_count; $i++) {
            foreach ($file_keys as $key) {
                $file_ary[$i][$key] = $file_post[$key][$i];
            }
        }
    
        return $file_ary;
    }

    //--- validate image file ---//
    function check_file_uploaded_name ($filename){
        return ((preg_match('`^[-0-9A-Za-z_\.]+$`i',$filename)) ? true : false);
    }
    function check_file_uploaded_length ($filename){
        return ((mb_strlen($filename,'UTF-8') < 225) ? true : false);
    }
    function check_file_uploaded_size ($size){
        return (($size < 10097152) ? true : false);
    }
?>