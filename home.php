<?php
    session_start();
    if (!isset($_SESSION['loggedin']))
        header("location: login.php");

    //check expiry of session (1hr per session)
    $current_time = time();
    if (isset($_SESSION['destroy_after']) && $current_time > $_SESSION['destroy_after']) {
            session_destroy();
            header("location: login.php");
    }
    else
        $_SESSION['destroy_after'] = $current_time + 3600;
?>

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>VSU-Infirmary RIS</title>
    <!-- Required meta tags -->
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <!-- Bootstrap CSS -->
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans&family=Roboto&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital@1&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.1.1/css/all.css" integrity="sha384-O8whS3fhG2OnA5Kas0Y9l3cfpmYjapjI0E4theH4iuMD+pLhbf6JI0jIMfYcK3yZ" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css" integrity="sha384-B0vP5xmATw1+K9KRQjQERJvTumQW0nPEzvF6L/Z6nronJ3oUOFUFpCjEUQouq2+l" crossorigin="anonymous">
    <link rel="stylesheet" href='resources/home.css'>
  </head>
  <body>

    <nav class="navbar navbar-expand-md navbar-dark sticky-top">
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#collapsibleNavId" aria-controls="collapsibleNavId" aria-expanded="false" aria-label="Toggle navigation">
            <i class="fas fa-bars"></i>
        </button>
        <a class="navbar-brand navlinks" data-toggle="collapse" data-target=".navbar-collapse.show" href="#">RISystem</a>
        <div class="collapse navbar-collapse" data-toggle="collapse" data-target=".navbar-collapse.show" id="collapsibleNavId">
            <div class="navbar-nav">
                <?php 
                    if ($_SESSION['role'] != 'Radiologic technologist') {
                        echo '
                        <div class="nav-item">
                            <a class="nav-link navlinks" href="#">Patients</a>
                        </div>';
                        if ($_SESSION['role'] == 'Radiologist') {
                            echo '
                            <div class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    Teleradiology
                                </a>
                                <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                                    <a class="dropdown-item navlinks" href="#"><i class="far fa-eye-slash mr-1"></i> For reading</a>
                                    <a class="dropdown-item navlinks" href="#"><i class="fas fa-print mr-1"></i> Recent diagnoses</a>
                                </div>
                            </div>
                            ';
                        }
                        else {
                            echo '
                            <div class="nav-item">
                                <a class="nav-link navlinks" href="#">Administration</a>
                            </div>
                            ';
                        }
                    }
                    else {
                        echo '
                        <div class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Examination
                            </a>
                            <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                                <a class="dropdown-item navlinks" href="#"><i class="fas fa-plus-square mr-1"></i> Add patient</a>
                                <a class="dropdown-item navlinks" href="#"><i class="fas fa-list-ol mr-1"></i> Show list</a>
                            </div>
                        </div>
                        <div class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Teleradiology
                            </a>
                            <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                                <a class="dropdown-item navlinks" href="#"><i class="fas fa-file-upload mr-1"></i> Send X-Ray Image</a>
                                <a class="dropdown-item navlinks" href="#"><i class="far fa-eye-slash mr-1"></i> Pending interpretation</a>
                                <a class="dropdown-item navlinks" href="#"><i class="fas fa-print mr-1"></i> Results</a>
                            </div>
                        </div>
                        ';
                    }
                ?>
            </div>
        </div>
        <div id="settings-container">
            <?php
                $img_url = "resources/images/".$_SESSION['img_file'];
                echo '<a id="settings" class="d-flex text-center bg-warning text-dark align-middle rounded-pill mr-2" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <img src="'.$img_url.'?t='.time().'" class="rounded-circle" width="28px" height="28px">
                        <i id="settings-u-name">'.$_SESSION['u_name'].'</i>
                        <i class="fas fa-caret-down"></i>
                    </a>';
            ?>
            <div id="settings-dropdown-menu" class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                <a id="edit-account" class="dropdown-item navlinks" href="#"><i class="fas fa-user-edit mr-1"></i> Edit account</a>
                <a id="logout" class="dropdown-item" href="#"><i class="fas fa-sign-out-alt mr-1"></i> Logout</a>
            </div>  
        </div>
    </nav>
    <noscript>
      <style>
        #enable-js {
          margin: 0;
          padding: 12px 15px;
          background-color: #FFC107;
          color: #000;
          text-align: center;
          font-family: "Arial";
          font-size: 1rem;
        }
      </style>
      <p id="enable-js">Unfortunately, this page doesn't work properly without JavaScript enabled. Please enable JavaScript in your browser and reload the page.</a></p>
    </noscript>
    
    <?php
        $current_time = time();
        if ($current_time < $_SESSION['loggedin'] + 15) {
            echo '<div id="welcome-message" class="alert alert-success alert-dismissible fade show" role="alert">
                    <h4 class="alert-heading">Welcome <strong>'.$_SESSION['u_name'].'</strong>!</h4>
                    <p>The system is still in beta test. Some features may not be available and bugs are most evident during beta testing..</p>
                </div>';
        }
    ?>

    <!-- Dashboard - nav_link_content #1 -->
    <section id="dashboard" class="nav_link_content">
            <h3 class="heading">Dashboard</h3>
        <div class="card">
            <div class="card-header">
                Patient census
            </div>
            <div class="mt-2 mb-4 d-flex justify-content-center">
                <form id="patient-census-form" class="m-auto">
                    <div class="form-row row-cols-md-2">
                        <div class="col-md-6 mb-3">
                            <label>From(Month Year)</label>
                            <input type="month" class="form-control" id="patient-census-from" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label>Until(Month Year)</label>
                            <input type="month" class="form-control" id="patient-census-until" required>
                        </div>
                    </div>
                    <div class="d-flex justify-content-center mt-2">
                        <button class="btn btn-primary" type="submit">Generate</button>
                    </div>
                </form>
            </div>
            <div class="card-body d-flex justify-content-center text-center mb-3">
                <!-- patient census table goes here -->
            </div>
        </div>
    </section>

    <?php
        if ($_SESSION['role'] == 'Radiologic technologist') {
            echo '
            <!-- Add patient - nav_link_content #2 -->
            <section id="add-patient" class="nav_link_content d-none">
                    <h3 class="heading">Examination</h3>
                <div class="card">
                    <div class="card-header">
                        Add patient
                    </div>
                    <div class="card-body">
                        <form id="add-patient-form">
                            <div id="add-patient-alert" class="alert w-100 text-center" role="alert">
                                <!-- response goes here -->
                            </div>
                            <div class="form-row row-cols-2 row-cols-sm-2 row-cols-md-4">
                                <div class="col mb-3">
                                    <label for="x_ray_no">X-ray No.</label>
                                    <input type="text" class="form-control input-type-x-ray-no" name="x_ray_no" id="x_ray_no" required>
                                    <small class="form-text text-muted">
                                    </small>
                                </div>
                                <div class="col mb-3">
                                    <label for="inf_no">Infirmary No.</label>
                                    <input type="number" class="form-control input-type-numbers" name="inf_no" id="inf_no" required>
                                    <small class="form-text text-muted">
                                    </small>
                                </div>
                                <div class="col mb-3">
                                    <label for="or_no">OR No.</label>
                                    <input type="number" class="form-control input-type-numbers" name="or_no" id="or_no">
                                    <small class="form-text text-muted">
                                    </small>
                                </div>
                                <div class="col mb-3">
                                    <label for="exam_date">Examination date</label>
                                    <input type="date" class="form-control is-valid input-type-date" name="exam_date" id="exam_date" required>
                                    <small class="form-text text-muted">
                                    </small>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="col-sm-6 mb-3">
                                    <label for="patient_fname">First name</label>
                                    <input type="text" class="form-control input-type-names" name="patient_fname" id="patient_fname" required>
                                    <small class="form-text text-muted">
                                    </small>
                                </div>
                                <div class="col-sm-6 mb-3">
                                    <label for="patient_lname">Last name</label>
                                    <input type="text" class="form-control input-type-names" name="patient_lname" id="patient_lname" required>
                                    <small class="form-text text-muted">
                                    </small>
                                </div>
                            </div>
                            <div class="form-row row-cols-2 row-cols-sm-2 row-cols-md-3">
                                <div class="col mb-3">
                                    <label for="b_date">Birth date</label>
                                    <input type="date" class="form-control input-type-date" name="b_date" id="b_date" required>
                                    <small class="form-text text-muted">
                                    </small>
                                </div>
                                <div class="col mb-3 d-none">
                                    <label for="age">Age</label>
                                    <input type="number" class="form-control is-valid" name="age" id="age">
                                </div>
                                <div class="col mb-3">
                                    <label for="patient_gender">Gender</label>
                                    <select class="custom-select input-type-select" name="patient_gender" id="patient_gender" required>
                                        <option selected disabled value="">Choose...</option>
                                        <option>Male</option>
                                        <option>Female</option>
                                    </select>
                                </div>
                                <div class="col mb-3">
                                    <label for="patient_cnumber">Mobile no. (optional)</label>
                                    <div class="input-group">
                                        <div class="input-group-prepend">
                                            <span style="font-size:.9rem" class="input-group-text rounded-left">+63</span>
                                        </div>
                                        <input type="number" class="form-control rounded-right input-type-numbers" name="patient_cnumber" id="patient_cnumber">
                                        <small class="form-text">
                                        </small>
                                    </div>
                                </div>
                                <div class="col mb-3">
                                    <label for="standing_or_status">Standing/Status</label>
                                    <select class="custom-select  input-type-select" name="standing_or_status" id="standing_or_status" required>
                                        <option selected disabled value="">Choose...</option>
                                        <option>Dependent</option>
                                        <option>Employee</option>
                                        <option>Student</option>
                                        <option>Outsider</option>
                                    </select>
                                </div>
                                <div class="col mb-3">
                                    <label for="history_or_purpose">History/Purpose</label>
                                    <input type="text" class="form-control input-type-sentence" name="history_or_purpose" id="history_or_purpose" required>
                                    <small class="form-text text-muted">
                                    </small>
                                </div>
                                <div class="col mb-3">
                                    <label for="physician">Physician</label>
                                    <select class="custom-select input-type-select" name="physician" id="physician" required>
                                        <option selected disabled value="">Choose...</option>
                                        <option value="1">Elwin Jay, Yu, Internal Medicine</option>
                                        <option value="2">Merry Christ\'l, Supnet-guinocor, Pediatrician</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row row-cols-2 row-cols-sm-2 row-cols-md-2">
                                <div class="col mb-3">
                                    <label for="procedure">Procedure</label>
                                    <select id="procedure" name="procedure" class="custom-select input-type-multiple-select" required>
                                        <option selected disabled value="">Choose...</option>
                                        <optgroup label="Chest">
                                            <option value="Chest AP">AP</option>
                                            <option value="Chest PA">PA</option>
                                            <option value="Chest APL">APL</option>
                                            <option value="Chest PAL">PAL</option>
                                            <option value="Chest APOL">APOL</option>
                                            <option value="Chest PALO">PALO</option>
                                        </optgroup>
                                        <optgroup label="Bucky">
                                            <option value="Bucky AP">AP</option>
                                            <option value="Bucky PA">PA</option>
                                        </optgroup>
                                        <optgroup label="Extremities">
                                            <option value="Extremities APL">APL</option>
                                            <option value="Extremities PAL">PAL</option>
                                            <option value="Extremities APOL">APOL</option>
                                            <option value="Extremities PALO">PALO</option>
                                        </optgroup>
                                        <optgroup label="Skull">
                                            <option value="Skull APL">APL</option>
                                            <option value="Skull PAL">PAL</option>
                                            <option value="Skull Waters view">Waters view</option>
                                        </optgroup>
                                        <optgroup label="Vertebrae">
                                            <option value="Vertebrae APL">APL</option>
                                            <option value="Vertebrae RAO">RAO</option>
                                            <option value="Vertebrae LAO">LAO</option>
                                        </optgroup>
                                        <optgroup label="Pelvis">
                                            <option value="Pelvis AP">AP</option>
                                        </optgroup>
                                        <optgroup label="Shoulder">
                                            <option value="Shoulder AP">AP</option>
                                            <option value="Shoulder Internal Rotation">Internal Rotation</option>
                                            <option value="Shoulder External Rotation">External Rotation</option>
                                            <option value="Shoulder Scapular Y">Scapular Y</option>
                                        </optgroup>
                                        <optgroup label="Abdomin">
                                            <option value="Abdomin FPU">FPU</option>
                                        </optgroup>
                                    </select>
                                    <small class="form-text text-muted">
                                        Select 1 (click) Select 1 or more (ctr+click)
                                    </small>
                                </div>
                                <div class="col mb-3">
                                    <label for="film_size">Film size</label>
                                    <select class="custom-select input-type-multiple-select" name="film_size" id="film_size" required>
                                        <option selected disabled value="">Choose...</option>
                                        <option>8x10</option>
                                        <option>10x12</option>
                                        <option>11x14</option>
                                        <option>14x14</option>
                                        <option>14x17</option>
                                    </select>
                                    <small class="form-text text-muted">
                                        Select 1 (click) Select 1 or more (ctr+click)
                                    </small>
                                </div>
                                <div class="col mb-3">
                                    <label for="no_of_film_spoilage">No. of film spoilage</label>
                                    <input type="number" class="form-control input-type-numbers" name="no_of_film_spoilage" id="no_of_film_spoilage" value="">
                                    <small class="form-text text-muted">
                                    </small>
                                </div>
                                <div class="col mb-3">
                                    <label for="reason_for_spoilage">Reason for spoilage</label>
                                    <input type="text" class="form-control input-type-sentence" name="reason_for_spoilage" id="reason_for_spoilage" value="">
                                    <small class="form-text text-muted">
                                    </small>
                                </div>
                            </div>
                            <div class="form-row mt-3">
                                <button class="btn btn-primary ml-auto" type="submit">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        ';
        }
    ?>
    <section id="patient-info">
        <div class="modal fade" data-keyboard="false" tabindex="-1" aria-labelledby="unlock-modalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content">
                <div class="d-flex justify-content-center">
                    <button type="button" class="close-modal" data-dismiss="modal" aria-label="Close">
                        <span>Click here to close</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div style="top:-30px" class="modal-header card-header d-flex justify-content-center">
                        Patient information
                    </div>
                    <div class="d-flex justify-content-center">
                        <form id="patient-info-form">
                            <?php
                                if ($_SESSION['role'] == 'Radiologic technologist') {
                                    echo '  <div style="position:absolute;top:55px;right:1rem;z-index:999">
                                                <h6><a id="patient-info-edit" href="" class="ml-auto mr-2" style="text-decoration:unset"><i class="far fa-edit"></i> Edit</a></h6>
                                            </div>';
                                }
                            ?>
                            <div id="patient-info-alert" class="alert w-100 text-center" role="alert">
                                <!-- response goes here -->
                            </div>
                            <div class="form-row row-cols-2 row-cols-sm-2 row-cols-md-4 mt-4">
                                <div class="col mb-3">
                                    <label for="patient-info-x_ray_no">X-ray No.</label>
                                    <input type="text" class="form-control input-type-x-ray-no" name="patient-info-x_ray_no" id="patient-info-x_ray_no">
                                    <small class="form-text text-muted">
                                    </small>
                                </div>
                                <div class="col mb-3">
                                    <label for="patient-info-inf_no">Infirmary No.</label>
                                    <input type="number" class="form-control input-type-numbers" name="patient-info-inf_no" id="patient-info-inf_no">
                                    <small class="form-text text-muted">
                                    </small>
                                </div>
                                <div class="col mb-3">
                                    <label for="patient-info-or_no">OR No.</label>
                                    <input type="number" class="form-control input-type-numbers" name="patient-info-or_no" id="patient-info-or_no">
                                    <small class="form-text text-muted">
                                    </small>
                                </div>
                                <div class="col mb-3">
                                    <label for="patient-info-exam_date">Examination date</label>
                                    <input type="date" class="form-control input-type-date" name="patient-info-exam_date" id="patient-info-exam_date">
                                    <small class="form-text text-muted">
                                    </small>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="col-sm-6 mb-3">
                                    <label for="patient-info-patient_fname">First name</label>
                                    <input type="text" class="form-control input-type-names" name="patient-info-patient_fname" id="patient-info-patient_fname">
                                    <small class="form-text text-muted">
                                    </small>
                                </div>
                                <div class="col-sm-6 mb-3">
                                    <label for="patient-info-patient_lname">Last name</label>
                                    <input type="text" class="form-control input-type-names" name="patient-info-patient_lname" id="patient-info-patient_lname">
                                    <small class="form-text text-muted">
                                    </small>
                                </div>
                            </div>
                            <div class="form-row row-cols-2 row-cols-sm-2 row-cols-md-3">
                                <div class="col mb-3">
                                    <label for="patient-info-b_date">Birth date</label>
                                    <input type="date" class="form-control input-type-date" name="patient-info-b_date" id="patient-info-b_date">
                                    <small class="form-text text-muted">
                                    </small>
                                </div>
                                <div class="col mb-3 d-none">
                                    <label for="patient-info-age">Age</label>
                                    <input type="number" class="form-control is-valid" name="patient-info-age" id="patient-info-age">
                                </div>
                                <div class="col mb-3">
                                    <label for="patient-info-patient_gender">Gender</label>
                                    <select class="custom-select input-type-select" name="patient-info-patient_gender" id="patient-info-patient_gender">
                                        <option selected disabled value="">Choose...</option>
                                        <option value="1">Male</option>
                                        <option value="2">Female</option>
                                    </select>
                                </div>
                                <div class="col mb-3">
                                    <label for="patient-info-patient_cnumber">Mobile no. (optional)</label>
                                    <div class="input-group">
                                        <div class="input-group-prepend">
                                            <span style="font-size:.9rem" class="input-group-text rounded-left">+63</span>
                                        </div>
                                        <input type="number" class="form-control rounded-right input-type-numbers" name="patient-info-patient_cnumber" id="patient-info-patient_cnumber">
                                        <small class="form-text">
                                        </small>
                                    </div>
                                </div>
                                <div class="col mb-3">
                                    <label for="patient-info-standing_or_status">Standing/Status</label>
                                    <select class="custom-select  input-type-select" name="patient-info-standing_or_status" id="patient-info-standing_or_status">
                                        <option selected disabled value="">Choose...</option>
                                        <option value="1">Dependent</option>
                                        <option value="2">Employee</option>
                                        <option value="3">Student</option>
                                        <option value="4">Outsider</option>
                                    </select>
                                </div>
                                <div class="col mb-3">
                                    <label for="patient-info-history_or_purpose">History/Purpose</label>
                                    <input type="text" class="form-control input-type-sentence" name="patient-info-history_or_purpose" id="patient-info-history_or_purpose">
                                    <small class="form-text text-muted">
                                    </small>
                                </div>
                                <div class="col mb-3">
                                    <label for="patient-info-physician">Physician</label>
                                    <select class="custom-select input-type-select" name="patient-info-physician" id="patient-info-physician">
                                        <option selected disabled value="">Choose...</option>
                                        <option value="1">Elwin Jay, Yu, Internal Medicine</option>
                                        <option value="2">Merry Christ'l, Supnet-guinocor, Pediatrician</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row row-cols-2 row-cols-sm-2 row-cols-md-2">
                                <div class="col mb-3">
                                    <label for="patient-info-procedure">Procedure</label>
                                    <select id="patient-info-procedure" name="patient-info-procedure" class="custom-select input-type-multiple-select">
                                        <option selected disabled value="">Choose...</option>
                                        <optgroup label="Chest">
                                            <option value="Chest AP">AP</option>
                                            <option value="Chest PA">PA</option>
                                            <option value="Chest APL">APL</option>
                                            <option value="Chest PAL">PAL</option>
                                            <option value="Chest APOL">APOL</option>
                                            <option value="Chest PALO">PALO</option>
                                        </optgroup>
                                        <optgroup label="Bucky">
                                            <option value="Bucky AP">AP</option>
                                            <option value="Bucky PA">PA</option>
                                        </optgroup>
                                        <optgroup label="Extremities">
                                            <option value="Extremities APL">APL</option>
                                            <option value="Extremities PAL">PAL</option>
                                            <option value="Extremities APOL">APOL</option>
                                            <option value="Extremities PALO">PALO</option>
                                        </optgroup>
                                        <optgroup label="Skull">
                                            <option value="Skull APL">APL</option>
                                            <option value="Skull PAL">PAL</option>
                                            <option value="Skull Waters view">Waters view</option>
                                        </optgroup>
                                        <optgroup label="Vertebrae">
                                            <option value="Vertebrae APL">APL</option>
                                            <option value="Vertebrae RAO">RAO</option>
                                            <option value="Vertebrae LAO">LAO</option>
                                        </optgroup>
                                        <optgroup label="Pelvis">
                                            <option value="Pelvis LAO">AP</option>
                                        </optgroup>
                                        <optgroup label="Shoulder">
                                            <option value="Shoulder AP">AP</option>
                                            <option value="Shoulder Internal Rotation">Internal Rotation</option>
                                            <option value="Shoulder External Rotation">External Rotation</option>
                                            <option value="Shoulder Scapular Y">Scapular Y</option>
                                        </optgroup>
                                        <optgroup label="Abdomin">
                                            <option value="Abdomin FPU">FPU</option>
                                        </optgroup>
                                    </select>
                                    <small class="form-text text-muted">
                                        Select 1 (click) Select 1 or more (ctr+click)
                                    </small>
                                </div>
                                <div class="col mb-3">
                                    <label for="patient-info-film_size">Film size</label>
                                    <select class="custom-select input-type-multiple-select" name="patient-info-film_size" id="patient-info-film_size">
                                        <option selected disabled value="">Choose...</option>
                                        <option>8x10</option>
                                        <option>10x12</option>
                                        <option>11x14</option>
                                        <option>14x14</option>
                                        <option>14x17</option>
                                    </select>
                                    <small class="form-text text-muted">
                                        Select 1 (click) Select 1 or more (ctr+click)
                                    </small>
                                </div>
                                <div class="col mb-3">
                                    <label for="patient-info-no_of_film_spoilage">No. of film spoilage</label>
                                    <input type="number" class="form-control input-type-numbers" name="patient-info-no_of_film_spoilage" id="patient-info-no_of_film_spoilage" value="">
                                    <small class="form-text text-muted">
                                    </small>
                                </div>
                                <div class="col mb-3">
                                    <label for="patient-info-reason_for_spoilage">Reason for spoilage</label>
                                    <input type="text" class="form-control input-type-sentence" name="patient-info-reason_for_spoilage" id="patient-info-reason_for_spoilage" value="">
                                    <small class="form-text text-muted">
                                    </small>
                                </div>
                            </div>
                            <div id="patient-info-update" class="form-row mt-3 d-none">
                                <button class="btn btn-primary ml-auto" type="submit">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div></div></div>
    </section>

    <!-- patient list - nav_link_content #3 -->
    <section id="patient-list" class="nav_link_content d-none">
        <?php
            $heading = 'Examination';
            if ($_SESSION['role'] != 'Radiologic technologist')
                $heading = 'Patients';
            echo'<h3 class="heading">'.$heading.'</h3>';
        ?>
        <div class="card">
            <div class="card-header">
                Patient list
            </div>
            <div class="mt-3 mb-4 d-flex justify-content-center">
                <form id="patient-list-search-form">
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <button id="patient-list-search-by" class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">x-ray no.</button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item" href="#">x-ray no.</a>
                                <a class="dropdown-item" href="#">last name</a>
                                <a class="dropdown-item" href="#">date</a>
                            </div>
                        </div>
                        <input type="text" name="patient-list-search-input" id="patient-list-search-input" class="form-control" required>
                        <div class="input-group-append">
                            <button type="submit" class="btn btn-primary input-group-text"><i class="fas fa-search" aria-hidden="true"></i></button>
                        </div>
                    </div>
                </form>
            </div>
            <div class="card-body">
                <div id="patient-list-card-body-table">
                </div>
            </div>
            <div class="text-center mb-4">
                <h6><a id="patient-list-footer" href="#" style="text-decoration:unset"><i class="fas fa-long-arrow-alt-down"></i> See more</a></h6>
            </div>
        </div>
    </section>
                        
    <?php
        if ($_SESSION['role'] != 'admin') {
            $header1 = 'For reading';
            $header2 = 'Recent diagnoses';
            if ($_SESSION['role'] == 'Radiologic technologist') {
                echo'
                <!-- upload x-ray image - nav_link_content #4 -->
                <section class="nav_link_content d-none">
                    <h3 class="heading">Teleradiology</h3>
                    <div class="card">
                        <div class="card-header">
                            Send X-Ray image
                        </div>
                        <div class="card-body">
                            <div class="col-md-5 ml-auto mr-auto mt-1 mb-3">
                                <div class="form-row justify-content-center">
                                    <h5 id="send-x-ray-image-h5">STEP 1</h5>
                                </div>
                                <div class="d-flex justify-content-center">
                                    <div id="step1" class="steps step1" style="margin-right:3rem"><i class="fa fa-file-code" aria-hidden="true"></i></div>
                                    <div id="step2" class="steps step2" style="margin-left:3rem"><i class="fa fa-file-upload" aria-hidden="true"></i></div>
                                </div>  
                            </div>
                            <form id="send-x-ray-image-form1" class="mt-5">
                                <div class="mb-2">
                                    <div id="send-x-ray-image-form1-alert" class="alert w-100 text-center" role="alert">
                                        <!-- response goes here -->
                                    </div>
                                </div>
                                <div class="col-sm-5 ml-auto mr-auto mt-4 mb-4">
                                    <label for="send-x-ray-image-x-ray-no">X-Ray No.</label>
                                    <input type="text" class="form-control input-type-x-ray-no" name="send-x-ray-image-x-ray-no" id="send-x-ray-image-x-ray-no" required>
                                    <small class="form-text text-muted">
                                    </small>
                                </div>
                                <button class="btn btn-primary float-right" type="submit">Next<i class="fas fa-long-arrow-alt-right ml-1"></i></button>
                            </form>
                            <form id="send-x-ray-image-form2" class="d-none">
                                <div class="mb-2">
                                    <div id="send-x-ray-image-form2-alert" class="alert w-100 text-center" role="alert">
                                        <!-- response goes here -->
                                    </div>
                                </div>
                                <div class="progress d-none ml-auto mr-auto" style="width:13rem">
                                    <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%">Uploading..</div>
                                </div>
                                <div id="send-x-ray-image-form2-body" class="justify-content-center">
                                    
                                </div>
                                <h6 class="float-left pt-2"><a id="send-x-ray-image-form2-back" href="" style="text-decoration:unset"><i class="fas fa-long-arrow-alt-left mr-1"></i>Back</a></h6>
                                <button id="send-x-ray-image-form2-send-button" class="btn btn-primary float-right" type="submit">Send</button>
                            </form>
                        </div>
                    </div>
                </section>';
                $header1 = 'Pending interpretation';
                $header2 = 'Results';
            }
            echo'
            <!-- Pending interpretation - nav_link_content #5 -->
            <section id="pending-interpretation" class="nav_link_content d-none">
                <h3 class="heading">Teleradiology</h3>
                <div class="card">
                    <div class="card-header">
                        '.$header1.'
                    </div>
                    <div class="mt-3 mb-4 d-flex justify-content-center">
                        <form id="pending-interpretation-search-form" class="d-none">
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <button id="pending-interpretation-search-by" class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">x-ray no.</button>
                                    <div class="dropdown-menu">
                                        <a class="dropdown-item" href="#">x-ray no.</a>
                                        <a class="dropdown-item" href="#">last name</a>
                                        <a class="dropdown-item" href="#">date</a>
                                    </div>
                                </div>
                                <input type="text" id="pending-interpretation-search-input" class="form-control" required>
                                <div class="input-group-append">
                                    <button type="submit" class="btn btn-primary input-group-text"><i class="fas fa-search" aria-hidden="true"></i></button>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div id="pending-interpretation-alert" class="alert alert-success text-center ml-3 mr-3" role="alert">
                            
                    </div>
                    <div class="card-body">
                        <div id="pending-interpretation-body">

                        </div>
                    </div>
                    <div class="text-center mb-4">
                        <h6><a id="pending-interpretation-footer" href="#" style="text-decoration:unset"><i class="fas fa-long-arrow-alt-down"></i> See more</a></h6>
                    </div>
                </div>
            </section>

            <!-- view films for interpration -->
            <div id="pending-interpretation-view-container" class="container-fluid d-none">
            </div>

            <!-- Results - nav_link_content #6 -->
            <section id="interpretation-results" class="nav_link_content d-none">
                <h3 class="heading">Teleradiology</h3>
                <div class="card">
                    <div class="card-header">
                        '.$header2.'
                    </div>
                    <div class="mt-3 mb-4 d-flex justify-content-center">
                        <form id="interpretation-results-search-form" class="d-none">
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <button id="interpretation-results-search-by" class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">x-ray no.</button>
                                    <div class="dropdown-menu">
                                        <a class="dropdown-item" href="#">x-ray no.</a>
                                        <a class="dropdown-item" href="#">last name</a>
                                        <a class="dropdown-item" href="#">date</a>
                                    </div>
                                </div>
                                <input type="text" id="interpretation-results-search-input" class="form-control" required>
                                <div class="input-group-append">
                                    <button type="submit" class="btn btn-primary input-group-text"><i class="fas fa-search" aria-hidden="true"></i></button>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div id="interpretation-results-alert" class="alert alert-success text-center ml-3 mr-3" role="alert">
                            
                    </div>
                    <div class="card-body">
                        <div id="interpretation-results-body">
                            
                        </div>
                    </div>
                    <div class="text-center mb-4">
                        <h6><a id="interpretation-results-footer" href="#" style="text-decoration:unset"><i class="fas fa-long-arrow-alt-down"></i> See more</a></h6>
                    </div>
                </div>
            </section>
            ';
        }
    ?>
    <?php
        if ($_SESSION['role'] == 'admin') {
            echo'
            <section id="administration" class="nav_link_content d-none">
                <h3 class="heading">Administration</h3>
                <div id="send-registration-email" class="card">
                    <div class="card-header">
                        Send registration email to the user
                    </div>
                    <div class="card-body">
                        <form id="send-registration-email-form">
                            <div class="alert alert-secondary mb-2 d-flex" role="alert">
                                <strong>Note: </strong>
                                <i class="ml-2">A link to the registration page will be sent to the user and will use the code to unlock the page.</i>
                            </div>
                            <div class="form-row mb-2">
                                <div id="send-registration-email-alert" class="alert w-100 text-center" role="alert">
                                    <!-- response goes here -->
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="col-md-6 mb-3">
                                    <label for="email">Email address</label>
                                    <input type="email" class="form-control input-type-email" name="email" id="email" required>
                                    <small class="form-text text-muted">
                                        Must be a valid e-mail address containing 3-32 characters long.
                                    </small>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label for="reg_code">Code</label>
                                    <input type="text" class="form-control input-type-letters-numbers" name="reg_code" id="reg_code" required>
                                    <small class="form-text text-muted">
                                        Must be 5-20 characters long, containing letters and numbers only.
                                    </small>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label for="role">Role</label>
                                    <select class="custom-select  input-type-select" name="role" id="role" required>
                                        <option selected disabled value="">Choose...</option>
                                        <option>Radiologic technologist</option>
                                        <option>Radiologist</option>
                                    </select>
                                    <small class="form-text text-muted">
                                    </small>
                                </div>
                            </div>
                            <div class="form-row mt-3">
                                <button class="btn btn-primary ml-auto" type="submit">Send</button>
                            </div>
                        </form>
                    </div>
                </div>

                <div id="user-list-container" class="card">
                    <div class="card-header">
                        User list
                    </div>
                    <div class="card-body text-center d-flex justify-content-around">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead class="text-secondary">
                                    <tr>
                                        <th>ID</th>
                                        <th>NAME</th>
                                        <th>EMAIL</th>
                                        <th>ROLE</th>
                                        <th>ACTION/S</th>
                                    </tr>
                                </thead>
                                <tbody id="user-list-body">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Modal -->
            <section id="user-info-container">
                <div id="view-user-modal" class="modal fade" data-keyboard="false" tabindex="-1" aria-labelledby="unlock-modalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content text-center">
                            <div class="d-flex justify-content-center">
                                <button type="button" class="close-modal" data-dismiss="modal" aria-label="Close">
                                    <span>Click here to close</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <div class="mb-2">
                                    <img src="" class="rounded-circle" width="200px" height="200px">
                                </div>
                                <div class="mb-4">
                                    <!-- fname and lname -->
                                </div>
                                <div class="mb-1">
                                    <!-- role -->
                                </div>
                                <div class="mb-1">
                                    <!-- email -->
                                </div>
                                <div class="mb-1">
                                    <!-- cnumber -->
                                </div>
                                <div class="mb-1">
                                    <!-- gender -->
                                </div>
                                <div class="mb-1 badge">
                                    <!-- status -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            ';
        }
    ?>

    <section id="edit-account" class="nav_link_content d-none">
        <h3 class="heading">Edit account</h3>
        <div id="edit-profile" class="card">
            <div class="card-header">
                Profile
            </div>
            <div class="card-body">
                <form id="edit-profile-form">
                    <div class="text-center">
                        <i class="fas fa-camera"></i>
                    </div>
                    <div class="mb-2 text-center">
                        <img id="profile-picture" src="resources/images/blank.jpg" width="200px" height="200px" class="rounded-circle">
                        <input type="file" class="custom-file-input d-none" name="customFile" id="customFile" accept="image/*">
                    </div>
                    <div class="form-row mb-2">
                        <div id="edit-profile-alert" class="alert w-100 text-center" role="alert">
                            <!-- response goes here -->
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="col-md-6 mb-3">
                            <label for="fname">First name</label>
                            <input type="text" class="form-control input-type-names" name="fname" id="fname">
                            <small class="form-text text-muted">
                                Must be a valid name, containing 2-32 characters long.
                            </small>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="lname">Last name</label>
                            <input type="text" class="form-control input-type-names" name="lname" id="lname">
                            <small class="form-text text-muted">
                                Must be a valid name, containing 2-32 characters long.
                            </small>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="col-md-6 mb-3">
                            <label for="edit-profile-email">Email address</label>
                            <input type="email" class="form-control input-type-email" name="edit-profile-email" id="edit-profile-email">
                            <small class="form-text text-muted">
                                Must be a valid e-mail address containing 3-32 characters long.
                            </small>
                        </div>
                        <div class="col-md-3 mb-3">
                            <label for="cnumber">Mobile no.</label>
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <span style="font-size:.9rem" class="input-group-text rounded-left">+63</span>
                                </div>
                                <input type="number" class="form-control rounded-right input-type-numbers" name="cnumber" id="cnumber">
                                <small class="form-text">
                                </small>
                            </div>
                        </div>
                        <div class="col-md-3 mb-3">
                            <label for="gender">Gender</label>
                            <select class="custom-select input-type-select" name="gender" id="gender">
                                <option>Male</option>
                                <option>Female</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row mt-3">
                        <button class="btn btn-primary ml-auto" type="submit">Update</button>
                    </div>
                </form>
            </div>
        </div>

        <div id="change-password" class="card">
            <div class="card-header">
                Change password
            </div>
            <div class="card-body">
                <form id="change-password-form">
                    <div class="form-row mb-2">
                        <div id="change-password-alert" class="alert w-100 text-center" role="alert">
                            <!-- response goes here -->
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="col-md-12 mb-3">
                            <label for="old_u_pass">Old Password</label>
                            <input type="password" class="form-control" name="old_u_pass" id="old_u_pass" required>
                            <small class="form-text text-muted">
                            </small>
                        </div>
                        <div class="col-md-12 mb-3">
                            <label for="new_u_pass">New password</label>
                            <input type="password" class="form-control input-type-letters-numbers" name="new_u_pass" id="new_u_pass" required>
                            <small class="form-text">
                                Must be 8-20 characters long, containing letters and numbers only.
                            </small>
                        </div>
                        <div class="col-md-12 mb-3">
                            <label for="new_u_pass2">Verify new Password</label>
                            <input type="password" class="form-control" name="new_u_pass2" id="new_u_pass2" required>
                            <small class="form-text text-muted">
                            </small>
                        </div>
                    </div>
                    <div class="form-row mt-3">
                        <button class="btn btn-primary ml-auto" type="submit">Update</button>
                    </div>
                </form>
            </div>
        </div>
    </section>

    
    <!-- Optional JavaScript -->
    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
    <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js" integrity="sha384-9/reFTGAW83EW2RDu2S0VKaIzap3H66lZH81PoYlFhbGU+6BZp6G7niu735Sk7lN" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.min.js" integrity="sha384-+YQ4JLhjyBLPDQt//I+STsc9iw4uQqACwlvpslubQzn4u2UU2UFM80nGisd026JF" crossorigin="anonymous"></script>
    <script src="resources/home.js"></script>
</body>
</html>
