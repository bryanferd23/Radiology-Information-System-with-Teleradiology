<?php
    session_start();
    if (isset($_SESSION['loggedin'])){
       header('location: home.php');
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
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.1.1/css/all.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css" integrity="sha384-B0vP5xmATw1+K9KRQjQERJvTumQW0nPEzvF6L/Z6nronJ3oUOFUFpCjEUQouq2+l" crossorigin="anonymous">
    <link rel="stylesheet" href='resources/login.css'>
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

    <section>
      <div class="card">
        <div class="card-header">
            <h3 class="display-6">Radiological Information System</h3>
            <p class="lead">Visayas State University Infirmary - Radiology Department</p>
        </div>
        <div class="card-body">
          <div id="login-container">
            <!-- login window goes here -->
            <div class="modal-body border">
              <form id="login-form">
                <div id="login-header">
                  <i class="fas fa-user-circle"></i>
                </div>
                <hr>
                <div class="form-row">
                  <div id="login-alert" class="alert alert-danger w-100 text-center" role="alert">
                      <!-- response goes here -->
                  </div>
                </div>
                <div class="form-row">
                  <div class="col-md-12 mb-3">
                      <label for="u_name">Username</label>
                      <div class="input-group">
                          <div class="input-group-prepend">
                              <span style="font-size:.9rem" class="input-group-text rounded-left"><i class="fas fa-user"></i></span>
                          </div>
                          <input type="text" class="form-control rounded-right" name="u_name" id="u_name" required>
                          <small class="form-text text-muted">
                          </small>
                      </div>
                  </div>
                </div>
                <div class="form-row">
                  <div class="col-md-12 mb-3">
                      <label for="u_pass">Password</label>
                      <div class="input-group">
                          <div class="input-group-prepend">
                              <span style="font-size:.9rem" class="input-group-text rounded-left"><i class="fa fa-lock" aria-hidden="true"></i></span>
                          </div>
                          <input type="password" class="form-control rounded-right" name="u_pass" id="u_pass" required>
                          <small class="form-text text-muted">
                          </small>
                      </div>
                  </div>
                </div>
                <div class="form-row mt-3">
                  <a id="forgot-pass-trigger" class="ml-auto mr-4 mt-1 text-dark" href="#"><u>Forgot your password?</u></a>
                  <button type="submit" id="login-submit" class="btn btn-primary">Login</button>
                </div>
              </form>

              <!-- forgor pass goes here -->
              <div id="forgot-pass-container" class="d-none">
                <div id="forgot-pass-header">
                  <a id="login-trigger" href="#"><i class="fas fa-angle-left align-middle"></i> Login</a>
                </div>
                <hr>
                <div class="alert alert-secondary d-flex justify-content-center mb-2" role="alert">
                    <strong>Note: </strong>
                    <i class="ml-1">A new password will be sent to the email address associated with your account. Use the new password to login and change your password in settings.</i>
                </div>
                <form id="forgot-pass-form">
                  <div class="form-row">
                      <div id="forgot-pass-alert" class="alert w-100 text-center" role="alert">
                          <!-- response goes here -->
                      </div>
                  </div>
                  <div class="form-row">
                    <div class="col-md-12 mb-3">
                      <label for="email">Email address</label>
                      <input type="email" class="form-control" name="email" id="email" required>
                      <small class="form-text text-muted">
                          Must be a valid e-mail address containing 3-32 characters long.
                      </small>
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="col-md-12 mb-3">
                      <label for="email2">Confirm email address</label>
                      <input type="text" class="form-control" name="email2" id="email2" required>
                      <small class="form-text text-muted">
                      </small>
                    </div>
                  </div>
                  <div class="form-row">
                    <button type="submit" class="btn btn-primary ml-auto">Submit</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          <div id="x-ray-info" class="text-center">
                  <!-- contacts goes here -->
          </div>
        </div>
      </div>
    </section>
    
    <!-- Optional JavaScript -->
    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
    <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js" integrity="sha384-9/reFTGAW83EW2RDu2S0VKaIzap3H66lZH81PoYlFhbGU+6BZp6G7niu735Sk7lN" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.min.js" integrity="sha384-+YQ4JLhjyBLPDQt//I+STsc9iw4uQqACwlvpslubQzn4u2UU2UFM80nGisd026JF" crossorigin="anonymous"></script>
    <script src="resources/login.js"></script>
</body>
</html>
