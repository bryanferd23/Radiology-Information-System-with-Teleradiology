<?php
    session_start();
//--------------- check if reg_id is present if not redirect to login page -----------------//
    if (!isset($_REQUEST['reg_id'])) {
        header('location: login.php');
        exit;
    }
    else {
// ------------- check if reg_id is valid ------------------------------------------------//
//-------------- store to session if valid else redirect to login page --------------------//
        $con = mysqli_connect("localhost", "root", "", "vsu_i_ris");
        if (!$con)
            exit(mysqli_connect_error());
        if ($stmt = $con->prepare('SELECT * FROM pending_registration WHERE reg_id = '.$_REQUEST['reg_id'].'')) {
            $stmt->execute();
            $stmt->store_result();
            if ($stmt->num_rows() <= 0) {
                header('location: login.php');
                exit;
            }
            else
                $_SESSION['reg_id'] = $_REQUEST['reg_id'];
        }
        else {
            echo mysqli_error($con);
            $con->close();
            exit;
        }
        $con->close();
    }
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
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.1.1/css/all.css" integrity="sha384-O8whS3fhG2OnA5Kas0Y9l3cfpmYjapjI0E4theH4iuMD+pLhbf6JI0jIMfYcK3yZ" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css" integrity="sha384-B0vP5xmATw1+K9KRQjQERJvTumQW0nPEzvF6L/Z6nronJ3oUOFUFpCjEUQouq2+l" crossorigin="anonymous">
    <link rel="stylesheet" href='resources/home.css'>
  </head>
  <body>
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
        if (!isset($_SESSION['reg_unlock']) || $_SESSION['reg_unlock'] != $_SESSION['reg_id']) {
            echo '<section id="modal-container">
                    <!-- Modal -->
                    <div class="modal fade" id="unlock-modal" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-labelledby="unlock-modalLabel" aria-hidden="true">
                        <form id="unlock-modal-form" class="modal-dialog modal-dialog-centered">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="unlock-modalLabel">Registration is locked!</h5>
                                </div>
                                <div class="modal-body">
                                    <div class="progress mb-2 d-none">
                                        <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%"></div>
                                    </div>
                                    <div class="form-row">
                                            <div id="alert" class="alert alert-danger w-100 text-center" role="alert">
                                            </div>
                                    </div>
                                    <div class="form-row">
                                        <div class="col-md-12 mb-3">
                                            <input type="text" class="form-control" name="reg_code" id="reg_code" value="" placeholder="Enter code here" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="submit" class="btn btn-primary">Unlock</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </section>';
        }
    ?>

    <section id="register">
        <div class="card">
            <div class="card-header">
                Register
            </div>
            <div class="card-body">
                <form id="register-form">
                    <div class="alert alert-secondary mb-4 d-flex justify-content-center" role="alert">
                        <i>Please fill out the the necessary information</i>
                    </div>
                    <div class="progress mb-2 d-none">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%"></div>
                    </div>
                    <div class="form-row">
                        <div id="form-alert" class="alert alert-danger w-100 text-center" role="alert">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="col-md-6 mb-3">
                            <label for="u_name">Username</label>
                            <input type="text" class="form-control" name="u_name" id="u_name" value="" required>
                            <small class="form-text text-muted">
                                Must be 5-20 characters long, containing letters and numbers only.
                            </small>
                        </div>
                        <div class="col-md-3 mb-3">
                            <label for="u_pass">Password</label>
                            <input type="password" class="form-control" name="u_pass" id="u_pass" value="" required>
                            <small class="form-text text-muted">
                                Must be 8-20 characters long, containing letters and numbers only.
                            </small>
                        </div>
                        <div class="col-md-3 mb-3">
                            <label for="u_pass2">Verify password</label>
                            <input type="password" class="form-control" name="u_pass2" id="u_pass2" value="" required>
                            <small class="form-text">
                            </small>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="col-md-6 mb-3">
                            <label for="fname">First name</label>
                            <input type="text" class="form-control names" name="fname" id="fname" value="" required>
                            <small class="form-text text-muted">
                                Must be a valid name, containing 2-32 characters long.
                            </small>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="lname">Last name</label>
                            <input type="text" class="form-control names" name="lname" id="lname" value="" required>
                            <small class="form-text text-muted">
                                Must be a valid name, containing 2-32 characters long.
                            </small>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="col-md-6 mb-3">
                            <label for="gender">Gender</label>
                            <select class="custom-select" name="gender" id="gender" required>
                                <option selected disabled value="">Choose...</option>
                                <option>Male</option>
                                <option>Female</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="cnumber">Mobile no.</label>
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <span style="font-size:.9rem" class="input-group-text rounded-left">+63</span>
                                </div>
                                <input type="text" class="form-control rounded-right" name="cnumber" id="cnumber" required>
                                <small class="form-text">
                                </small>
                            </div>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="col-md-6 mb-3">
                            <label for="email">Email address</label>
                            <input type="email" class="form-control" name="email" id="email" value="<?php if (isset($_SESSION['email']))
                                                                                                            echo $_SESSION['email'];?>" disabled>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="role">Role</label>
                            <input type="text" class="form-control" name="role" id="role" value="<?php if (isset($_SESSION['role']))
                                                                                                        echo $_SESSION['role'];?>" disabled>
                        </div>
                    </div>
                    <div class="form-row mt-3">
                        <button class="btn btn-primary ml-auto" id="register-form-submit" type="submit">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    </section>

    <section id="redirect-message-container">
    <!-- Modal -->
        <div id="redirect-message-container-modal" class="modal fade" data-backdrop="static" data-keyboard="false" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div id="redirect-message-container-modal-content" class="modal-content text-center">
                    <!-- Successfull account creation and redirect message goes here -->
                </div>
            </div>
        </div>
    </section>

    <!-- Optional JavaScript -->
    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
    <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js" integrity="sha384-9/reFTGAW83EW2RDu2S0VKaIzap3H66lZH81PoYlFhbGU+6BZp6G7niu735Sk7lN" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.min.js" integrity="sha384-+YQ4JLhjyBLPDQt//I+STsc9iw4uQqACwlvpslubQzn4u2UU2UFM80nGisd026JF" crossorigin="anonymous"></script>
    <script src="resources/registration.js"></script>
</body>
</html>