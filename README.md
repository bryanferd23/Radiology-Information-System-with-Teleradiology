# RISystem
Web-based Radiological Information System (Progress: 40%)

--------------------------------------------------
**Component folder**

-server side scripts (functionalities)

**Resources folder**

-css, JS, images


**Vendor folder**

-php mailer

**Views**

-login.php, home.php

**Database**

-db.php.text

--------------------------------------------------
**What works?**

-login/logout

-authentication

-forgot password (email a new pass)

-add user by sending registration email (admin account only)

-view and disable/activate user (admin account only)

-edit account (profile w/ image and change password)

-adding patient (radtech role only)

-view patient list


--------------------------------------------------
**Under the hood?**

-all user inputs are verified/sanitized before sending it to the server

-password are hashed (bcrypt)

-restrict access to web page (will redirect if requirements are not met)

-blocks device from logging in/unlock the registration page if failed 10 times (still applies even if the cookies are cleared)

-prepared statement (protects from SQL injection)
