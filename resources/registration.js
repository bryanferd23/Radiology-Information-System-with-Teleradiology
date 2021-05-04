const regex_letters_numbers = /^[a-zA-Z0-9]+$/;
const regex_numbers = /^[0-9]+$/;
const regex_names = /^([a-zA-z]+[,.]?[ ]?|[a-z]+['-]?)+$/;


//--------------- Run the scipt below when the document is ready or has loaded ---------------------------------------//
$(document).ready(function () {

    $('.alert').hide();
    $('#unlock-modal').modal('show');
    $('#form-alert').hide();

    //--- validate user input (username) ---------------------------------------------//
    $('#u_name').on('keyup', function () {
        var input = $(this).val();
        var small_tag = $(this).next();
        var input_tag = $(this);

        if (input) {
            //--- check input length ---//
            if (input.length >= 5 && input.length <= 20) {
                //--- check regular expression ---//
                if (regex_letters_numbers.test(input)) {
                    //--- Check availability of username ---//
                    $.ajax({
                        type: "GET",
                        url: "components/add_user.php",
                        data: {'check_u_name_availability' : input},
                        dataType: "html",
                        success: function (response) {
                            if (response.match('available!'))
                                input_feedback(input_tag, small_tag, response, 'valid');
                            else if (response.match('Username already taken!'))
                                input_feedback(input_tag, small_tag, response, 'invalid');
                            else {
                                $('#form-alert').html(response).css({
                                    'opacity': 0
                                });
                                $('#form-alert').show();
                                $('#form-alert').animate({
                                    'opacity': 1
                                }, 500);
                            }
                        }
                    });
                    return;
                }
            }
            input_feedback(input_tag, small_tag, 'Must be 5-20 characters long, containing letters and numbers only.', 'invalid');
        }
        else
            input_feedback(input_tag, small_tag, 'Must be 5-20 characters long, containing letters and numbers only.', 'default');
    })

    //--- validate user input (password) ---------------------------------------------//
    $('#u_pass').on('keyup', function () {
        var input = $(this).val();
        var input_tag = $(this);
        var small_tag = $(this).next();
        
        if (input) {
            //--- check input length ---//
            if (input.length >= 8 && input.length <= 20) {
                //--- check regular expression ---//
                if (regex_letters_numbers.test(input)) {
                    input_feedback(input_tag, small_tag, 'Looks good!', 'valid');
                    $('#u_pass2').keyup();
                    return;
                }
            }
            input_feedback(input_tag, small_tag, 'Must be 8-20 characters long, containing letters and numbers only.', 'invalid');
        }
        else
            input_feedback(input_tag, small_tag, 'Must be 8-20 characters long, containing letters and numbers only.', 'default');
        $('#u_pass2').keyup();
    })

    //--- verify if password is the same ---------------------------------------------//
    $('#u_pass2').on('keyup', function () {
        var input = $(this).val();
        var upass = $('#u_pass').val();
        var small_tag = $(this).next();
        var input_tag = $(this);
        
        if (input) {
            //--- check of password is same ---//
            if (input == upass)
                input_feedback(input_tag, small_tag, 'Looks good!', 'valid');
            else
                input_feedback(input_tag, small_tag, 'Password mismatch!', 'invalid');
        }
        else
            input_feedback(input_tag, small_tag, '', 'default');
    })

    //--- validate user input first name ---------------------------------------------//
    $('.names').on('keyup', function () {
        var input = $(this).val();
        var small_tag = $(this).next();
        var input_tag = $(this);
        
        if (input) {
            //--- check input length ---//
            if (input.length >= 2 && input.length <= 32) {
                //--- check regular expression ---//
                if (regex_names.test(input)) {
                    input_feedback(input_tag, small_tag, 'Looks good!', 'valid');
                    return;
                }
            }
            input_feedback(input_tag, small_tag, 'Must be a valid name, containing 2-32 characters long.', 'invalid');
        }
        else
            input_feedback(input_tag, small_tag, 'Must be a valid name, containing 2-32 characters long.', 'default');
    })

    $('#gender').on('change', function () {
        var input = $(this).val();
        var small_tag = $(this).next();
        var input_tag = $(this);

        if (input) {
            input_feedback(input_tag, small_tag, 'Looks good!', 'valid');
        }
        else 
            input_feedback(input_tag, small_tag, '', 'default');
    })

    //--- validate user input (mobile number) ---------------------------------------------//
    $('#cnumber').on('keyup', function () {
        var input = $(this).val();
        var small_tag = $(this).next();
        var input_tag = $(this);

        if (input) {
            //--- check input length ---//
            if (input.length == 10) {
                //--- check regular expression ---//
                if (regex_numbers.test(input)) {
                    input_feedback(input_tag, small_tag, 'Looks good!', 'valid');
                    return;
                }
            }
            input_feedback(input_tag, small_tag, 'Invalid mobile number!', 'invalid');
        }
        else
            input_feedback(input_tag, small_tag, '', 'default');
    })


//--- unlock register form submit ---------------------------------------------------------------------------------//
    $('#unlock-modal-form').on('submit', function(e) {
        e.preventDefault();
        var alert_tag = $(this).find('.alert');
        var loading_tag_container = $(this).find('.progress');
        var loading_tag = $(this).find('.progress-bar');

        var button = $(this);

        //--- prevent from running another process if this specific request is not completed ---//
        if (!button.data('requestRunning')) {
            button.data('requestRunning', true);    

            alert_tag.hide();
            loading_tag_container.removeClass('d-none');
            loading_tag.animate({
                width: "100%"
            }, 250);

            $.ajax({
                type: "POST",
                url: "components/verify_reg_code.php",
                data: $(this).serialize(),
                dataType: "html",
                success: function (response) {
                    loading_tag.finish();
                    alert_tag.finish();
                    loading_tag_container.addClass('d-none');
                    loading_tag.css({
                        width: "0%"
                    });
                    if (response.match('Success!')){
                        location.reload();
                    }
                    else {
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
                },
                complete: function() {
                    button.data('requestRunning', false);
                }
            });
        }
    })

    
//--- register form submit ---------------------------------------------------------------------------------//
    $('#register-form').on('submit', function(e) {
        e.preventDefault();
        var alert_tag = $(this).find('.alert');
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

        //--- prevent from running another process if this specific request is not completed ---//
        //--- prevent from running if an input is invalid ---//
        if (all_valid && !button.data('requestRunning')) {
            button.data('requestRunning', true);    

            $('#email').prop('disabled', false);
            $('#role').prop('disabled', false);
            alert_tag.hide();
            loading_tag_container.removeClass('d-none');
            loading_tag.animate({
                width: "100%"
            }, 250);

            $.ajax({
                type: "POST",
                url: "components/add_user.php",
                data: $(this).serialize(),
                dataType: "html",
                success: function (response) {
                    loading_tag.finish();
                    alert_tag.finish();
                    loading_tag_container.addClass('d-none');
                    loading_tag.css({
                        width: "0%"
                    });
                    if (response.match('<div')){
                        $('#redirect-message-container-modal-content').html(response);
                        $('#redirect-message-container-modal').modal('show', setTimeout(function () {
                                window.location.replace('login.php');
                            }, 7000));
                    }
                    else {
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
                },
                complete: function() {
                    button.data('requestRunning', false);
                    $('#email').prop('disabled', true);
                    $('#role').prop('disabled', true);
                }
            });
        }
    })
});

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