const regex_email = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

$(document).ready(function () {
    $('.alert').hide();

    $('#x-ray-status').on('click', function(e) {
        e.preventDefault();
        $('#search-container .modal').modal('show');
    })

    $('#login').on('click', function(e) {
        e.preventDefault();
        $('#login-container .modal').addClass('fade');
        $('#login-container .modal').modal('show');
    })

    $('#forgot-pass-trigger').on('click', function() {
        $('#login-container .modal').removeClass('fade');
        $('#login-container .modal').modal('hide');
        $('#forgot-pass-container .modal').modal('show');
    })
    $('#login-trigger').on('click', function(e) {
        e.preventDefault();
        $('#forgot-pass-container .modal').modal('hide');
        $('#login-container .modal').removeClass('fade');
        $('#login-container .modal').modal('show');
    })

    $('#search-form').on('submit', function(e) {
        e.preventDefault();

        $.ajax({
            type: "GET",
            url: "components/xray_status.php",
            data: $(this).serialize(),
            dataType: "html",
            success: function (response) {
                $('#search-response').html(response);
            }
        });
    })

    $('#login-form').on('submit', function(e) {
        e.preventDefault();
        var alert_tag = $('#login-alert');
        alert_tag.hide();
        input_feedback($('#u_pass'), $('#u_pass').next(), '', 'default');
        input_feedback($('#u_name'), $('#u_name').next(), '', 'default');

        $.ajax({
            type: "POST",
            url: "components/auth.php",
            data: $(this).serialize(),
            dataType: "html",
            success: function (response) {
                if (response.match('password')){
                    input_feedback($('#u_pass'), $('#u_pass').next(), response, 'invalid');
                }
                else if(response.match('username')){
                    input_feedback($('#u_name'), $('#u_name').next(), response, 'invalid');
                }
                else if (response.match('disabled') || response.match('Too')){
                    alert_tag.removeClass('d-none');
                    alert_tag.html(response).css({
                        'opacity': 0
                    });
                    alert_tag.show();
                    alert_tag.animate({
                        'opacity': 1
                    }, 500);
                    alert_tag.fadeTo(5000, 500).slideUp(500, function(){
                        alert_tag.slideUp(500);
                    });
                }
                else {
                    window.location.replace(response);
                }
            }
        });
    })

    //--- validate user input (email) ---------------------------------------------------------//
    $('#email').on('keyup', function () {
        var input = $(this).val();
        var input_tag =  $(this);
        var small_tag = $(this).next();

        if (input) {
            //--- check input length ---//
            if (input.length >= 3 && input.length <= 32) {
                //--- check regular expression ---//
                if (regex_email.test(input)) {
                    input_feedback(input_tag, small_tag, 'Looks good!', 'valid');
                    $('#email2').keyup();
                    throw "";
                }
            }
            input_feedback(input_tag, small_tag, 'Must be a valid email address containing 3-32 characters long.', 'invalid');
        }
        else
            input_feedback(input_tag, small_tag, 'Must be a valid email address containing 3-32 characters long.', 'default');
        $('#email2').keyup();
    })
    
     //--- verify if two email are same ---------------------------------------------------------//
     $('#email2').on('keyup', function () {
        var input = $(this).val();
        var email = $('#email').val();
        var small_tag = $(this).next();
        var input_tag = $(this);
        
        if (input) {
            //--- check of password is same ---//
            if (input == email)
                input_feedback(input_tag, small_tag, 'Looks good!', 'valid');
            else
                input_feedback(input_tag, small_tag, 'Email mismatch!', 'invalid');
        }
        else
            input_feedback(input_tag, small_tag, '', 'default');
    })

    //--- forgot pass on submit ---------------------------------------------------------//
    $('#forgot-pass-form').on('submit', function (e) {
        e.preventDefault();
        var alert_tag = $('#forgot-pass-alert');
        var loading_tag_container = $(this).find('.progress');
        var loading_tag = $(this).find('.progress-bar');

        var inputs = $(this).find('input');
        var all_valid = true;
        var button = $(this);

        //--- check if all inputs inside the form is valid ---//
        //--- focus on input that is not valid --//
        $.each(inputs, function () {
            if ($(this).hasClass('is-invalid')) {
                $(this).focus();
                all_valid = false;
                return;
            }
        })
        //--- prevent from running if an input tag is invalid ---//
        //--- prevent from running another process if this specific request is not completed ---//
        if (all_valid && !button.data('requestRunning')) {
            button.data('requestRunning', true);

            alert_tag.hide();
            alert_tag.removeClass('alert-success');
            alert_tag.removeClass('alert-danger');
            loading_tag_container.removeClass('d-none');
            loading_tag.animate({
                width: "100%"
            }, 250);
            
            $.ajax({
                type: "POST",
                url: "components/forgot_pass.php",
                data: {'email' : $('#email').val()},
                dataType: "html",
                success: function (response) {
                    loading_tag.finish();
                    alert_tag.finish();
                    loading_tag_container.addClass('d-none');
                    loading_tag.css({
                        width: "0%"
                    });
                    if (response.match('Success!'))
                        alert_tag.addClass('alert-success');
                    else
                        alert_tag.addClass('alert-danger');
                    alert_tag.html(response).css({
                        'opacity': 0
                    });
                    alert_tag.show();
                    alert_tag.animate({
                        'opacity': 1
                    }, 500);
                    alert_tag.fadeTo(5000, 500).slideUp(500, function(){
                        alert_tag.slideUp(500);
                    });
                },
                //--- if ajax request is complete, set request running to false---//
                complete: function() {
                    button.data('requestRunning', false);
                }
            });
        }
    })

    get_contacts();
});

function get_contacts() {
    $.ajax({
        type: "GET",
        url: "components/get_user_info.php",
        data: {"contacts" : "ok"},
        dataType: "json",
        success: function (response) {
            if(response['error'])
                $('#x-ray-info b').html('');
            else {
                $('#x-ray-info').html('\
                <b>For inquiries, please contact:</b>\
                <p><i class="far fa-user"></i> '+response['fname']+' '+response['lname']+', RRT<br>\
                <i class="far fa-envelope"></i><a href="https://mail.google.com/mail/?view=cm&fs=1&to='+response['email']+'" target="_blank"> '+response['email']+'</a><br>\
                <i class="fa fa-mobile-alt"></i> (+63) '+response['cnumber']+'</p>');
            }
        }
    });
}

function input_feedback(input_tag, small_tag, feedback, status) {
    small_tag.removeClass('text-muted');
    small_tag.removeClass('valid-feedback');
    small_tag.removeClass('invalid-feedback');
    input_tag.removeClass('is-valid');
    input_tag.removeClass('is-invalid');

    if (status == 'valid') {
        input_tag.addClass('is-valid');
        small_tag.html(feedback);
        small_tag.addClass('valid-feedback');
    }
    else if (status == 'invalid') {
        input_tag.addClass('is-invalid');
        small_tag.html(feedback);
        small_tag.addClass('invalid-feedback');
    }
    else {
        small_tag.html(feedback);
        small_tag.addClass('text-muted');
    }
}