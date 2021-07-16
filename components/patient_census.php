<?php
    session_start();

    if (!isset($_GET['from_year']) && !isset($_GET['from_month']) && !isset($_GET['until_year']) && !isset($_GET['until_month'])) {
        header('location: ../home.php');
        exit;
    }

    $con = mysqli_connect("localhost", "root", "", "vsu_i_ris");
    if (!$con)
        exit(mysqli_connect_error());

    $from_year = $_GET['from_year'];
    $from_month = $_GET['from_month'];
    $until_year = $_GET['until_year'];
    $until_month = $_GET['until_month'];
    $table = array();
    $months = array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November","December");
    $date_from = $from_year.'-'.$from_month.'-00';
    $date_until = $until_year.'-'.$until_month.'-31';

    while (intval($from_year) <= intval($until_year)) {
        while (intval($from_month) <= intval($until_month)) {
            if (strlen($from_month) < 2)
                $from_month = '0'.$from_month;
                
            $date = $from_year.'-'.$from_month.'-'.'%';
            $row = array();
            array_push($row, array("month_year" => $months[intval($from_month)-1].' '.$from_year));

            //male student
            if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Male" && P.standing_or_status = "Student" && EX.date LIKE ?')) {
                $stmt->bind_param('s', $date);
                if($stmt->execute()) {
                    $stmt->store_result();
                    array_push($row, array("male_student" => $stmt->affected_rows ));
                }
            }
            //female student
            if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Female" && P.standing_or_status = "Student" && EX.date LIKE ?')) {
                $stmt->bind_param('s', $date);
                if($stmt->execute()) {
                    $stmt->store_result();
                    array_push($row, array("female_student" => $stmt->num_rows));
                }
            }
            //male employee
            if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Male" && P.standing_or_status = "Employee" && EX.date LIKE ?')) {
                $stmt->bind_param('s', $date);
                if($stmt->execute()) {
                    $stmt->store_result();
                    array_push($row, array("male_employee" => $stmt->num_rows));
                }
            }
            //female employee
            if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Female" && P.standing_or_status = "Employee" && EX.date LIKE ?')) {
                $stmt->bind_param('s', $date);
                if($stmt->execute()) {
                    $stmt->store_result();
                    array_push($row, array("female_employee" => $stmt->num_rows));
                }
            }
            //male ousider
            if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Male" && P.standing_or_status = "Outsider" && EX.date LIKE ?')) {
                $stmt->bind_param('s', $date);
                if($stmt->execute()) {
                    $stmt->store_result();
                    array_push($row, array("male_outsider" => $stmt->num_rows));
                }
            }
            //female ousider
            if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Female" && P.standing_or_status = "Outsider" && EX.date LIKE ?')) {
                $stmt->bind_param('s', $date);
                if($stmt->execute()) {
                    $stmt->store_result();
                    array_push($row, array("female_outsider" => $stmt->num_rows));
                }
            }
            //male adult
            if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Male" && P.age >= 18 && EX.date LIKE ?')) {
                $stmt->bind_param('s', $date);
                if($stmt->execute()) {
                    $stmt->store_result();
                    array_push($row, array("male_adult" => $stmt->num_rows));
                }
            }
            //female adult
            if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Female" && P.age >= 18 && EX.date LIKE ?')) {
                $stmt->bind_param('s', $date);
                if($stmt->execute()) {
                    $stmt->store_result();
                    array_push($row, array("female_adult" => $stmt->num_rows));
                }
            }
            //male pedia
            if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Male" && P.age < 18 && EX.date LIKE ?')) {
                $stmt->bind_param('s', $date);
                if($stmt->execute()) {
                    $stmt->store_result();
                    array_push($row, array("male_pedia" => $stmt->num_rows));
                }
            }
            //female pedia
            if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Female" && P.age < 18 && EX.date LIKE ?')) {
                $stmt->bind_param('s', $date);
                if($stmt->execute()) {
                    $stmt->store_result();
                    array_push($row, array("female_pedia" => $stmt->num_rows));
                }
            }
            //male OPD
            if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Male" && EX.or_no IS NOT NULL && EX.date LIKE ?')) {
                $stmt->bind_param('s', $date);
                if($stmt->execute()) {
                    $stmt->store_result();
                    array_push($row, array("male_opd" => $stmt->num_rows));
                }
            }
            //female OPD
            if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Female" && EX.or_no IS NOT NULL && EX.date LIKE ?')) {
                $stmt->bind_param('s', $date);
                if($stmt->execute()) {
                    $stmt->store_result();
                    array_push($row, array("female_opd" => $stmt->num_rows));
                }
            }
            //male INP
            if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Male" && EX.or_no IS NULL && EX.date LIKE ?')) {
                $stmt->bind_param('s', $date);
                if($stmt->execute()) {
                    $stmt->store_result();
                    array_push($row, array("male_inp" => $stmt->num_rows));
                }
            }
            //female INP
            if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Female" && EX.or_no IS NULL && EX.date LIKE ?')) {
                $stmt->bind_param('s', $date);
                if($stmt->execute()) {
                    $stmt->store_result();
                    array_push($row, array("female_inp" => $stmt->num_rows));
                }
            }
            //male medical
            if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Male" && (EX.history_or_purpose != "v.a" || EX.history_or_purpose != "vehicular accident" || EX.history_or_purpose != "accident" || EX.history_or_purpose != "trauma") && EX.date LIKE ?')) {
                $stmt->bind_param('s', $date);
                if($stmt->execute()) {
                    $stmt->store_result();
                    array_push($row, array("male_medical" => $stmt->num_rows));
                }
            }
            //female medical
            if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Female" && (EX.history_or_purpose != "v.a" || EX.history_or_purpose != "vehicular accident" || EX.history_or_purpose != "accident" || EX.history_or_purpose != "trauma") && EX.date LIKE ?')) {
                $stmt->bind_param('s', $date);
                if($stmt->execute()) {
                    $stmt->store_result();
                    array_push($row, array("female_medical" => $stmt->num_rows));
                }
            }
            //male surgery
            if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Male" && (EX.history_or_purpose = "v.a" || EX.history_or_purpose = "vehicular accident" || EX.history_or_purpose = "accident" || EX.history_or_purpose = "trauma") && EX.date LIKE ?')) {
                $stmt->bind_param('s', $date);
                if($stmt->execute()) {
                    $stmt->store_result();
                    array_push($row, array("male_surgery" => $stmt->num_rows));
                }
            }
            //female surgery
            if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Female" && (EX.history_or_purpose = "v.a" || EX.history_or_purpose = "vehicular accident" || EX.history_or_purpose = "accident" || EX.history_or_purpose = "trauma") && EX.date LIKE ?')) {
                $stmt->bind_param('s', $date);
                if($stmt->execute()) {
                    $stmt->store_result();
                    array_push($row, array("female_surgery" => $stmt->num_rows));
                }
            }
            //male total
            if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Male" && EX.date LIKE ?')) {
                $stmt->bind_param('s', $date);
                if($stmt->execute()) {
                    $stmt->store_result();
                    array_push($row, array("male_total" => $stmt->num_rows));
                }
            }
            //female total
            if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Female" && EX.date LIKE ?')) {
                $stmt->bind_param('s', $date);
                if($stmt->execute()) {
                    $stmt->store_result();
                    array_push($row, array("female_total" => $stmt->num_rows));
                }
            }
            $table[] = $row;
            $from_month = intval($from_month)+1;
        }
        $from_year = intval($from_year)+1;
        $from_month = 01;
    }

    //subtotal
    $row = array();
    array_push($row, array("month_year" => "Subtotal"));
    //male student
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Male" && P.standing_or_status = "Student" && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("male_student_subtotal" => $stmt->affected_rows ));
        }
    }
    //female student
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Female" && P.standing_or_status = "Student" && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("female_student_subtotal" => $stmt->num_rows));
        }
    }
    //male employee
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Male" && P.standing_or_status = "Employee" && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("male_employee_subtotal" => $stmt->num_rows));
        }
    }
    //female employee
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Female" && P.standing_or_status = "Employee" && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("female_employee_subtotal" => $stmt->num_rows));
        }
    }
    //male ousider
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Male" && P.standing_or_status = "Outsider" && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("male_outsider_subtotal" => $stmt->num_rows));
        }
    }
    //female ousider
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Female" && P.standing_or_status = "Outsider" && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("female_outsider_subtotal" => $stmt->num_rows));
        }
    }
    //male adult
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Male" && P.age >= 18 && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("male_adult_subtotal" => $stmt->num_rows));
        }
    }
    //female adult
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Female" && P.age >= 18 && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("female_adult_subtotal" => $stmt->num_rows));
        }
    }
    //male pedia
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Male" && P.age < 18 && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("male_pedia_subtotal" => $stmt->num_rows));
        }
    }
    //female pedia
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Female" && P.age < 18 && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("female_pedia_subtotal" => $stmt->num_rows));
        }
    }
    //male OPD
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Male" && EX.or_no IS NOT NULL && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("male_opd_subtotal" => $stmt->num_rows));
        }
    }
    //female OPD
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Female" && EX.or_no IS NOT NULL && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("female_opd_subtotal" => $stmt->num_rows));
        }
    }
    //male INP
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Male" && EX.or_no IS NULL && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("male_inp_subtotal" => $stmt->num_rows));
        }
    }
    //female INP
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Female" && EX.or_no IS NULL && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("female_inp_subtotal" => $stmt->num_rows));
        }
    }
    //male medical
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Male" && (EX.history_or_purpose != "v.a" || EX.history_or_purpose != "vehicular accident" || EX.history_or_purpose != "accident" || EX.history_or_purpose != "trauma") && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("male_medical_subtotal" => $stmt->num_rows));
        }
    }
    //female medical
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Female" && (EX.history_or_purpose != "v.a" || EX.history_or_purpose != "vehicular accident" || EX.history_or_purpose != "accident" || EX.history_or_purpose != "trauma") && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("female_medical_subtotal" => $stmt->num_rows));
        }
    }
    //male surgery
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Male" && (EX.history_or_purpose = "v.a" || EX.history_or_purpose = "vehicular accident" || EX.history_or_purpose = "accident" || EX.history_or_purpose = "trauma") && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("male_surgery_subtotal" => $stmt->num_rows));
        }
    }
    //female surgery
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Female" && (EX.history_or_purpose = "v.a" || EX.history_or_purpose = "vehicular accident" || EX.history_or_purpose = "accident" || EX.history_or_purpose = "trauma") && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("female_surgery_subtotal" => $stmt->num_rows));
        }
    }
    //male total
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Male" && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("male_total_subtotal" => $stmt->num_rows));
        }
    }
    //female total
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.gender = "Female" && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("female_total_subtotal" => $stmt->num_rows));
        }
    }
    $table[] = $row;


    //total
    $row = array();
    array_push($row, array("month_year" => "Total"));
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.standing_or_status = "Student" && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("student_total" => $stmt->affected_rows ));
        }
    }
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.standing_or_status = "Employee" && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("employee_total" => $stmt->num_rows));
        }
    }
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.standing_or_status = "Outsider" && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("outsider_total" => $stmt->num_rows));
        }
    }
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.age >= 18 && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("adult_total" => $stmt->num_rows));
        }
    }
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && P.age < 18 && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("pedia_total" => $stmt->num_rows));
        }
    }
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && EX.or_no IS NOT NULL && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("opd_total" => $stmt->num_rows));
        }
    }
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && EX.or_no IS NULL && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("inp_total" => $stmt->num_rows));
        }
    }
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && (EX.history_or_purpose != "v.a" || EX.history_or_purpose != "vehicular accident" || EX.history_or_purpose != "accident" || EX.history_or_purpose != "trauma") && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("medical_total" => $stmt->num_rows));
        }
    }
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && (EX.history_or_purpose = "v.a" || EX.history_or_purpose = "vehicular accident" || EX.history_or_purpose = "accident" || EX.history_or_purpose = "trauma") && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("surgery_total" => $stmt->num_rows));
        }
    }
    if ($stmt = $con->prepare('SELECT p.gender FROM patients P INNER JOIN examination EX WHERE EX.patient_id = P.id && EX.date >= ? && EX.date <= ?')) {
        $stmt->bind_param('ss', $date_from, $date_until);
        if($stmt->execute()) {
            $stmt->store_result();
            array_push($row, array("total_total" => $stmt->num_rows));
        }
    }
    $table[] = $row;
    echo json_encode($table);
    $con->close();
    exit;
?>