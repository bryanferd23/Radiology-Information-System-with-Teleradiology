# RISystem
Web-based Radiological Information System (Progress: 95%)

--------------------------------------------------
**Component folder**

-server side scripts (functionalities)

**Resources folder**

-css, js, images


**Vendor folder**

-php mailer

**Views**

-login.php, home.php

**Database**

-db.php.text

--------------------------------------------------
**What works?**

-login/logout (authentication)

-forgot password (emails a new pass)

-add user by sending registration email (admin account only)

-view, disable, and activate user (admin account only)

-edit account (profile w/ image and change password)

-add patient (radtech role only)

-view patient list

-search patient by(x-ray no, last name, date)

-edit patient (radtech role only)

-sending/uploading of X-ray image(radtech role only)

-pending interpretation(display and delete items)(history of sending/uploading of X-ray image)

-for reading(radiologist can interpret digital films and give their findings and diagnosis)

-recent diagnosis(radiologist can edit previously interpreted films)

-results(x-ray result printing)

--------------------------------------------------
**Under the hood?**

-all user inputs are verified/sanitized before sending it to the server

-password are hashed (bcrypt)

-restrict access to web page (will redirect if requirements are not met)

-blocks device from logging in or from unlocking registration page if failed 10 times (still applies even if the cookies & sessions are cleared)

-prepared statement (protects from SQL injection)

-contact info in landing page reflects on (disable, enable, and edit of account)
