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
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.1.1/css/all.css" integrity="sha384-O8whS3fhG2OnA5Kas0Y9l3cfpmYjapjI0E4theH4iuMD+pLhbf6JI0jIMfYcK3yZ" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css" integrity="sha384-B0vP5xmATw1+K9KRQjQERJvTumQW0nPEzvF6L/Z6nronJ3oUOFUFpCjEUQouq2+l" crossorigin="anonymous">
    <link rel="stylesheet" href='resources/login.css'>
  </head>
  <body>
    <nav class="navbar sticky-top">
      <a id="x-ray-status" href="#" class="nav-link bg-warning text-dark align-middle ml-auto rounded-pill">Status of X-Ray result</a>
      <a id="login" href="#" class="nav-link bg-warning text-dark align-middle ml-3 rounded-pill">Login</a>
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

    <section>
      <div class="card">
        <div class="card-header">
            <h3 class="display-6">Radiological Information System</h3>
            <p class="lead">Visayas State University Infirmary - Radiology Department</p>
        </div>
        <div class="card-body">
          <div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel">
            <ol class="carousel-indicators">
              <li data-target="#carouselExampleIndicators" data-slide-to="0" class="active"></li>
              <li data-target="#carouselExampleIndicators" data-slide-to="1"></li>
              <li data-target="#carouselExampleIndicators" data-slide-to="2"></li>
              <li data-target="#carouselExampleIndicators" data-slide-to="3"></li>
            </ol>
            <div class="carousel-inner">
              <div class="carousel-item active">
                <img src="resources/images/x-ray_room1.jpg" class="d-block" alt="...">
              </div>
              <div class="carousel-item">
                <img src="resources/images/x-ray_room2.jpg" class="d-block" alt="..." loading="lazy">
              </div>
              <div class="carousel-item">
                <img src="resources/images/x-ray_room3.jpg" class="d-block" alt="..." loading="lazy">
              </div>
              <div class="carousel-item">
                <img src="resources/images/x-ray_room4.jpg" class="d-block" alt="..." loading="lazy">
              </div>
            </div>
            <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="sr-only">Previous</span>
            </a>
            <a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="sr-only">Next</span>
            </a>
          </div>
          <div id="login-container">
            <div id="x-ray-info" class="text-center">
                  <!-- contacts goes here -->
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal -->
    <section id="search-container">
      <div class="modal fade" data-keyboard="false" tabindex="-1" aria-labelledby="unlock-modalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-body">
              <div class="modal-header d-flex justify-content-center">
                Check the status of your x-ray result
              </div>
              <div class="d-flex justify-content-center">
                <form id="search-form">
                  <div class="form-group">
                    <div class="input-group">
                      <input type="text" name="status" id="search-x-ray-result" class="form-control" placeholder="Enter X-Ray no." aria-describedby="helpId" required>
                      <div class="input-group-append">
                        <button type="submit" class="btn btn-primary input-group-text"><i class="fas fa-search mr-1" aria-hidden="true"></i> Search</button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div id="search-response" class="text-center mb-5">
                    
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal -->
    <section id="login-container">
      <div class="modal fade" data-keyboard="false" tabindex="-1" aria-labelledby="unlock-modalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-body">
              <div class="d-flex justify-content-center">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Modal -->
    <section id="forgot-pass-container">
      <div class="modal" data-keyboard="false" tabindex="-1" aria-labelledby="unlock-modalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-body">
              <div class="d-flex justify-content-center">
                <form id="forgot-pass-form">
                  <div class="form-row" id="forgot-pass-header">
                    <a id="login-trigger" href="#"><i class="fas fa-angle-left align-middle"></i> Login</a>
                  </div>
                  <hr>
                  <div class="alert alert-secondary mb-2 d-flex" role="alert">
                      <strong>Note: </strong>
                      <i class="ml-1">A new password will be sent to the email address associated with your account. Use the new password to login and change your password in settings.</i>
                  </div>
                  <div class="progress mb-2 d-none">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%"></div>
                  </div>
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
