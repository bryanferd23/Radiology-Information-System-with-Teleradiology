const regex_email = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

$(document).ready(function () {
    $('.alert').hide();

    $('#forgot-pass-trigger').on('click', function() {
        $('#login-form').addClass('d-none');
        $('#forgot-pass-container').removeClass('d-none');
    })
    $('#login-trigger').on('click', function(e) {
        $('#login-form').removeClass('d-none');
        $('#forgot-pass-container').addClass('d-none');
    })


    $('#login-form').on('submit', function(e) {
        e.preventDefault();
        let alert_tag = $('#login-alert');
        
        alert_tag.hide();
        input_feedback($('#u_pass'), $('#u_pass').next(), '', 'default');
        input_feedback($('#u_name'), $('#u_name').next(), '', 'default');

        $('#login-form').css('opacity', .2);
        $("#login-container .modal-body").addClass('ajax-loader');
        $("#login-submit").attr('disabled');
        
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
            }, 
            complete: function() {
                setTimeout(function(){
                    $('#login-form').css('opacity', 1);
                    $("#login-container .modal-body").removeClass('ajax-loader');
                    $("#login-submit").removeAttr('disabled');
                },2000);
            }
        });
    })

    //--- validate user input (email) ---------------------------------------------------------//
    $('#email').on('keyup', function () {
        let input = $(this).val();
        let input_tag =  $(this);
        let small_tag = $(this).next();

        if (input) {
            //--- check input length ---//
            if (input.length >= 3 && input.length <= 32) {
                //--- check regular expression ---//
                if (regex_email.test(input)) {
                    input_feedback(input_tag, small_tag, 'Looks good!', 'valid');
                    $('#email2').keyup();
                    return;
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
        let input = $(this).val();
        let email = $('#email').val();
        let small_tag = $(this).next();
        let input_tag = $(this);
        
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
        let alert_tag = $('#forgot-pass-alert');
        let inputs = $(this).find('input');
        let all_valid = true;
        let button = $(this);

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
            $('#forgot-pass-form .form-row').css('opacity', .2);
            $('#forgot-pass-form').addClass('ajax-loader');
            
            $.ajax({
                type: "POST",
                url: "components/forgot_pass.php",
                data: {'email' : $('#email').val()},
                dataType: "html",
                success: function (response) {
                    alert_tag.finish();
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
                    $('#forgot-pass-form .form-row').css('opacity', 1);
                    $('#forgot-pass-form').removeClass('ajax-loader');
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