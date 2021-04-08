<?php
    session_start();
    if ($_SESSION['uid'] != 1 || $_SESSION['uid'] != '1' || !isset($_GET['user_list'])) {
        header('location: ../login.php');
        exit;
    }
    else {
        $con = mysqli_connect("localhost", "root", "", "vsu_i_ris");
        if (!$con)
            exit(mysqli_connect_error());

        if ($stmt = $con->prepare('SELECT u_id, fname, email, status, role FROM users ORDER BY u_id ASC')) {
            if ($stmt->execute()){
                $result = $stmt->get_result();
                while ($row = $result->fetch_assoc()) {
                    $action = 'DISABLE';
                    $color = 'secondary';
                    if ($row['status'] == 'DISABLED') {
                        $action = 'ACTIVATE';
                        $color = 'success';
                    }
                    $toecho = '<tr>
                                    <td class="align-middle">'.$row['u_id'].'</td>
                                    <td class="align-middle">'.$row['fname'].'</td>
                                    <td class="align-middle">'.$row['email'].'</td>
                                    <td class="align-middle">'.$row['role'].'</td>
                                    <td class="align-middle">
                                        <a href="#" id="user-list-view" class="badge badge-primary align-middle">VIEW</a>
                                        ';
                    if ($row['u_id'] != 1) {
                        $toecho .= '    <a href="#" id="user-list-change-user-status" class="badge badge-'.$color.' align-middle ml-2">'.$action.'</a>
                                    </td>
                                </tr>';
                    }
                    else
                        $toecho .= '</td></tr>';
                    echo $toecho;
                }
            }
            else
                echo mysqli_error($con);
        }
        else
            echo mysqli_error($con);
        $con->close();
        exit;
    }
?>