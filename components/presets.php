<?php
    session_start();

    if (!isset($_GET['presets']) && !isset($_GET['preset']) && !isset($_POST['update']) && !isset($_POST['add']) && !isset($_GET['exist']) && !isset($_POST['overwrite']) && !isset($_POST['delete'])) {
        header('location: ../home.php');
        exit;
    }

    $con = mysqli_connect("localhost", "root", "", "vsu_i_ris");
    if (!$con)
        exit(mysqli_connect_error());

    if (isset($_GET['exist'])) {
        if ($stmt = $con->prepare('SELECT id FROM presets WHERE preset_name = ?')){
            $stmt->bind_param('s', $_GET['exist']);
            if ($stmt->execute()) {
                $stmt->store_result();
                if ($stmt->num_rows > 0) {
                    echo 'True';
                }  
                else
                    echo 'False';
            }
        }
        echo mysqli_error($con);
    }
    if (isset($_GET['preset'])) {
        if ($stmt = $con->prepare('SELECT preset_name, findings, diagnosis FROM presets WHERE id = ?')){
            $stmt->bind_param('s', $_GET['preset']);
            if ($stmt->execute()) {
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    $row = $result->fetch_assoc();
                    echo json_encode($row);
                }  
                else
                    echo 'Empty';
                
            }
        }
        echo mysqli_error($con);
    }
    if (isset($_GET['presets'])) {
        if ($stmt = $con->prepare('SELECT * FROM presets ORDER BY preset_name ASC')){
            if ($stmt->execute()) {
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    $array = array();
                    while ($row = $result->fetch_assoc()) {
                        $array[] = $row;
                    }
                    echo json_encode($array);
                }  
                else
                    echo 'Empty';
            }
        }
        echo mysqli_error($con);
    }
    if (isset($_POST['add'])) {
        if ($stmt = $con->prepare('INSERT presets(preset_name, findings, diagnosis) values(?, ?, ?)')) {
            $stmt->bind_param('sss', $_POST['add'],  $_POST['findings'],  $_POST['diagnosis']);
            if ($stmt->execute()) {
                echo 'Success!';
            }
        }
        echo mysqli_error($con);
    }
    if (isset($_POST['overwrite'])) {
        if ($stmt = $con->prepare('UPDATE presets SET findings = ?, diagnosis = ? WHERE preset_name = ?')) {
            $stmt->bind_param('sss', $_POST['findings'],  $_POST['diagnosis'], $_POST['overwrite']);
            if ($stmt->execute()) {
                echo 'Success!';
            }
        }
        echo mysqli_error($con);
    }
    if (isset($_POST['update'])) {
        if ($stmt = $con->prepare('UPDATE presets SET preset_name = ?, findings = ?, diagnosis = ? WHERE id = ?')) {
            $stmt->bind_param('ssss', $_POST['update'],  $_POST['findings'],  $_POST['diagnosis'], $_POST['id']);
            if ($stmt->execute()) {
                echo 'Success!';
            }
        }
        echo mysqli_error($con);
    }
    if (isset($_POST['delete'])) {
        if ($stmt = $con->prepare('DELETE FROM presets WHERE id = ?')) {
            $stmt->bind_param('s', $_POST['delete']);
            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0)
                    echo 'Success!';
                else
                    echo 'Failed to delete preset!';
            }
        }
        echo mysqli_error($con);
    }
    
    $con->close();
    exit;
?>