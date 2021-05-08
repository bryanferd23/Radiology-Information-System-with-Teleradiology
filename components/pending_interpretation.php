<?php
    session_start();

    if (!isset($_GET['pending_interpretation']) && !isset($_POST['delete'])) {
        header('location: ../home.php');
        exit;
    }
    if (!isset($_SESSION['loggedin']))
        header("location: ../login.php");
    
    $con = mysqli_connect("localhost", "root", "", "vsu_i_ris");
    if (!$con)
        exit(mysqli_connect_error());
    
    if (isset($_POST['delete'])) {
        $stmt=$con->prepare('DELETE FROM for_reading WHERE x_ray_no=?');
        $stmt->bind_param('s', $_POST['delete']);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->affected_rows > 0) {
            $mask = '../resources/images/for_reading/'.$_POST['delete'].'*.*';
            array_map('unlink', glob($mask));

            $stmt=$con->prepare('SELECT id FROM procedures p INNER JOIN examination e WHERE e.x_ray_no = ? && p.x_ray_no=e.x_ray_no');
            $stmt->bind_param('s', $_POST['delete']);
            $stmt->execute();
            $result=$stmt->get_result();
            while($row=$result->fetch_assoc())
                $con->query('DELETE FROM radiographs WHERE procedure_id='.$row['id'].'');
            echo 'Success!';
        }
        else
            echo 'Failed to delete!';
    }
    
    if (isset($_GET['pending_interpretation'])) {
        if ($stmt=$con->prepare('SELECT FR.x_ray_no, PT.fname, PT.lname, PT.age, PT.gender, EX.history_or_purpose, EX.date
                                FROM for_reading FR INNER JOIN examination EX, patients PT 
                                WHERE FR.x_ray_no=EX.x_ray_no && EX.patient_id=PT.id ORDER BY date ASC')) {
            if ($stmt->execute()) {
                $result1=$stmt->get_result();
                $array = array();
                while($row1=$result1->fetch_assoc()) {
                    $stmt=$con->prepare('SELECT id, type, views FROM procedures WHERE x_ray_no=?');
                    $stmt->bind_param('s', $row1['x_ray_no']);
                    $stmt->execute();
                    $result2=$stmt->get_result();
                    $array2['procedures'] = array();
                    $array2['img_file'] = array();
                    while($row2=$result2->fetch_assoc()) {
                        $stmt=$con->prepare('SELECT img_file FROM radiographs WHERE procedure_id = ?');
                        $stmt->bind_param('i', $row2['id']);
                        $stmt->execute();
                        $result3=$stmt->get_result();
                        $array3['img_file'] = array();
                        while($row3=$result3->fetch_assoc()) {
                            array_push($array2['img_file'], $row3['img_file']);
                        }
                        array_push($array2['procedures'], $row2['type'].'_'.$row2['views']);
                    }
                    $array[] = array_merge($row1, $array2);
                }
                echo json_encode($array);
            }
        }
        else
            echo mysqli_error($con);
    }
    $con->close();
    exit;

?>