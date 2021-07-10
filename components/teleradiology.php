<?php
    session_start();

    if (!isset($_GET['for_reading']) && !isset($_POST['delete']) && !isset($_GET['for_reading_by_x_ray_no']) && !isset($_GET['for_printing']) && !isset($_GET['for_printing_by_x_ray_no']) && !isset($_POST['change_stage_to']) && !isset($_POST['x_ray_no'])) {
        header('location: ../home.php');
        exit;
    }
    if (!isset($_SESSION['loggedin']))
        header("location: ../login.php");
    
    $con = mysqli_connect("localhost", "root", "", "vsu_i_ris");
    if (!$con)
        exit(mysqli_connect_error());
    
    if (isset($_POST['delete'])) {
        //check if x_ray_no exist
        if ($stmt = $con->prepare('SELECT id FROM teleradiology WHERE x_ray_no = ?')) {
            $stmt->bind_param('s', $_POST['delete']);
            if ($stmt->execute()) {
                $stmt->store_result();
                //delete if exist
                if ($stmt->num_rows > 0) {
                    $stmt->bind_result($id);
                    $stmt->fetch();
                    if ($stmt=$con->prepare('DELETE FROM teleradiology WHERE id=?')) {
                        $stmt->bind_param('s', $id);
                        if ($stmt->execute()) {
                            $stmt->store_result();
                            //if deletion is succesful, delete also the radiographs/x-ray images
                            if ($stmt->affected_rows > 0) {
                                $mask = '../resources/images/for_reading/'.$_POST['delete'].'*.*';
                                array_map('unlink', glob($mask));
                                if ($stmt=$con->prepare('SELECT id FROM procedures p INNER JOIN examination e WHERE e.x_ray_no = ? && p.x_ray_no=e.x_ray_no')) {
                                    $stmt->bind_param('s', $_POST['delete']);
                                    if ($stmt->execute()) {
                                        $result=$stmt->get_result();
                                        while($row=$result->fetch_assoc())
                                            $con->query('DELETE FROM radiographs WHERE procedure_id='.$row['id'].'');
                                        echo 'Success!';
                                    }
                                }
                            }
                            else
                                echo 'Failed to delete from teleradiology!';
                        }
                    }
                }
                else
                    echo 'X-Ray no. is invalid!';
            }
        }
        echo mysqli_error($con);
    }
    
    if (isset($_GET['for_reading']) || isset($_GET['for_reading_by_x_ray_no']) || isset($_GET['for_printing']) || isset($_GET['for_printing_by_x_ray_no'])) {
        if (isset($_GET['for_reading'])) {
            $stmt=$con->prepare('SELECT TR.x_ray_no, PT.fname, PT.lname, PT.age, PT.gender, EX.history_or_purpose, EX.date
                                FROM teleradiology TR INNER JOIN examination EX, patients PT 
                                WHERE TR.x_ray_no=EX.x_ray_no && TR.stage="for_reading" && EX.patient_id=PT.id ORDER BY date ASC');
        }
        if (isset($_GET['for_printing'])) {
            $stmt=$con->prepare('SELECT TR.x_ray_no, PT.fname, PT.lname, PT.age, PT.gender, EX.history_or_purpose, EX.date
                                FROM teleradiology TR INNER JOIN examination EX, patients PT 
                                WHERE TR.x_ray_no=EX.x_ray_no && TR.stage="for_printing" && EX.patient_id=PT.id ORDER BY date ASC');
        }
        if (isset($_GET['for_reading_by_x_ray_no'])) {
            $stmt=$con->prepare('SELECT TR.x_ray_no, PT.fname, PT.lname, PT.age, PT.gender, EX.history_or_purpose, EX.date
                                FROM teleradiology TR INNER JOIN examination EX, patients PT 
                                WHERE TR.x_ray_no=EX.x_ray_no && EX.patient_id=PT.id && TR.stage="for_reading" && EX.x_ray_no=?');
            $stmt->bind_param('s', $_GET['for_reading_by_x_ray_no']);
        }
        if (isset($_GET['for_printing_by_x_ray_no'])) {
            $stmt=$con->prepare('SELECT TR.x_ray_no, PT.fname, PT.lname, PT.age, PT.gender, EX.history_or_purpose, EX.date
                                FROM teleradiology TR INNER JOIN examination EX, patients PT 
                                WHERE TR.x_ray_no=EX.x_ray_no && EX.patient_id=PT.id && TR.stage="for_printing" && EX.x_ray_no=?');
            $stmt->bind_param('s', $_GET['for_printing_by_x_ray_no']);
        }
        if ($stmt->execute()) {
            $result1=$stmt->get_result();
            $array = array();
            while($row1=$result1->fetch_assoc()) {
                $stmt=$con->prepare('SELECT id, type, views FROM procedures WHERE x_ray_no = ?');
                $stmt->bind_param('s', $row1['x_ray_no']);
                $stmt->execute();
                $result2=$stmt->get_result();
                $array2['procedures'] = array();
                $array2['img_file'] = array();
                if (isset($_GET['for_reading_by_x_ray_no']) || isset($_GET['for_printing_by_x_ray_no'])) {
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
                }
                $array[] = array_merge($row1, $array2);
            }
            echo json_encode($array);
        }
        else
            echo mysqli_error($con);
    }
    if (isset($_POST['change_stage_to']) && isset($_POST['x_ray_no'])) {
        if ($_POST['change_stage_to'] == 'for_printing') {
            $type = ucfirst(strtolower($_POST['procedure_type']));
            if ($stmt = $con->prepare('SELECT id FROM procedures P INNER JOIN examination EX WHERE P.x_ray_no = EX.x_ray_no && EX.x_ray_no = ? && P.type = ?')) {
                $stmt->bind_param('ss', $_POST['x_ray_no'], $type);
                $stmt->execute();
                $stmt->store_result();
                if ($stmt->num_rows > 0) {
                    $stmt->bind_result($procedure_id);
                    $stmt->fetch();
                    if ($stmt = $con->prepare('INSERT INTO x_ray_results(procedure_id, findings, diagnosis, radiologist_id) values(?, ?, ?, ?)')) {
                        $stmt->bind_param('issi', $procedure_id, $_POST['findings'], $_POST['diagnosis'], $_SESSION['uid']);
                        if ($stmt->execute())
                            change_stage_evaluate($con, $_POST['x_ray_no'], 'for_printing');
                    }
                }
            }
        }
        else {
            if ($stmt = $con->prepare('SELECT id FROM procedures WHERE x_ray_no = ?')) {
                $stmt->bind_param('s', $_POST['x_ray_no']);
                if ($stmt->execute()) {
                    $result = $stmt->get_result();
                    while ($row = $result->fetch_assoc()) {
                        $con->query('DELETE FROM x_ray_results WHERE procedure_id = '.$row['id'].'');
                    }
                    change_stage_evaluate($con, $_POST['x_ray_no'], 'for_reading');
                }
            }
        }
        echo mysqli_error($con);
    }
    $con->close();
    exit;

    function change_stage_evaluate($con, $x_ray_no, $change_stage_to) {
        $id = '';
        if ($change_stage_to == 'for_printing')
            $stmt = $con->prepare('SELECT id FROM procedures LEFT OUTER JOIN x_ray_results ON(id=procedure_id) WHERE x_ray_no = ? && procedure_id IS NULL');
        else if ($change_stage_to == 'for_reading')
            $stmt = $con->prepare('SELECT id FROM procedures LEFT OUTER JOIN x_ray_results ON(id=procedure_id) WHERE x_ray_no = ? && procedure_id IS NOT NULL');
        else
            echo 'Change stage data is invalid!';
        if ($stmt) {
            $stmt->bind_param('s', $x_ray_no);
            if($stmt->execute()) {
                $result = $stmt->get_result();
                if ($result->num_rows <= 0) {
                    if ($stmt = $con->prepare('SELECT id FROM teleradiology WHERE x_ray_no = ?')) {
                        $stmt->bind_param('s', $x_ray_no);
                        if ($stmt->execute()) {
                            $stmt->store_result();
                            $stmt->bind_result($id);
                            $stmt->fetch();
                            if ($stmt = $con->prepare('UPDATE teleradiology SET stage = ? WHERE id = ?')) {
                                $stmt->bind_param('si', $change_stage_to, $id);
                                if ($stmt->execute()) {
                                    $stmt->store_result();
                                    if ($stmt->affected_rows > 0)
                                        echo 'Success!';
                                    else
                                        echo 'Failed to change stage!';
                                }
                            }
                        }
                    }
                }
                else
                    echo 'All procedures must be interpreted first!';
            }
        }
        echo mysqli_error($con);
        $con->close();
        exit;
    }
?>