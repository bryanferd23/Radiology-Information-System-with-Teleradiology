const regex_email = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const regex_letters_numbers = /^[a-zA-Z0-9]+$/;
const regex_numbers = /^[0-9]+$/;
const regex_names = /^([a-zA-z]+[,.]?[ ]?|[a-z]+['-]?)+$/;
const regex_x_ray_no = /^([0-9][0-9][-][0-9]+)$/;
const regex_sentence = /^[a-zA-Z][a-zA-Z0-9 .,'-(.+)((\r?\n.+)*]+$/;
const regex_file_name = /^[-0-9A-Za-z_\.]+$/;

var temp;
var date = new Date();
var today = date.toISOString().substr(0, 10)
date.setDate(date.getDate()-1);
var yesterday = date.toISOString().substr(0, 10);
date.setDate(date.getDate()+2);
var tom = date.toISOString().substr(0, 10);
//--------------- Run the scipt below when the document is ready or has loaded ---------------------------------------//
$(document).ready(function () {
    $('section .alert').hide();
    $("#welcome-message").fadeTo(15000, 500).slideUp(500);
    //--- switch content when navigation links is clicked --------------------------//
    $.each($('.navlinks'), function (indexInArray) { 
        $(this).on('click', function(e) {
             e.preventDefault();
            if ($(this).html().match("Administration")) {
                get_user_list();
            }
            if ($(this).html().match("Add patient")) {
                $('#exam_date').val(today);
            }
            if ($(this).html().match("Patients") || $(this).html().match("Show list")) {
                populate_patient_list();
            }
            if ($(this).html().match("Pending interpretation")) {
                get_for_reading_list("radtech");
            }
            if ($(this).html().match("For reading")) {
                get_for_reading_list("radiologist");
            }
            if ($(this).html().match("Results")) {
                get_for_printing_list("radtech");
            }
            if ($(this).html().match("Recent diagnoses")) {
                get_for_printing_list("radiologist");
            }
            $(".nav_link_content").addClass('d-none');
            $(".nav_link_content").eq(indexInArray).css({
                'opacity': 0,
                'margin-left': '-5rem'
            })
            $(".nav_link_content").eq(indexInArray).removeClass('d-none');
            $(".nav_link_content").eq(indexInArray).animate({
                'transition-timing-function': 'ease-in-out',
                'margin-left': '0',
                'opacity': .75,
            }, 250, function() {
                $(".nav_link_content").eq(indexInArray).css({
                    'opacity': 1,
                })
            })
         })
    });
    
    $(document).click(function (event) {
        var clickover = $(event.target);
        var _opened = $(".navbar-collapse").hasClass("show");
        if (_opened === true && !clickover.hasClass("navbar-toggler")) {
            $(".navbar-toggler").click();
        }
    });
    //--- logout-----------------------------------------------------------------//
    $('#logout').on('click', function (e) {
        e.preventDefault();

        $.ajax({
            type: "GET",
            url: "components/logout.php",
            data: {"logout" : "ok"},
            dataType: "html",
            success: function (response) {
                window.location.replace(response);
            }
        });
    })
    
    //--- send registraion email form submit -------------------------------------//
    $('#send-registration-email-form').on('submit', function(e) {
        e.preventDefault();
        //assign
        let alert_tag = $('#send-registration-email-alert');
        let inputs = $(this).find('input');
        let small_tags = $(this).find('small');
        let selects = $(this).find('select');
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
        
        //--- prevent from running another process if this specific request is not completed ---//
        //--- prevent from running if an input is invalid ---//
        if (all_valid && !button.data('requestRunning')) {
            button.data('requestRunning', true);    

            //--- show loading animation while request is running ---//
            alert_tag.hide();
            $('#send-registration-email-form').css('opacity', .2);
            $('#send-registration-email-form').parent().addClass('ajax-loader');
            //--- run ajax request ---//
            $.ajax({
                type: "POST",
                url: "components/add_pending_reg.php",
                data: $(this).serialize(),
                dataType: "html",
                success: function (response) {
                    alert_tag.finish();
                    $('#send-registration-email-form').css('opacity', 1);
                    $('#send-registration-email-form').parent().removeClass('ajax-loader');
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
                        alert_tag.removeClass('alert-success');
                        alert_tag.removeClass('alert-danger');
                    });
                },
                //--- if ajax request is complete, set request running to false---//
                complete: function() {
                    button.data('requestRunning', false);
                    inputs.removeClass('is-valid').val('');
                    small_tags.html('').removeClass('is-valid');
                    selects.removeClass('is-valid');
                }
            });
        }
    })

    //--- get user list when "view" is clicked -------------------------------------------//
    $(this).on('click', '#user-list-view', function (e) {
        e.preventDefault();
        let u_id = $(this).parent().parent().index()+1;
        $('#user-info-container .badge').removeClass('badge-success');
        $('#user-info-container .badge').removeClass('badge-secondary');
        
        $("#user-list-container .card-body").css('opacity', .2);
        $("#user-list-container").addClass('ajax-loader');

        $.ajax({
            type: "GET",
            url: "components/get_user_info.php",
            data: {'u_id' : u_id},
            dataType: "json",
            //--- if ajax request is success, place the user info inside modal's inner HTML ---//
            success: function (response) {
                $("#user-list-container .card-body").css('opacity', 1);
                $("#user-list-container").removeClass('ajax-loader');
                let row = $('#user-info-container .modal-body').children();
                row.eq(0).children().attr('src', response['img_url']);
                row.eq(1).html(response['fname'] + " " + response['lname']);
                row.eq(2).html(response['role']);
                row.eq(3).html(response['email']);
                row.eq(4).html("(+63) " + response['cnumber']);
                row.eq(5).html(response['gender']);
                let color = 'badge-success';
                if (response['status'] == 'DISABLED')
                    color = 'badge-secondary';
                row.eq(6).html(response['status']).addClass(color);
            },
            //--- if ajax request is complete, show the modal ---//
            complete: function() {
                $('#view-user-modal').modal('show');
            }
        });
    })
    //--- Toggle status of the user (disable or enable account) -------------------------------------------//
    $(this).on('click', '#user-list-change-user-status', function (e) {
        e.preventDefault();
        let status = $(this).html();
        let u_id = $(this).parent().parent().index()+1;
        
        if (status == "ACTIVATE" || status == "DISABLE") {
            status = (status == "DISABLE" ? "DISABLED" : "ACTIVE");
            $("#user-list-container .card-body").css('opacity', .2);
            $("#user-list-container").addClass('ajax-loader');
            $.ajax({
                type: "POST",
                url: "components/update_user.php",
                data: {'u_id' : u_id, 'change_status_to' : status},
                dataType: "html",
                //--- if ajax request is success, place the user info inside modal's inner HTML ---//
                success: function (response) {
                   if (response.match('Success!')) {
                        get_user_list();
                   }
                }
            });
        }
    })

    //--- validate user input (email) ---------------------------------------------------------//
    $('.input-type-email').on('keyup', function () {
        let input = $(this).val();
        let input_tag =  $(this);
        let small_tag = $(this).next();

        if (input) {
            //--- check input length ---//
            if (input.length >= 3 && input.length <= 32) {
                //--- check regular expression ---//
                if (regex_email.test(input)) {
                    $.ajax({
                        type: "POST",
                        url: "components/add_pending_reg.php",
                        data: {'check_email_availability' : input},
                        dataType: "html",
                        success: function (response) {
                            if (response.match('available!'))
                                input_feedback(input_tag, small_tag, response, 'valid');
                            else if (response.match('already'))
                                input_feedback(input_tag, small_tag, response, 'invalid');
                            else {
                                alert_tag.addClass('alert-danger');
                                alert_tag.html(response).css({
                                    'opacity': 0
                                });
                                alert_tag.show();
                                alert_tag.animate({
                                    'opacity': 1
                                }, 500);
                            }
                        }
                    });
                    return;
                }
            }
            input_feedback(input_tag, small_tag, 'Must be a valid e-mail address containing 3-32 characters long.', 'invalid');
        }
        else
            input_feedback(input_tag, small_tag, 'Must be a valid e-mail address containing 3-32 characters long.', 'default');
    })
    //--- validate user input (letters and numbers) --------------------------------------------------------------//
    $('.input-type-letters-numbers').on('keyup', function () {
        let input = $(this).val();
        let small_tag = $(this).next();
        let input_tag = $(this);

        if (input) {
            //--- check input length ---//
            if (input_tag.attr('id') == 'reg_code') {
                if (input.length >= 5 && input.length <= 20) {
                    //--- check regular expression ---//
                    if (regex_letters_numbers.test(input)) {
                        input_feedback(input_tag, small_tag, 'Looks good!', 'valid');
                        return;
                    }
                }
                input_feedback(input_tag, small_tag, 'Must be 5-20 characters long, containing letters and numbers only.', 'invalid');
            }
            else if (input_tag.attr('id') == 'new_u_pass') {
                if (input.length >= 8 && input.length <= 20) {
                    //--- check regular expression ---//
                    if (regex_letters_numbers.test(input)) {
                        input_feedback(input_tag, small_tag, 'Looks good!', 'valid');
                        $('#new_u_pass2').keyup();
                        return;
                    }
                }
                input_feedback(input_tag, small_tag, 'Must be 8-20 characters long, containing letters and numbers only.', 'invalid');
            }
            else {
                //--- other letters number input w/ different input lenght ---//
                return
            }
        }
        else 
            input_feedback(input_tag, small_tag, '', 'default');
    })
    //--- validate user input (names) ---------------------------------------------------------//
    $('.input-type-names').on('keyup', function () {
        let input = $(this).val();
        let small_tag = $(this).next();
        let input_tag = $(this);
        
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
            input_feedback(input_tag, small_tag, '', 'default');
    })
    //--- validate user input (sentence/word/phrase) ---------------------------------------------------------//
    $(this).on('keyup', ".input-type-sentence", function () {
        let input = $(this).val().toString();
        let small_tag = $(this).next();
        let input_tag = $(this);
        
        if (input) {
            //--- check input length ---//
            if (input.length >= 2 && input.length <= 300) {
                //--- check regular expression ---//
                if (regex_sentence.test(input)) {
                    input_feedback(input_tag, small_tag, 'Looks good!', 'valid');
                    return;
                }
            }
            input_feedback(input_tag, small_tag, 'Must be 2-999 characters long!', 'invalid');
        }
        else
            input_feedback(input_tag, small_tag, '', 'default');
    })
    //--- validate user input (select) ---------------------------------------------------------//
    $('.input-type-select').on('change', function () {
        let input = $(this).val();
        let small_tag = $(this).next();
        let input_tag = $(this);

        if (input)
            input_feedback(input_tag, small_tag, 'Looks good!', 'valid');
        else 
            input_feedback(input_tag, small_tag, '', 'default');
    })
    $('#profile-picture').on('click', function() {
        $('#customFile').click();
    })
    $('#edit-profile i').on('click', function() {
        $('#customFile').click();
    })
    //--- prevent input file from clearing when user selects cancel in browser ---//
    $('#customFile').on('click', function() {
        $(this)[0].files[0] = temp;
    })
    //--- change img src of profile picture when an image is choosen by the user ---//
    $('#customFile').change(function(e) {
        let input = e.target;
        if (input.files && input.files[0] && ["image/gif", "image/jpeg", "image/png"].includes(input.files[0]['type'])) {
            let file = input.files[0];
            let reader = new FileReader();

            reader.readAsDataURL(file);
            reader.onload = function(e) {
                $('#profile-picture').attr('src', reader.result);
            }
            temp = (file);
        }
    })
    
//--- edit profile on submit -----------------------------------------------------------------//
    $('#edit-profile-form').on('submit', function(e) {
        e.preventDefault();
        let alert_tag = $(this).find('.alert');
        let inputs = $(this).find('input');
        let all_empty = true;
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
            if ($(this).val() != "")
                all_empty = false;
        })
        //--- check if all inputs are empty, do nothing if all are empty ---//
        //--- prevent from running another process if this specific request is not completed ---//
        if (!all_empty && all_valid && !button.data('requestRunning') || $('#gender').hasClass('is-valid')) {
            button.data('requestRunning', true);

            //--- show loading animation while request is running ---//
            alert_tag.hide();
            $('#edit-profile-form').css('opacity', .2);
            $('#edit-profile-form').parent().addClass('ajax-loader');
            //--- run ajax request ---//
            $.ajax({
                type: "POST",
                url: "components/update_user.php",
                data: new FormData(this),
                processData: false,
                contentType: false,
                dataType: "html",
                success: function (response) {
                    alert_tag.finish();
                    $('#edit-profile-form').css('opacity', 1);
                    $('#edit-profile-form').parent().removeClass('ajax-loader');

                    if (response.match('Success!')) {
                        $('#edit-profile-form').find("input, select").val("");
                        $('#edit-profile-form').find("input, select").removeClass("is-valid");
                        $('#edit-profile-form').find("label").removeClass("valid-feedback");
                        $('#edit-account').click();
                        alert_tag.addClass('alert-success');
                    }
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
                        alert_tag.removeClass('alert-success');
                        alert_tag.removeClass('alert-danger');
                    });
                },
                //--- if ajax request is complete, set request running to false---//
                complete: function() {
                    button.data('requestRunning', false);
                }
            });
        }
    })

    //--- populate inputs when button is clicked ---//
    $('#edit-account').on('click', function(e) {
        e.preventDefault();
        
        $.ajax({
            type: "GET",
            url: "components/get_user_info.php",
            data: {"profile_info":"ok"},
            dataType: "json",
            success: function (response) {
                let inputs = $('#edit-profile-form input');
                inputs.eq(0).siblings().attr('src', response['img_url']);
                $('#settings-container img').attr('src', response['img_url']);
                inputs.eq(1).attr('placeholder', response['fname']);
                inputs.eq(2).attr('placeholder', response['lname']);
                inputs.eq(3).attr('placeholder', response['email']);
                inputs.eq(4).attr('placeholder', response['cnumber']);
                $('#edit-profile-form select').val(response['gender'])
            },
            complete: function() {
            }
        });
    })

    //--- verify if password is the same (change pass) ---------------------------------------------//
    $('#new_u_pass2').on('keyup', function () {
        let input = $(this).val();
        let upass = $('#new_u_pass').val();
        let small_tag = $(this).next();
        let input_tag = $(this);
        
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

//--- Change password form on submit ---------------------------------------------------------------------------//
    $('#change-password-form').on('submit', function(e) {
        e.preventDefault();
        let alert_tag = $(this).find('.alert');
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

            //--- show loading animation while request is running ---//
            alert_tag.hide();
            $('#change-password-form').css('opacity', .2).parent().addClass('ajax-loader');
            //--- run ajax request ---//
            $.ajax({
                type: "POST",
                url: "components/update_user.php",
                data: $(this).serialize(),
                dataType: "html",
                success: function (response) {
                    alert_tag.finish();
                    $('#change-password-form').css('opacity', 1).parent().removeClass('ajax-loader');
                    if (response.match('Success!')) {
                        inputs.val("");
                        inputs.removeClass("is-valid");
                        $(this).find("label").removeClass("valid-feedback");
                        alert_tag.addClass('alert-success');
                    }
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
                        alert_tag.removeClass('alert-success');
                        alert_tag.removeClass('alert-danger');
                    });
                },
                //--- if ajax request is complete, set request running to false---//
                complete: function() {
                    button.data('requestRunning', false);
                }
            });
        }
    })
    $('.input-type-date').on('change', function() {
        let input = $(this).val();
        let small_tag = $(this).next();
        let input_tag = $(this);

        if (input) {
            let YearNow = today.substring(0, 4)
            let MonthNow = today.substring(5, 7)
            let DayNow = today.substring(8, 10)
            let BDay = $(this).val().substring(8,10)
            let BYear = $(this).val().substring(0, 4)
            let BMonth = $(this).val().substring(5, 7)
            let Age = (YearNow - BYear) - 1;
            
            if (MonthNow > BMonth || (MonthNow == BMonth && DayNow >= BDay))
                Age++;

            if (Age >= 0 && Age <= 150) {
                if ($(this).attr('id') == 'b_date') {
                    $('#age').val(Age);
                }
                if ($(this).attr('id') == 'patient-info-b_date') {
                    $('#patient-info-age').val(Age);
                    $('#patient-info-age').addClass('is-valid');
                }
                input_feedback(input_tag, small_tag, 'Looks good!', 'valid');
            }
            else 
                input_feedback(input_tag, small_tag, 'Please select a valid date!', 'invalid');
        }
        else 
            input_feedback(input_tag, small_tag, '', 'default');
    })

    
    
    $('.input-type-multiple-select').on('focus', function() {
        $(this).css({
            'height':'8.5rem',
            'position': 'absolute',
            'z-index' : '999',
            'left' : '.2rem',
            'top': '2rem',
            'width': '98%'
        })
        $(this).prop('multiple', true)
    })
    $('.input-type-multiple-select').on('focusout', function() {
        let placeholder = $(this).children().first();
        $(this).css({
            'height':'35.6px',
            'position': 'relative',
            'z-index' : 'unset',
            'left' : 'unset',
            'top': 'unset',
            'width': '100%'
        })
        $(this).prop('multiple', false)
        if (placeholder.html() == '') {
            placeholder.html('Choose...')
            $(this).removeClass('is-valid')
            $(this).attr('required', true)
        }
        if (placeholder.html() != 'Choose...') {
            $(this).addClass('is-valid')
            $(this).removeAttr('required')
        }
    })
    $('.input-type-multiple-select').on('change', function() {
        let placeholder = $(this).children().first();
        temp ='';
        for (elem in $(this).val()) {
            temp+=$(this).val()[elem]+", ";
        }
        temp = temp.substr(0, temp.length-2)
        placeholder.html(temp)
    })
    $('.input-type-multiple-select option').on('click', function(e) {
        let select = $(this).parent();
        let isProcedure = false;

        if (select.prop('label')) {
            select = select.parent();
            isProcedure = true;
        }
        all_options = select.find('option');

        if (e.ctrlKey) {
            if (isProcedure) {
                $(this).siblings().removeClass("form-control form-control-sm is-valid");
                $(this).siblings().prop('selected', false);
            }
            
            if ($(this).hasClass('is-valid')) {
                $(this).removeClass("form-control form-control-sm is-valid");
                $(this).prop('selected', false);
            }
            else {
                $(this).toggleClass("form-control form-control-sm is-valid");
                $(this).prop('selected', true);
            }

            for (option in all_options) {
                if (all_options.eq(option).hasClass('is-valid'))
                    all_options.eq(option).prop('selected', true)
            }
            select.change();
        }
        else {
            all_options.removeClass("form-control form-control-sm is-valid");
            all_options.prop('selected', false);
            $(this).toggleClass("form-control form-control-sm is-valid");
            select.val('');
            $(this).prop('selected', true);
        }
    })

    $(".input-type-x-ray-no").on('keyup', function() {
        let input = $(this).val();
        let input_tag = $(this);
        let small_tag = $(this).next();
        
        if (input) {
            //--- check input length ---//
            if (input.length == 7) {
                //--- check regular expression ---//
                if (regex_x_ray_no.test(input)) {
                    input_feedback(input_tag, small_tag, 'Looks good!', 'valid');
                    return;
                }
            }
            input_feedback(input_tag, small_tag, 'Must be of 7 character long, containing numbers and - only', 'invalid');
        }
        else
            input_feedback(input_tag, small_tag, '', 'default');
    })

    $(".input-type-numbers").on('keyup', function() {
        let input = $(this).val();
        let input_tag = $(this);
        let small_tag = $(this).next();
        
        if (input) {
            //--- check input length ---//
            if (input_tag.attr('id').match('cnumber')) {
                if (input.length == 10) {
                    if (regex_numbers.test(input)) {
                        input_feedback(input_tag, small_tag, 'Looks good!', 'valid');
                        return;
                    }
                }
                input_feedback(input_tag, small_tag, 'Please input a valid mobile number!', 'invalid');
            }
            else if (input_tag.attr('id').match('_no')) {
                if (input.length >= 5 && input.length <= 10) {
                    if (regex_numbers.test(input)) {
                        input_feedback(input_tag, small_tag, 'Looks good!', 'valid');
                        return;
                    }
                }
                input_feedback(input_tag, small_tag, 'Must be 5-10 characters long, containing numbers only!', 'invalid');
            }
            else {
                if (input.length == 1 || input.length == 2) {
                    if (regex_numbers.test(input)) {
                        input_feedback(input_tag, small_tag, 'Looks good!', 'valid');
                        return;
                    }
                }
                input_feedback(input_tag, small_tag, 'Must be 1-2 characters long, containing numbers only!', 'invalid');
            }
        }
        else
            input_feedback(input_tag, small_tag, '', 'default');
    })

    //--- add patient form submit -------------------------------------//
     $('#add-patient-form').on('submit', function(e) {
        e.preventDefault();
        //assign
        let alert_tag = $('#add-patient-alert');
        let inputs = $(this).find('input');
        let all_valid = true;
        let button = $(this);

        //--- check if all inputs inside the form is valid ---//
        //--- focus on input that is not valid --//
        $.each(inputs, function () {
            if ($(this).hasClass('is-invalid') && $(this).prop('required') == true) {
                $(this).focus();
                all_valid = false;
                return;
            }
        })

        //--- prevent from running another process if this specific request is not completed ---//
        //--- prevent from running if an input is invalid ---//
        if (all_valid && !button.data('requestRunning')) {
            window.scrollTo(0, 0);
            button.data('requestRunning', true);    
            temp = new FormData(this)
            temp.append('procedure',$('#procedure').children().first().html())
            temp.append('film_size',$('#film_size').children().first().html())
            let x_ray_no = ($('#x_ray_no').val());
            //--- show loading animation while request is running ---//
            alert_tag.hide();
            $('#add-patient-form').css('opacity', .2);
            $('#add-patient .card-body').addClass('ajax-loader');
            //--- run ajax request ---//
            $.ajax({
                type: "POST",
                url: "components/add_patient.php",
                processData: false,
                contentType: false,
                data: temp,
                dataType: "html",
                success: function (response) {
                    $('#add-patient-form').css('opacity', 1);
                    $('#add-patient .card-body').removeClass('ajax-loader');
                    alert_tag.finish();
                    if (response.match('Success!'))  {
                        inputs.val('');
                        inputs.removeClass('is-valid');
                        $('#add-patient-form small').html('');
                        $('#add-patient-form small').removeClass('valid-feedback');
                        $('#add-patient-form select').removeClass('is-valid');
                        $('#add-patient-form select').prop('selectedIndex', 0);
                        $('#x_ray_no').val(x_ray_no);
                        $('.navlinks').eq(1).click();
                        alert_tag.addClass('alert-success');
                    }
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
                        alert_tag.removeClass('alert-success');
                        alert_tag.removeClass('alert-danger');
                    });
                },
                //--- if ajax request is complete, set request running to false---//
                complete: function() {
                    button.data('requestRunning', false);
                }
            });
        }
    })
    
    //--- append userlist of another date when see more or back is clicked ---//
    $("#patient-list-footer").on('click', function(e) {
        e.preventDefault();
        
        if ($(this).html().match('Back')) {
            populate_patient_list();
            return
        }
        if ($(this).html().match('See more')){
            $("#patient-list-card-body-table").css('opacity', .2);
            $("#patient-list-search-form").css('opacity', .2);
            $("#patient-list .card-body").addClass('ajax-loader')
            $("#patient-list-footer").addClass("d-none");
        
            let h5s = $("#patient-list-card-body-table").find('h5');
            let len = h5s.length - 1;
            let date = h5s.eq(len).html();
            
            if (date == undefined)
                date = tom;
            if (date == "Today")
                date = today;
            if (date == "Yesterday")
                date = yesterday;
            
            $.ajax({
                type: "GET",
                url: "components/get_patient.php",
                data: {"unknown_date": date},
                dataType: "html",
                success: function (response) {
                    if (response.match("END")){
                        $("#patient-list-footer").html(response).addClass("text-secondary").removeClass("d-none");
                        $("#patient-list-card-body-table").css('opacity', 1);
                        $("#patient-list-search-form").css('opacity', 1);
                        $("#patient-list .card-body").removeClass('ajax-loader');
                    }
                    else{
                        get_patient_list(response, "date");
                    }
                }
            });
        }
    }) 

    $("#patient-list-search-form .dropdown-item").on('click', function (e) {  
        e.preventDefault();
            $("#patient-list-search-by").html($(this).html())
        if($(this).html() == "date") {
            $("#patient-list-search-input").attr("type", "date");
        }
        else {
            $("#patient-list-search-input").attr("type", "text");
        }
    })

    $("#patient-list-search-form").on('submit', function(e) {
        e.preventDefault();
        $("#patient-list-card-body-table").css('opacity', .2);
        $("#patient-list-search-form").css('opacity', .2);
        $("#patient-list .card-body").addClass('ajax-loader')
        $("#patient-list-footer").html('<i class="fas fa-long-arrow-alt-left"></i> Back').addClass("d-none").removeClass('text-secondary');
        $("#patient-list-card-body-table").html('');
        get_patient_list($("#patient-list-search-input").val(), $("#patient-list-search-by").html());
    })

    $(this).on('click', '#patient-list-card-body-table .fa-chevron-circle-right', function() {
        $("#patient-list-card-body-table").css('opacity', .2);
        $("#patient-list-search-form").css('opacity', .2);
        $('#patient-list-footer').css('opacity',.2);
        $("#patient-list .card-body").addClass('ajax-loader');

        let x_ray_no = $(this).parent().siblings().eq(0).html();
        let inputs = $("#patient-info-form input");
        let selects = $("#patient-info-form select");
        inputs.val('').attr('disabled', true);
        selects.val('').attr('disabled', true);
        $('#patient-info-alert').hide();

        $.ajax({
            type: "GET",
            url: "components/get_patient.php",
            data: {"info": x_ray_no},
            dataType: "json",
            success: function (response) {
                let input_index = 0; let select_index = 0; let all_index = 0; let multi_select_index = 3;
                let physican = '';
                for (row in response) {
                    for(col in response[row]) {
                        if (input_index == 7)
                            input_index++;
                        if (all_index == 5|| all_index == 8) {
                            inputs.eq(input_index++).val(response[row][col]).attr("disabled", true);
                        }
                        else if (all_index == 9 || all_index == 11) {
                            selects.eq(select_index++).attr("disabled", true).children().eq(0).html(response[row][col]);
                        }
                        else if (all_index == 13 || all_index == 14 || all_index == 15) {
                            physican+=response[row][col]+" ";
                        }
                        else if (all_index == 0 || all_index == 1) {
                            selects.eq(multi_select_index++).attr("disabled", true).children().eq(0).html(response[row][col]);
                        }
                        else {
                            inputs.eq(input_index++).attr('placeholder', (response[row][col] == "0" || response[row][col] == null || response[row][col] == "") ? "":response[row][col]).attr("disabled", true);
                        }

                        if (all_index == 15)
                            selects.eq(select_index++).attr("disabled", true).children().eq(0).html(physican);
                        all_index++;
                    }
                }
            }, 
            complete: function() {
                inputs.removeClass('is-valid');
                selects.removeClass('is-valid');
                inputs.removeClass('is-invalid');
                selects.removeClass('is-invalid');
                $("#patient-info-edit").removeClass('d-none');
                $("#patient-info-update").addClass('d-none');
                $("#patient-list-card-body-table").css('opacity', 1);
                $("#patient-list-search-form").css('opacity', 1);
                $('#patient-list-footer').css('opacity', 1);
                $("#patient-list .card-body").removeClass('ajax-loader');
                $("#patient-info .modal").modal("show");
            }
        });
    })
    $("#patient-info-edit").on('click', function(e) {
        e.preventDefault();
        $(this).addClass('d-none');
        $("#patient-info-update").removeClass('d-none');
        $("#patient-info-form input").attr('disabled', false);
        $("#patient-info-form select").attr('disabled', false);
    })
    $("#patient-info-form").on('submit', function(e) {
        e.preventDefault();
        let inputs = $("#patient-info-form input");
        let selects = $("#patient-info-form select");
        let alert_tag = $('#patient-info-alert');
        let button = $(this);
        
        //--- check if the form was changed ---//
        //--- if changed proceed to ajax else return and do nothing ---//
        if ( (inputs.hasClass('is-valid') || selects.hasClass('is-valid')) && !button.data('requestRunning')) {
            button.data('requestRunning', true); 
            //--- transfer all the value with is-valid class to a form ---//
            let form = new FormData();

            if (inputs.hasClass('is-valid')) {
                for (elem in inputs) {
                    if (inputs.eq(elem).hasClass('is-valid'))
                     form.append(inputs.eq(elem).attr('name'), inputs.eq(elem).val());
                }
            }
            if (selects.hasClass('is-valid')) {
                for (elem in selects) {
                    if (selects.eq(elem).hasClass('is-valid')) {
                        if (selects.eq(elem).attr('id').match("patient-info-procedure") || selects.eq(elem).attr('id').match("patient-info-film_size")) {
                            if (!form.has('patient-info-procedure') && !form.has('patient-info-film_size')) {
                                form.append("patient-info-procedure", $("#patient-info-procedure").children().eq(0).html());
                                form.append("patient-info-film_size", $("#patient-info-film_size").children().eq(0).html());
                            }
                        }
                        else
                            form.append(selects.eq(elem).attr('name'), selects.eq(elem).val());
                    }
                }
            }
            
            form.append('update_patient', 'ok?');

            //for (var pair of form.entries()) {
            //    console.log(pair[0]+ ', ' + pair[1]); 
            //}
            
            alert_tag.hide();
            $("#patient-info-form").css('opacity', .2);
            $("#patient-info-form").parent().addClass('ajax-loader');

            //proceed to ajax
            $.ajax({
                type: "post",
                url: "components/update_patient.php",
                data: form,
                processData: false,
                contentType: false,
                dataType: "html",
                success: function (response) {
                    $("#patient-info-form").css('opacity', 1);
                    $("#patient-info-form").parent().removeClass('ajax-loader');
                    alert_tag.finish();
                    
                    if (response.match('Success!'))  {
                        alert_tag.addClass('alert-success');
                        let h5s = $("#patient-list-card-body-table").find('h5');
                        let len = h5s.length - 1;
                        let date = h5s.eq(len).html();
                        
                        if (date.match("Search"))
                            $("#patient-list-search-form").submit();
                        else
                            populate_patient_list();
                    }
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
                        alert_tag.removeClass('alert-success');
                        alert_tag.removeClass('alert-danger');
                    });
                },
                //--- if ajax request is complete, set request running to false---//
                complete: function() {
                    button.data('requestRunning', false);
                }
            });
        }
    })
    $("#send-x-ray-image-form1").on('submit', function(e) {
        e.preventDefault();
        let input = $(this).find('input');
        let alert_tag = $("#send-x-ray-image-form1-alert");
        let button = $(this)
        $("#send-x-ray-image-form2 .alert").finish();

        function fail(message) {
            alert_tag.finish();
            $("#send-x-ray-image-form1").css('opacity', 1);
            $("#send-x-ray-image-form1").parent().removeClass('ajax-loader');
            alert_tag.addClass('alert-danger');
            alert_tag.html(message).css({
                'opacity': 0
            });
            alert_tag.show();
            alert_tag.animate({
                'opacity': 1
            }, 500);
            alert_tag.fadeTo(5000, 500).slideUp(500, function(){
                alert_tag.removeClass('alert-success');
                alert_tag.removeClass('alert-danger');
            });
        }

        alert_tag.hide();
        if (input.hasClass('is-invalid')) {
            input.focus();
            return;
        }

        if (!button.data('requestRunning')) {
            button.data('requestRunning', true); 

            $("#send-x-ray-image-form1").css('opacity', .2).parent().addClass('ajax-loader');
            $.ajax({
                type: "GET",
                url: "components/get_patient.php",
                data: {"info": input.val()},
                dataType: "json",
                success: function (response) {
                    alert_tag.finish();
                    if (response[0]) {
                        let procedures = (response[0][0]).split(', ');
                        let x_ray_no = response[0]["x_ray_no"];
                        $.ajax({
                            type: "GET",
                            url: "components/send_xray_image.php",
                            data: {'exist': response[0]["x_ray_no"]},
                            dataType: "html",
                            success: function (response) {
                                if (response.match('does not exist!')) {
                                    alert_tag.finish();
                                    $("#send-x-ray-image-form1").addClass('d-none').css('opacity', 1).parent().removeClass('ajax-loader');
                                    $("#send-x-ray-image-form2").removeClass('d-none');
                                    $("#step1").removeClass('step1').addClass('step1-active');
                                    $("#step2").removeClass('step2').addClass('step2-active');
                                    $("#send-x-ray-image-form2-send-button").removeClass('d-none');
                                    $("#send-x-ray-image-h5").html("STEP 2");
                                    $("#send-x-ray-image-form2-body").html('<input type="text" class="d-none" name="send-x-ray-image-form2-body-x_ray_no" value="'+x_ray_no+'">');
                                    for (elem in procedures) {
                                        $("#send-x-ray-image-form2-body").append('\
                                            <div class="text-center mt-5">\
                                                <div class="mt-3">\
                                                    <h5>'+procedures[elem]+'</h5>\
                                                </div>\
                                                <div class="mt-3 pb-2">\
                                                    <div>\
                                                        <button class="btn btn-outline-dark send-x-ray-image-form2-upload-button"> <i class="fas fa-upload"></i> Click here to upload</button>\
                                                    </div>\
                                                    <div class="d-none">\
                                                    </div>\
                                                </div>\
                                                <div class="d-flex justify-content-center overflow-auto mt-2 pl-3">\
                                                </div>\
                                            </div>\
                                        ');
                                    }

                                    let upload_buttons = $(".send-x-ray-image-form2-upload-button");
                                    upload_buttons.on('click', function(e) {
                                        e.preventDefault();
                                        let procedure = $(this).parent().parent().siblings().eq(0).children().eq(0).html();
                                        procedure = procedure.replace(' ','_');
                                        $(this).parent().siblings().eq(0).append('<input type="file" class="send-x-ray-image-form2-input" name="image_of_'+procedure+'[]" multiple="multiple" accept="image/*;capture=camera"/>');
                                        $(this).parent().siblings().eq(0).children().eq($(this).parent().siblings().eq(0).children().length-1).click();
                                    })
                                }
                                else 
                                    fail(response);
                            },
                            complete: function() {
                                button.data('requestRunning', false);
                                $("#send-x-ray-image-form2-send-button").removeClass('d-none');
                            }
                        });
                    }
                }
            }).fail(function() {
                fail('X-ray no. doesn\'t exist!');
                button.data('requestRunning', false);
            })
        }
    })
    $(this).on('click', '.send-x-ray-image-form2-input', function (e) {
        let temp = $(this);
        let alert_tag = $("#send-x-ray-image-form2 .alert");
        let siblings = temp.siblings();
        let procedure_container = temp.parent().parent().parent().siblings();

        $(this).change(function (e) {
            let input = e.target;
            if (input.files && input.files[0]) {
                let file = input.files[0];
                function show_error(error) {
                    alert_tag.finish();
                    alert_tag.addClass('alert-danger');
                    alert_tag.html(error).css({
                        'opacity': 0
                    });
                    alert_tag.show();
                    alert_tag.animate({
                        'opacity': 1
                    }, 500);
                    alert_tag.fadeTo(5000, 500).slideUp(500, function(){
                        alert_tag.removeClass('alert-success');
                        alert_tag.removeClass('alert-danger');
                    });
                    
                    temp.remove();
                    window.scrollTo(0, 0);
                    return;
                }
                if (!["image/gif", "image/jpeg", "image/png"].includes(input.files[0]['type']))
                    show_error("Please select a valid image file!");
                else if (file.size > 10097152)
                    show_error("Image file size must be less than 10mb!");
                else if (!regex_file_name.test(file.name))
                    show_error("Image file name must not contain whitespaces or symbols!");
                else {
                    $.each(procedure_container, function () { 
                        if ($(this).index() != 0) {
                            $.each($(this).children().eq(1).children().eq(1).children(), function () { 
                                if ($(this).val().substring(12).match(file.name)) {
                                    show_error("Image was already selected!");
                                }
                            });
                        }
                   });
                   $.each(siblings, function () { 
                        if ($(this).val().substring(12).match(file.name)) {
                            show_error("Image was already selected!");
                        }
                    });
                }
                
                let reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function(e) {
                    var file_size = file.size/1000000;
                    temp.parent().parent().parent().children().eq(2).append('\
                        <div class="mr-3 d-flex flex-column">\
                            <div>\
                                <img src="'+reader.result+'" class="img-thumbnail mt-3 float-left" width="150px" height="150px">\
                                <a href="" style="margin-top:-.3rem;margin-left:-.4rem;font-size:1.25rem;color:var(--danger)" class="send-x-ray-image-form2-delete-button"><i class="fas fa-times-circle"></i></a>\
                            </div>\
                            <div style="margin-buttom:1rem" class="ml-auto mr-auto pr-2">'+file_size.toFixed(2)+' MB</div>\
                            <div class="ml-auto mr-auto mb-1 pr-2" style="width:140px">'+file.name+'</div>\
                        </div>\
                    ')
                }
                
            }
        })
    })
    $(this).on('click', '.send-x-ray-image-form2-delete-button', function (e) {
        e.preventDefault();
        let index = $(this).parent().parent().index();
        $(this).parent().parent().parent().siblings().eq(1).children().eq(1).children().eq(index).remove();
        $(this).parent().parent().remove();
    })
    $("#send-x-ray-image-form2-back").on('click', function(e) {
        e.preventDefault();
        $("#step1").removeClass('step1-active').addClass('step1');
        $("#step2").removeClass('step2-active').addClass('step2');
        $("#send-x-ray-image-form1").removeClass('d-none');
        $("#send-x-ray-image-form2").addClass('d-none');
        $("#send-x-ray-image-h5").html("STEP 1");
        $("#send-x-ray-image-form2-send-button").removeClass('d-none');
    })
    $("#send-x-ray-image-form2").on('submit', function(e) {
        e.preventDefault();
        let inputs = $(".send-x-ray-image-form2-input");
        let h5s = $(this).find('h5');
        let alert_tag = $("#send-x-ray-image-form2 .alert");
        let loading_tag_container = $("#send-x-ray-image-form2 .progress");
        let loading_tag = $("#send-x-ray-image-form2 .progress-bar");
        let button = $(this);
        let temp = Array();
        alert_tag.hide();

        $.each(inputs, function () { 
            if ($(this).val() == '')
                $(this).remove();
            else {
                if (!temp.includes($(this).attr('name')))
                    temp.push($(this).attr('name'));
            }
        });
        window.scrollTo(0, 0);
        if (temp.length != h5s.length) {
            alert_tag.finish();
            alert_tag.addClass('alert-danger');
            alert_tag.html('Please upload an image for all the procedures below..').css({
                'opacity': 0
            });
            alert_tag.show();
            alert_tag.animate({
                'opacity': 1
            }, 500);
            alert_tag.fadeTo(5000, 500).slideUp(500, function(){
                alert_tag.removeClass('alert-success');
                alert_tag.removeClass('alert-danger');
            });
            return;
        }
        
        if (!button.data('requestRunning')) {
            button.data('requestRunning', true); 
            loading_tag_container.removeClass('d-none');
            $("#send-x-ray-image-form2-send-button").addClass('d-none');
            $("#send-x-ray-image-form2-body").css('opacity', .2);
            $("#send-x-ray-image-form2-body").parent().addClass('ajax-loader');
            $.ajax({
                xhr: function() {
                    var xhr = new window.XMLHttpRequest();
                    xhr.upload.addEventListener("progress", function(evt) {
                        if (evt.lengthComputable) {
                            var percentComplete = (evt.loaded / evt.total)*100;
                            //Do something with upload progress here
                            loading_tag.css({
                                'width': percentComplete+'%'
                            });
                        }
                   }, false);
                   return xhr;
                },
                type: "POST",
                url: "components/send_xray_image.php",
                data: new FormData(this),
                processData: false,
                contentType: false,
                dataType: "html",
                success: function (response) {
                    alert_tag.finish();
                    loading_tag.finish();
                    loading_tag_container.addClass('d-none');
                    loading_tag.css({
                        'width':'0%'
                    })
                    $("#send-x-ray-image-form2-body").css('opacity', 1);
                    $("#send-x-ray-image-form2-body").parent().removeClass('ajax-loader');
                    if (response.match('Success!'))  {
                        alert_tag.addClass('alert-success');
                    }
                    else {
                        $("#send-x-ray-image-form2-send-button").removeClass('d-none');
                        alert_tag.addClass('alert-danger');
                    }
                    alert_tag.html(response).css({
                        'opacity': 0
                    });
                    alert_tag.show();
                    alert_tag.animate({
                        'opacity': 1
                    }, 500);
                    alert_tag.fadeTo(5000, 500).slideUp(500, function(){
                        alert_tag.removeClass('alert-success');
                        alert_tag.removeClass('alert-danger');
                    });
                },
                complete: function () {
                    button.data('requestRunning', false);
                }
            });
        }
    })

    $(this).on('click', ".pending-interpretation-delete", function(e) {
        e.preventDefault();
        let x_ray_no = $(this).parent().siblings().eq(0).html();
        let alert_tag = $("#pending-interpretation-alert");
        let delete_button = $("#pending-interpretation-body .pending-interpretation-delete");
        $("#pending-interpretation-body").css('opacity', .2);
        $("#pending-interpretation .card-body").addClass('ajax-loader');
        $("#interpretation-results-footer").addClass('d-none').html('<i class="fas fa-long-arrow-alt-down"></i> See more');
        delete_button.addClass('d-none');
        $.ajax({
            type: "POST",
            url: "components/teleradiology.php",
            data: {"delete":x_ray_no},
            dataType: "html",
            success: function (response) {
                if ($("#pending-interpretation-search-input").val() == '') {
                    $("#pending-interpretation-search-by").html('x-ray no.');
                    get_for_reading_list("radtech");
                }
                else
                    populate_for_reading("radtech", $("#pending-interpretation-search-input").val(), $("#pending-interpretation-search-by").html());
                if (response.match('Success!'))  {
                    alert_tag.addClass('alert-success');
                }
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
                });

            },
            complete: function() {
                delete_button.removeClass('d-none'); 
            }
        });
    })


    //------------------------------------------ teleradiology ----------------------------------------//
    

    $(this).on('click', ".pending-interpretation-comment-form-save",function() {
        let alert_tag = $(this).parent().parent().parent().parent().parent().find('.alert')
        let all_valid = true;
        let button = $(this);
        let preset = $(this).parent().parent().next();
        let inputs = $(this).parent().parent().parent().parent().find('.form-control');
        let form = $(this).parent().parent().parent().parent();
        
        $(inputs).each(function () {
            if (!$(this).hasClass('is-valid')) {
                $(this).addClass('is-invalid')
                $(this).focus();
                all_valid = false;
                return;
            }
        });
        
        if (all_valid && !button.data('requestRunning')) {
            button.data('requestRunning', true);
            alert_tag.hide();
            form.css('opacity', .2);
            form.parent().addClass('ajax-loader');

            //check if to overwrite existing preset or not
            $.ajax({
                type: "GET",
                url: "components/presets.php",
                data: {"exist":inputs.eq(0).val()},
                dataType: "html",
                success: function (response) {
                    alert_tag.finish();
                    form.css('opacity', 1);
                    form.parent().removeClass('ajax-loader');
                    if (response.match('True')) {
                        alert_tag.addClass('alert-warning');
                        alert_tag.html('<div style="font-size:.8rem" class="pb-2">Preset name already exist!<br>Overwrite existing preset?</div>\
                                        <div style="font-size:.9rem" class="pb-3">\
                                            <a href="javascript:void(0)" class="badge badge-danger overwrite-prompt float-left">NO</a>\
                                            <a href="javascript:void(0)" class="badge badge-success overwrite-prompt float-right">YES</a>\
                                        </div>').css({
                            'opacity': 0
                        });
                        alert_tag.show();
                        alert_tag.animate({
                            'opacity': 1
                        }, 500);
                        $('.overwrite-prompt').on('click',function () {
                            if ($(this).html().match("YES")) {
                                form.css('opacity', .2);
                                form.parent().addClass('ajax-loader');
                                add_update_presets(preset.val(), true, alert_tag, inputs, form);
                            }
                            else {
                                alert_tag.fadeTo(0, 500).slideUp(500, function(){
                                    alert_tag.removeClass('alert-warning');
                                });
                            }
                        })
                    }
                    else
                        add_update_presets(preset.val(), false, alert_tag, inputs, form)
                },
                complete: function() {
                    button.data('requestRunning', false);
                }
            });
        }
    })

    $(this).on('click', ".pending-interpretation-comment-form-delete", function() {
        let alert_tag = $(this).parent().parent().parent().parent().parent().find('.alert');
        let form = $(this).parent().parent().parent().parent();
        let preset = $(this).parent().parent().next();

        if (preset.val() != 'custom') {
            alert_tag.hide();
            form.css('opacity', .2);
            form.parent().addClass('ajax-loader');
            $.ajax({
                type: "POST",
                url: "components/presets.php",
                data: {'delete':preset.val()},
                dataType: "html",
                success: function (response) {
                    alert_tag.finish();
                    form.css('opacity', 1);
                    form.parent().removeClass('ajax-loader');
                    if (response.match('Success')) 
                        alert_tag.addClass('alert-success');
                    else
                        alert_tag.addClass('alert-warning');
                    alert_tag.html(response).css({
                        'opacity': 0
                    });
                    alert_tag.show();
                    alert_tag.animate({
                        'opacity': 1
                    }, 500);
                    alert_tag.fadeTo(5000, 500).slideUp(500, function(){
                        alert_tag.removeClass('alert-warning');
                        alert_tag.removeClass('alert-success');
                    });
                    populate_for_reading_view_comment_form_preset();
                }
            });
        }
        else {
            alert_tag.addClass('alert-warning');
            alert_tag.html('<div style="font-size:.8rem">Please select a preset first!</div>').css({
                'opacity': 0
            });
            alert_tag.show();
            alert_tag.animate({
                'opacity': 1
            }, 500);
            alert_tag.fadeTo(5000, 500).slideUp(500, function(){
                alert_tag.removeClass('alert-warning');
                alert_tag.removeClass('alert-success');
            });
        }
    })
    $(this).on('click', ".pending-interpretation-clear-form", function(e) {
        e.preventDefault();
        $(this).parent().parent().find('.form-control').val('').removeClass('is-valid is-invalid');
    })
    $(this).on('submit', ".pending-interpretation-comment-form", function(e) {
        e.preventDefault();
        let alert_tag = $(this).parent().find('.alert');
        let button = $(this), form = $(this);
        let x_ray_no = $(this).parent().find(".pending-interpretation-view-x-ray-no").html();
        let procedure = $(this).parent().find(".pending-interpretation-view-procedure").html().split('_')[0];
        let inputs = $(this).find('.form-control');
        let form_index = $(this).parent().parent().index()-1;
        alert_tag.hide();
        if (inputs.eq(1).hasClass('is-invalid') || inputs.eq(1).val() == '' || inputs.eq(2).hasClass('is-invalid') || inputs.eq(2).val() == ''){
            temp = false;
            for (let i = 1; i < 3; i++) {
                if (!inputs.eq(i).hasClass('is-invalid') && !inputs.eq(i).hasClass('is-valid'))
                    inputs.eq(i).addClass('is-invalid');
            }
            $(".pending-interpretation-view-container-item").addClass('d-none');
            $(".pending-interpretation-view-container-item").eq(form_index).removeClass('d-none');
            $(this).focus();
            alert_tag.finish();
            alert_tag.addClass('alert-danger');
            alert_tag.html('Please fill-in the form below and try again..').css({
                'opacity': 0
            });
            alert_tag.show();
            alert_tag.animate({
                'opacity': 1
            }, 500);
            alert_tag.fadeTo(5000, 500).slideUp(500, function(){
                alert_tag.removeClass('alert-danger');
            });
            return;
        }
        
        if (temp && !button.data('requestRunning')) {
            button.data('requestRunning', true);
            form.css('opacity', .2);
            form.parent().addClass('ajax-loader');
            let formdata = new FormData();
            let php_url = "components/teleradiology.php";
            if ($("#pending-interpretation-submit-form").html() == 'Submit') {
                formdata.append('change_stage_to', 'for_printing');
                formdata.append('x_ray_no', x_ray_no);
            }
            else {
                formdata.append('update', x_ray_no);
                php_url = "components/x_ray_results.php";
            }
            formdata.append('procedure_type', procedure);
            formdata.append('findings', inputs.eq(1).val())
            formdata.append('diagnosis', inputs.eq(2).val())
            //for (var pair of formdata.entries()) {
            //    console.log(pair[0]+ ', ' + pair[1]); 
            //}
            
            $.ajax({
                type: "POST",
                url: php_url,
                data: formdata,
                dataType: "html",
                processData: false,
                contentType: false,
                success: function (response) {
                    alert_tag.finish();
                    form.css('opacity', 1);
                    form.parent().removeClass('ajax-loader');
                    if (response.match('Success')) 
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
                        alert_tag.removeClass('alert-success');
                        alert_tag.removeClass('alert-danger');
                    });
                },
                complete:function() {
                    button.data('requestRunning', false);
                    if ($("#pending-interpretation-submit-form").html().match('Submit')) {
                        if ($("#pending-interpretation-search-input").val() == '' || $("#pending-interpretation-search-input").val() == null) {
                            $("#pending-interpretation-search-by").html('x-ray no.');
                            get_for_reading_list("radiologist");
                        }
                        else
                            populate_for_reading("radiologist", $("#pending-interpretation-search-input").val(), $("#pending-interpretation-search-by").html());
                    }
                    else {
                        if ($("#pending-interpretation-search-input").val() == '' || $("#pending-interpretation-search-input").val() == null) {
                            $("#pending-interpretation-search-by").html('x-ray no.');
                            get_for_printing_list("radiologist");
                        }
                        else
                            populate_for_printing("radiologist", $("#pending-interpretation-search-input").val(), $("#pending-interpretation-search-by").html());
                    }
                }
            });
        }
    })
    $(this).on('click', '#pending-interpretation-view-close', function(e) {
        e.preventDefault();
        $("#pending-interpretation-view-container").addClass('d-none');
        $("body").css('overflow','auto');
    })
    $(this).on('click', ".pending-interpretation-prev-procedure", function(e) {
        e.preventDefault();
        $("#pending-interpretation-view-container").children().eq($(this).parent().parent().parent().index()).addClass('d-none');
        $("#pending-interpretation-view-container").children().eq($(this).parent().parent().parent().index()-1).removeClass('d-none');
    })
    $(this).on('click', ".pending-interpretation-next-procedure", function(e) {
        e.preventDefault();
        $("#pending-interpretation-view-container").children().eq($(this).parent().parent().parent().parent().index()).addClass('d-none');
        $("#pending-interpretation-view-container").children().eq($(this).parent().parent().parent().parent().index()+1).removeClass('d-none');
    })
    $(this).on('click', "#pending-interpretation-submit-form", function(e) {
        e.preventDefault();
        temp = true;
        $('.pending-interpretation-comment-form').submit();
    })
    
    $(this).on('change', ".pending-interpretation-comment-form-preset", function() {
        let form = $(this).parent().parent();
        let preset = $(this);

        form.find('.form-control').removeClass('is-valid is-invalid');
        if (preset.val() != 'custom') {
            form.css('opacity', .2);
            form.parent().addClass('ajax-loader');
            $.ajax({
                type: "GET",
                url: "components/presets.php",
                data: {"preset":preset.val()},
                dataType: "json",
                success: function (response) {
                    form.css('opacity', 1);
                    form.parent().removeClass('ajax-loader');
                    if (response) {
                        let inputs = preset.parent().parent().find('.form-control');
                        inputs.eq(0).addClass('is-valid').val(response['preset_name']);
                        inputs.eq(1).addClass('is-valid').val(response['findings']);
                        inputs.eq(2).addClass('is-valid').val(response['diagnosis']);
                    }
                }
            });
        }
        else {
            preset.removeClass('is-valid');
            preset.parent().parent().find('.form-control').val('');
        }
    })
    $(this).on('click', ".interpretation-results-delete", function() {
        let x_ray_no = $(this).parent().siblings().eq(0).html();
        let alert_tag = $("#interpretation-results-alert");
        let delete_button = $("#interpretation-results-body .interpretation-results-delete").addClass('d-none');
        $("#interpretation-results-body").css('opacity', .2);
        $("#interpretation-results-body .card-body").addClass('ajax-loader');
        
        $.ajax({
            type: "POST",
            url: "components/teleradiology.php",
            data: {"x_ray_no":x_ray_no, "change_stage_to":"for_reading"},
            dataType: "html",
            success: function (response) {
                if ($("#interpretation-results-search-input").val() == '') {
                    $("#interpretation-results-search-by").html('x-ray no.');
                    get_for_printing_list("radiologist");
                }
                else
                    populate_for_printing("radiologist", $("#interpretation-results-search-input").val(), $("#interpretation-results-search-by").html());
                if (response.match('Success!'))  {
                    alert_tag.addClass('alert-success');
                }
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
                });

            },
            complete: function() {
                delete_button.removeClass('d-none'); 
            }
        });
    })
    $(this).on('click', ".interpretation-results-view", function() {
        $("body").css('overflow','hidden');
        $("#interpretation-results-body").css('opacity', .2).parent().addClass('ajax-loader');
        $("#interpretation-results-search-form").css('opacity', .2);
        $("#interpretation-results-footer").css('opacity', .2);
        let x_ray_no = $(this).parent().siblings().eq(0).html();
        index = 0;
        
        $.ajax({
            type: "GET",
            url: "components/teleradiology.php",
            data: {"for_printing_by":"x-ray no.", "input_val":x_ray_no},
            dataType: "json",
            success: function (response) {
                if (response[0]) {
                    $("#pending-interpretation-view-container").html('<div id="pending-interpretation-view-close">\
                                                                        <a href="javascript:void(0)"><i class="far fa-times-circle"></i></a>\
                                                                    </div>');
                    temp = '';
                    let procedure_index = 0;
                    $.each(response[0]['procedures'], function () {
                        let procedure = this;
                        let img_file_index = 0;
                        temp+='\
                        <div class="pending-interpretation-view-container-item';
                        if (procedure_index == 0)
                            temp+= '">';
                        else 
                            temp+= ' d-none">';
                        temp+='\
                            <div class="pending-interpretation-image col-lg-9">\
                                <div id="carouselExampleIndicators'+procedure_index+'" class="carousel slide carousel-fade w-100" data-interval="false">\
                                    <div class="carousel-inner">';
                        $.each(response[0]['img_file'], function () {
                            if (this.match(procedure)) {
                                temp+='<div class="carousel-item';
                                if (img_file_index == 0)
                                    temp+= ' active">';
                                else 
                                    temp+= '">';
                                temp+='\
                                            <img src="resources/images/for_reading/'+this+'" class="d-block w-100">\
                                        </div>';
                                img_file_index++;
                            }
                        })
                        temp+=      '</div>';
                        if (img_file_index > 1) {
                            temp+='\
                                    <a class="carousel-control-prev" href="#carouselExampleIndicators'+procedure_index+'" role="button" data-slide="prev">\
                                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>\
                                        <span class="sr-only">Previous</span>\
                                    </a>\
                                    <a class="carousel-control-next" href="#carouselExampleIndicators'+procedure_index+'" role="button" data-slide="next">\
                                        <span class="carousel-control-next-icon" aria-hidden="true"></span>\
                                        <span class="sr-only">Next</span>\
                                    </a>';
                        }
                        temp+='\
                                </div>\
                            </div>\
                            <div class="pending-interpretation-comment col-lg-3">\
                                <table class="table table-borderless border-top">\
                                    <tbody>\
                                        <tr class="d-flex justify-content-between">\
                                            <td><b class="text-primary">X-RAY NO: </b><b class="pending-interpretation-view-x-ray-no text-secondary">'+response[0]['x_ray_no']+'</b</td>\
                                            <td><b class="text-primary">DATE: </b><b class="text-secondary">'+response[0]['date']+'</b</td>\
                                        </tr>\
                                    </tbody>\
                                </table>\
                                <table class="table table-borderless">\
                                    <tbody>\
                                        <tr class="d-flex justify-content-between">\
                                            <td><b class="text-primary">NAME: </b><b class="text-secondary">'+response[0]['fname'].toUpperCase()+' '+response[0]['lname'].toUpperCase()+'</b></td>\
                                            <td><b class="text-primary">AGE: </b><b class="text-secondary">'+response[0]['age']+'</b</td>\
                                        </tr>\
                                    </tbody>\
                                </table>\
                                <table class="table table-borderless">\
                                    <tbody>\
                                        <tr class="d-flex justify-content-between">\
                                            <td><b class="text-primary">PROCEDURE: </b><b class="pending-interpretation-view-procedure text-secondary">'+procedure.toUpperCase()+'</b></td>\
                                            <td><b class="text-primary">GENDER: </b><b class="text-secondary">'+response[0]['gender'].toUpperCase()+'</b></td>\
                                        </tr>\
                                    </tbody>\
                                </table>\
                                <table class="table table-borderless border-bottom mb-3">\
                                    <tbody>\
                                        <tr class="d-flex justify-content-between">\
                                            <td><b class="text-primary">HISTORY/PURPOSE: </b><b class="text-secondary">'+response[0]['history_or_purpose'].toUpperCase()+'</b></td>\
                                        </tr>\
                                    </tbody>\
                                </table>\
                                <div class="pending-interpretation-comment-alert alert w-100 text-center" role="alert">\
                                </div>\
                                <form class="pending-interpretation-comment-form w-100">\
                                    <div class="form-group mb-3">\
                                        <div>\
                                            <label>Preset</label>\
                                            <div class="float-right mr-1">\
                                                <a class="pending-interpretation-comment-form-save text-success mr-2" style="font-size:1.2rem" href="javascript:void(0)"><i class="far fa-save"></i></a>\
                                                <a class="pending-interpretation-comment-form-delete text-danger" style="font-size:1.2rem" href="javascript:void(0)"><i class="far fa-trash-alt"></i></i></a>\
                                            </div>\
                                        </div>\
                                        <select class="pending-interpretation-comment-form-preset custom-select input-type-select">\
                                            <option selected value="custom">Custom</option>\
                                        </select>\
                                    </div>\
                                    <div class="form-group mb-3">\
                                        <label>Preset name</label>\
                                        <input type="text" class="form-control input-type-sentence">\
                                        <small class="form-text text-muted">\
                                        </small>\
                                    </div>\
                                    <div class="form-group mb-3">\
                                        <label>Findings</label>\
                                        <textarea class="form-control input-type-sentence" rows="5"></textarea>\
                                        <small class="form-text text-muted">\
                                        </small>\
                                    </div>\
                                    <div class="form-group mb-3">\
                                        <label>Diagnosis</label>\
                                        <textarea class="form-control input-type-sentence" rows="2"></textarea>\
                                        <small class="form-text text-muted">\
                                        </small>\
                                    </div>'
                                    if (procedure_index > 0)
                            temp+='<button class="pending-interpretation-prev-procedure btn btn-primary mt-2 float-left">Prev</button>';
                            temp+='<div class="float-right mt-2 pb-2">\
                                        <button class="pending-interpretation-clear-form btn btn-secondary mr-2">Clear</button>';
                                    if (procedure_index == response[0]['procedures'].length-1)
                                temp+= '<button id="pending-interpretation-submit-form" class="btn btn-primary">Update</button>';
                                    else
                                temp+='<button class="pending-interpretation-next-procedure btn btn-primary">Next</button>';
                            temp+='</div>\
                                </form>\
                            </div>\
                        </div>';
                        procedure_index++;
                    })
                    $("#pending-interpretation-view-container").append(temp);
                }
            },
            complete: function () {
                $("#pending-interpretation-view-container .pending-interpretation-comment-alert").hide();
                $('#pending-interpretation-view-container').removeClass('d-none');
                $("#interpretation-results-body").css('opacity', 1).parent().removeClass('ajax-loader');
                $("#interpretation-results-search-form").css('opacity', 1);
                $("#interpretation-results-footer").css('opacity', 1);
                //populate #pending-interpretation-comment-form-preset (presets)
                populate_for_reading_view_comment_form_preset();

                //fetch findings and diagnosis
                $.ajax({
                    type: "GET",
                    url: "components/x_ray_results.php",
                    data: {'results_by_x_ray_no': x_ray_no},
                    dataType: "json",
                    success: function (response) {
                        if (response[0]) {
                            let form = $(".pending-interpretation-comment-form");
                            let index = 0;
                            $.each(response, function () {
                                temp = form.eq(index++).find('.form-control');
                                temp.eq(1).val(this['findings']);
                                temp.eq(2).val(this['diagnosis']);
                            });
                        }
                    }
                });
            }
        });
    })
    $(this).on('click', ".pending-interpretation-interpret", function() {
        $("body").css('overflow','hidden');
        $("#pending-interpretation-body").css('opacity', .2).parent().addClass('ajax-loader');
        $("#pending-interpretation-search-form").css('opacity', .2);
        $("#pending-interpretation-footer").css('opacity', .2);
        let x_ray_no = $(this).parent().siblings().eq(0).html();
        index = 0;
        
        $.ajax({
            type: "GET",
            url: "components/teleradiology.php",
            data: {"for_reading_by":"x-ray no.", "input_val":x_ray_no},
            dataType: "json",
            success: function (response) {
                if (response[0]) {
                    $("#pending-interpretation-view-container").html('<div id="pending-interpretation-view-close">\
                                                                        <a href="javascript:void(0)"><i class="far fa-times-circle"></i></a>\
                                                                    </div>');
                    temp = '';
                    let procedure_index = 0;
                    $.each(response[0]['procedures'], function () {
                        let procedure = this;
                        let img_file_index = 0;
                        temp+='\
                        <div class="pending-interpretation-view-container-item';
                        if (procedure_index == 0)
                            temp+= '">';
                        else 
                            temp+= ' d-none">';
                        temp+='\
                            <div class="pending-interpretation-image col-lg-9">\
                                <div id="carouselExampleIndicators'+procedure_index+'" class="carousel slide carousel-fade w-100" data-interval="false">\
                                    <div class="carousel-inner">';
                        $.each(response[0]['img_file'], function () {
                            if (this.match(procedure)) {
                                temp+='<div class="carousel-item';
                                if (img_file_index == 0)
                                    temp+= ' active">';
                                else 
                                    temp+= '">';
                                temp+='\
                                            <img src="resources/images/for_reading/'+this+'" class="d-block w-100">\
                                        </div>';
                                img_file_index++;
                            }
                        })
                        temp+=      '</div>';
                        if (img_file_index > 1) {
                            temp+='\
                                    <a class="carousel-control-prev" href="#carouselExampleIndicators'+procedure_index+'" role="button" data-slide="prev">\
                                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>\
                                        <span class="sr-only">Previous</span>\
                                    </a>\
                                    <a class="carousel-control-next" href="#carouselExampleIndicators'+procedure_index+'" role="button" data-slide="next">\
                                        <span class="carousel-control-next-icon" aria-hidden="true"></span>\
                                        <span class="sr-only">Next</span>\
                                    </a>';
                        }
                        temp+='\
                                </div>\
                            </div>\
                            <div class="pending-interpretation-comment col-lg-3">\
                                <table class="table table-borderless border-top">\
                                    <tbody>\
                                        <tr class="d-flex justify-content-between">\
                                            <td><b class="text-primary">X-RAY NO: </b><b class="pending-interpretation-view-x-ray-no text-secondary">'+response[0]['x_ray_no']+'</b</td>\
                                            <td><b class="text-primary">DATE: </b><b class="text-secondary">'+response[0]['date']+'</b</td>\
                                        </tr>\
                                    </tbody>\
                                </table>\
                                <table class="table table-borderless">\
                                    <tbody>\
                                        <tr class="d-flex justify-content-between">\
                                            <td><b class="text-primary">NAME: </b><b class="text-secondary">'+response[0]['fname'].toUpperCase()+' '+response[0]['lname'].toUpperCase()+'</b></td>\
                                            <td><b class="text-primary">AGE: </b><b class="text-secondary">'+response[0]['age']+'</b</td>\
                                        </tr>\
                                    </tbody>\
                                </table>\
                                <table class="table table-borderless">\
                                    <tbody>\
                                        <tr class="d-flex justify-content-between">\
                                            <td><b class="text-primary">PROCEDURE: </b><b class="pending-interpretation-view-procedure text-secondary">'+procedure.toUpperCase()+'</b></td>\
                                            <td><b class="text-primary">GENDER: </b><b class="text-secondary">'+response[0]['gender'].toUpperCase()+'</b></td>\
                                        </tr>\
                                    </tbody>\
                                </table>\
                                <table class="table table-borderless border-bottom mb-3">\
                                    <tbody>\
                                        <tr class="d-flex justify-content-between">\
                                            <td><b class="text-primary">HISTORY/PURPOSE: </b><b class="text-secondary">'+response[0]['history_or_purpose'].toUpperCase()+'</b></td>\
                                        </tr>\
                                    </tbody>\
                                </table>\
                                <div class="pending-interpretation-comment-alert alert w-100 text-center" role="alert">\
                                </div>\
                                <form class="pending-interpretation-comment-form w-100">\
                                    <div class="form-group mb-3">\
                                        <div>\
                                            <label>Preset</label>\
                                            <div class="float-right mr-1">\
                                                <a class="pending-interpretation-comment-form-save text-success mr-2" style="font-size:1.2rem" href="javascript:void(0)"><i class="far fa-save"></i></a>\
                                                <a class="pending-interpretation-comment-form-delete text-danger" style="font-size:1.2rem" href="javascript:void(0)"><i class="far fa-trash-alt"></i></i></a>\
                                            </div>\
                                        </div>\
                                        <select class="pending-interpretation-comment-form-preset custom-select input-type-select">\
                                            <option selected value="custom">Custom</option>\
                                        </select>\
                                    </div>\
                                    <div class="form-group mb-3">\
                                        <label>Preset name</label>\
                                        <input type="text" class="form-control input-type-sentence">\
                                        <small class="form-text text-muted">\
                                        </small>\
                                    </div>\
                                    <div class="form-group mb-3">\
                                        <label>Findings</label>\
                                        <textarea class="form-control input-type-sentence" rows="5"></textarea>\
                                        <small class="form-text text-muted">\
                                        </small>\
                                    </div>\
                                    <div class="form-group mb-3">\
                                        <label>Diagnosis</label>\
                                        <textarea class="form-control input-type-sentence" rows="2"></textarea>\
                                        <small class="form-text text-muted">\
                                        </small>\
                                    </div>'
                                    if (procedure_index > 0)
                            temp+='<button class="pending-interpretation-prev-procedure btn btn-primary mt-2 float-left">Prev</button>';
                            temp+='<div class="float-right mt-2 pb-2">\
                                        <button class="pending-interpretation-clear-form btn btn-secondary mr-2">Clear</button>';
                                    if (procedure_index == response[0]['procedures'].length-1)
                                temp+= '<button id="pending-interpretation-submit-form" class="btn btn-primary">Submit</button>';
                                    else
                                temp+='<button class="pending-interpretation-next-procedure btn btn-primary">Next</button>';
                            temp+='</div>\
                                </form>\
                            </div>\
                        </div>';
                        procedure_index++;
                    })
                    $("#pending-interpretation-view-container").append(temp).css({"height":"100%","background-color":"black"});
                }
            },
            complete: function () {
                $("#pending-interpretation-view-container .pending-interpretation-comment-alert").hide();
                $('#pending-interpretation-view-container').removeClass('d-none');
                $("#pending-interpretation-search-form").css('opacity', 1);
                $("#pending-interpretation-footer").css('opacity', 1);
                $("#pending-interpretation-body").css('opacity', 1).parent().removeClass('ajax-loader');
                //populate #pending-interpretation-comment-form-preset (select)
                populate_for_reading_view_comment_form_preset();
            }
        });
    })
    $(this).on('click', ".pending-interpretation-results-print-preview", function() {
        let x_ray_no = $(this).parent().siblings().eq(0).html();
        let alert_tag = $("#interpretation-results-alert");
        
        $.ajax({
            type: "GET",
            url: "components/x_ray_results.php",
            data: {'results_by_x_ray_no': x_ray_no},
            dataType: "json",
            success: function (response) {
                temp = '';
                if (response[0]) {
                    temp += '<div class="page>';
                    $.each(response, function () { 
                            temp+= '<div class="sub-page">\
                                        <div class="page-header pt-4">\
                                            <table class="w-100">\
                                                <tr>\
                                                    <td class="text-center">\
                                                        <img style="width:3.6in" src="resources/images/x_ray_results_template/VSU_LOGO.png">\
                                                    </td>\
                                                    <td class="text-left pt-3">\
                                                        <div class="montserrat-10">OFFICE OF THE CHIEF OF UNIVERSITY SERVICES</div>\
                                                        <div class="montserrat-10">FOR HEALTH, EMERGENCY AND RESCUE (USHER)</div>\
                                                        <div style="margin-bottom:-3px" class="roboto-7">Visca, Baybay City, Leyte, 6521-A PHILIPPINES</div>\
                                                        <div style="margin-bottom:-3px" class="roboto-7">Telefax: (053) 563-9196/563-7510; Local 1047</div>\
                                                        <div style="margin-bottom:-3px" class="roboto-7">Email: <u>vsuhospital@vsu.edu.ph</u></div>\
                                                        <div class="roboto-7">Website: www.vsu.edu.ph</div>\
                                                    </td>\
                                                </tr>\
                                            </table>\
                                        </div>\
                                        <div class="page-body">\
                                            <table class="w-100">\
                                                <tr>\
                                                    <td colspan="3" class="page-body-title pb-5">\
                                                        X-RAY RESULT FORM\
                                                    </td>\
                                                </tr>\
                                                <tr>\
                                                    <td class="pb-3">\
                                                        RECORD: '+this['inf_no'].toString().toUpperCase()+'\
                                                    </td>\
                                                    <td>\
                                                    </td>\
                                                    <td>\
                                                    </td>\
                                                </tr>\
                                                <tr>\
                                                    <td class="pb-3">\
                                                        X-RAY NO.: '+this['x_ray_no']+'\
                                                    </td>\
                                                    <td class="pb-3">\
                                                        DATE: '+this['date']+'\
                                                    </td>\
                                                    <td>\
                                                    </td>\
                                                </tr>\
                                                <tr>\
                                                    <td class="pb-3">\
                                                        NAME: '+this['p_lname'].toString().toUpperCase()+', '+this['p_fname'].toString().toUpperCase()+'\
                                                    </td>\
                                                    <td class="pb-3">\
                                                        AGE: '+this['age']+'\
                                                    </td>\
                                                    <td class="pb-3">\
                                                        SEX: '+this['gender'].toString().toUpperCase()+'\
                                                    </td>\
                                                </tr>\
                                                <tr>\
                                                    <td class="pb-5">\
                                                    REQUESTING PHYSICIAN:\
                                                    </td>\
                                                    <td colspan="2" class="pb-5">\
                                                        <div style="margin-left:-7rem">DR. '+this['d_fname'].toString().toUpperCase()+' '+this['d_lname'].toString().toUpperCase()+'</div\
                                                    </td>\
                                                </tr>\
                                                <tr>\
                                                    <td class="pt-4 pb-5">\
                                                        PROCEDURE:\
                                                    </td>\
                                                    <td colspan="2" class="pt-4 pb-5">\
                                                        <div style="margin-left:-9rem">'+this['type'].toString().toUpperCase()+' '+this['views'].toString().toUpperCase()+'</div\
                                                    </td>\
                                                </tr>\
                                                <tr>\
                                                    <td colspan="3" class="pb-3">\
                                                        RADIOGRAPHIC FINDINGS:\
                                                    </td>\
                                                </tr>\
                                                <tr>\
                                                    <td colspan="3" class="pl-5 pb-5">\
                                                        '+this['findings'].toString().toUpperCase().replace(/\r\n|\r|\n/g,"<br />")+'\
                                                    </td>\
                                                </tr>\
                                                <tr>\
                                                    <td colspan="3" class="pt-5 pb-3">\
                                                        IMPRESSION:\
                                                    </td>\
                                                </tr>\
                                                <tr>\
                                                    <td colspan="3" class="pl-5 pb-5">\
                                                        '+this['diagnosis'].toString().toUpperCase()+'\
                                                    </td>\
                                                </tr>\
                                            </table>\
                                        </div>\
                                        <div class="page-sig pt-5">\
                                            <table class="w-100">\
                                                <tr>\
                                                    <td colspan="3" class="pl-2">\
                                                        <div class="float-left text-center">\
                                                            <div style="margin-bottom:-4px">\
                                                                <b><u>'+this['radtech_fname'].toString().toUpperCase()+' '+this['radtech_lname'].toString().toUpperCase()+', RRT'+'</u></b>\
                                                            </div>\
                                                            <div style="font-size:10.5pt">RADIOLOGIC TECHNOLOGIST</div>\
                                                        </div>\
                                                        <div class="float-right text-center mr-5">\
                                                            <div style="margin-bottom:-4px">\
                                                                <b><u>'+this['radiologist_fname'].toString().toUpperCase()+' '+this['radiologist_lname'].toString().toUpperCase()+', M.D., DPBR'+'</u></b>\
                                                            </div>\
                                                            <div style="font-size:10.5pt">RADIOLOGIST</div>\
                                                        </div>\
                                                    </td>\
                                                </tr>\
                                            </table>\
                                        </div>\
                                        <div class="page-footer">\
                                            <table class="footer-table" style="margin-left:6%;width:88%;">\
                                                <tr>\
                                                    <td class="roboto-8 pl-4 pb-1 text-center">\
                                                        <div><b>Vission:</b></div>\
                                                        <div><b>Mission:</b></div>\
                                                    </td>\
                                                    <td class="roboto-8 text-left pt-2 pl-5">\
                                                        <div style="margin-bottom:-3px">A globally competitive university for science, technology, and environmental conservation.</div>\
                                                        <div style="margin-bottom:-3px">Development of a highly competitive human resource, cutting-edge scientific knowledge</div>\
                                                        <div style="margin-bottom:-3px">and innovative technologies for sustainable communities and environment.</div>\
                                                    </td>\
                                                    <td class="align-top">\
                                                        <div class="roboto-8 pl-3"><i>Page 1 of 1</i></div>\
                                                        <div style="margin-bottom:-2px" class="roboto-8 pl-2"><b>FM-UHS-07</b></div>\
                                                        <div class="roboto-6 pl-3"><i>v3 05-03-2021</i></div>\
                                                        <div style="margin-left:-.5rem" class="calibri-6 pl-1"><i>No.</i></div>\
                                                    </td>\
                                                </tr>\
                                            </table>\
                                        </div>\
                                    </div>';
                    });
                    temp+='</div>';
                    $("#pending-interpretation-view-container").html(temp).removeClass('d-none').css({"height":"auto", "background-color":"var(--dark)"});
                }
                else {
                    alert_tag.finish();
                    alert_tag.removeClass('alert-warning alert-success');
                    alert_tag.addClass('alert-danger');
                    alert_tag.html("Unable to fetch data. Please make sure you have a working internet connection.").css({
                        'opacity': 0
                    });
                    alert_tag.show();
                    alert_tag.animate({
                        'opacity': 1
                    }, 500);
                    alert_tag.fadeTo(5000, 500).slideUp(500, function(){
                        alert_tag.removeClass('alert-success');
                        alert_tag.removeClass('alert-danger');
                    });
                }
            },
            complete: function() {
                let img = $("#pending-interpretation-view-container").find('img');
                $(img.eq(0)).on('load', function() { window.print();$("#pending-interpretation-view-container").addClass('d-none') }).on('error', function() { console.log("error loading image"); }).attr("src", $(this).attr("src"))
            }
        });
        
    })
    $("#pending-interpretation-search-form").on('submit', function(e) {
        e.preventDefault();
        $("#pending-interpretation-body").css('opacity', .2).html('');
        $("#pending-interpretation-search-form").css('opacity', .2);
        $("#pending-interpretation .card-body").addClass('ajax-loader');
        $("#pending-interpretation-footer").html('<i class="fas fa-long-arrow-alt-left"></i> Back').addClass("d-none").removeClass('text-secondary');
        let role = 'radiologist';
        if ($(this).parent().parent().children().eq(0).html().match("Pending interpretation"))
            role = 'radtech';
        populate_for_reading(role, $("#pending-interpretation-search-input").val(), $("#pending-interpretation-search-by").html());
    })
    $("#interpretation-results-search-form").on('submit', function(e) {
        e.preventDefault();
        $("#interpretation-results-body").css('opacity', .2).html('');
        $("#interpretation-results-search-form").css('opacity', .2);
        $("#interpretation-results .card-body").addClass('ajax-loader')
        $("#interpretation-results-footer").html('<i class="fas fa-long-arrow-alt-left"></i> Back').addClass("d-none").removeClass('text-secondary');
        let role = 'radiologist';
        if ($(this).parent().parent().children().eq(0).html().match("Results"))
            role = 'radtech';
        populate_for_printing(role, $("#interpretation-results-search-input").val(), $("#interpretation-results-search-by").html());
    })
    $("#pending-interpretation-search-form .dropdown-item").on('click', function (e) {  
        e.preventDefault();
        $("#pending-interpretation-search-by").html($(this).html())
        if($(this).html() == "date") {
            $("#pending-interpretation-search-input").attr("type", "date");
        }
        else {
            $("#pending-interpretation-search-input").attr("type", "text");
        }
    })
    $("#interpretation-results-search-form .dropdown-item").on('click', function (e) {  
        e.preventDefault();
        $("#interpretation-results-search-by").html($(this).html())
        if($(this).html() == "date") {
            $("#interpretation-results-search-input").attr("type", "date");
        }
        else {
            $("#interpretation-results-search-input").attr("type", "text");
        }
    })
    $("#pending-interpretation-footer").on('click', function (e) {
        e.preventDefault();
        let role = 'radiologist';
        let header = $(this).parent().parent().parent().find(".card-header").html();
        if (header.match('Pending interpretation'))
            role = 'radtech';
        if ($(this).html().match('Back')) {
            get_for_reading_list(role);
            return
        }
        if ($(this).html().match('See more')){
            $("#pending-interpretation-body").css('opacity', .2);
            $("#pending-interpretation-search-form").css('opacity', .2);
            $("#pending-interpretation .card-body").addClass('ajax-loader')
            $("#pending-interpretation-footer").addClass("d-none");
        
            let h5s = $("#pending-interpretation-body").find('h5');
            let len = h5s.length - 1;
            let date = h5s.eq(len).html();

            $.ajax({
                type: "GET",
                url: "components/teleradiology.php",
                data: {"unknown_date":"for_reading", "input_val":date},
                dataType: "html",
                success: function (response) {
                    if (response.match("END")){
                        $("#pending-interpretation-footer").html(response).addClass("text-secondary").removeClass("d-none");
                        $("#pending-interpretation-body").css('opacity', 1);
                        $("#pending-interpretation-search-form").css('opacity', 1);
                        $("#pending-interpretation .card-body").removeClass('ajax-loader');
                    }
                    else{
                        populate_for_reading(role, response, "date");
                    }
                }
            });
        }
    })
    $("#interpretation-results-footer").on('click', function (e) {
        e.preventDefault();
        let role = 'radiologist';
        let header = $(this).parent().parent().parent().find(".card-header").html();
        if (header.match('Results'))
            role = 'radtech';
        if ($(this).html().match('Back')) {
            get_for_printing_list(role);
            return
        }
        if ($(this).html().match('See more')){
            $("#interpretation-results-body").css('opacity', .2);
            $("#interpretation-results-search-form").css('opacity', .2);
            $("#interpretation-results .card-body").addClass('ajax-loader')
            $("#interpretation-results-footer").addClass("d-none");
        
            let h5s = $("#interpretation-results-body").find('h5');
            let len = h5s.length - 1;
            let date = h5s.eq(len).html();

            $.ajax({
                type: "GET",
                url: "components/teleradiology.php",
                data: {"unknown_date":"for_printing", "input_val":date},
                dataType: "html",
                success: function (response) {
                    if (response.match("END")){
                        $("#interpretation-results-footer").html(response).addClass("text-secondary").removeClass("d-none");
                        $("#interpretation-results-body").css('opacity', 1);
                        $("#interpretation-results-search-form").css('opacity', 1);
                        $("#interpretation-results .card-body").removeClass('ajax-loader');
                    }
                    else{
                        populate_for_printing(role, response, "date");
                    }
                }
            });
        }
    })
    $("#patient-census-form").on('submit', function(e) {
        e.preventDefault();
        $("#patient-census-from").removeClass('is-invalid');
        $("#patient-census-until").removeClass('is-invalid');

        //check dates if logical
        if ($("#patient-census-from").val() > $("#patient-census-until").val()) {
            $("#patient-census-from").addClass('is-invalid');
            $("#patient-census-until").addClass('is-invalid');
            return;
        }


        $("#patient-census-form").css('opacity', .2);
        $("#dashboard .card-body").css('opacity', .2).parent().addClass('ajax-loader');
        let form = {'from_year':$("#patient-census-from").val().split('-')[0], 'from_month':$("#patient-census-from").val().split('-')[1], 'until_year':$("#patient-census-until").val().split('-')[0], 'until_month':$("#patient-census-until").val().split('-')[1]};
        
        $.ajax({
            type: "GET",
            url: "components/patient_census.php",
            data: form,
            dataType: "json",
            success: function (response) {
                let index = 0;
                if (response[0]) {
                    temp = '<div class="table-responsive mt-3">\
                                <table class="table table-bordered text-center">\
                                    <thead>\
                                        <tr>\
                                            <th rowspan="2" colspan"2" class="align-middle" style="background-color: #FDE9D9">MONTH & YEAR</th>\
                                            <th colspan="2" style="background: #00B0F0">STUDENT</th>\
                                            <th colspan="2" style="background: #00B0F0">EMPLOYEE</th>\
                                            <th colspan="2" style="background: #00B0F0">OUSIDER</th>\
                                            <th colspan="2" style="background: #FFC000">ADULT</th>\
                                            <th colspan="2" style="background: #FFC000">PEDIA</th>\
                                            <th colspan="2" style="background: #EEECE1">OPD</th>\
                                            <th colspan="2" style="background: #EEECE1">INP</th>\
                                            <th colspan="2" style="background: #C0504D">MEDICAL</th>\
                                            <th colspan="2" style="background: #C0504D">SURGERY</th>\
                                            <th colspan="2" style="background: yellow">TOTAL</th>\
                                        </tr>\
                                        <tr>\
                                            <th style="background: #92D050">M</th>\
                                            <th style="background: #92D050">F</th>\
                                            <th style="background: #92D050">M</th>\
                                            <th style="background: #92D050">F</th>\
                                            <th style="background: #92D050">M</th>\
                                            <th style="background: #92D050">F</th>\
                                            <th style="background: #C6D9F1">M</th>\
                                            <th style="background: #C6D9F1">F</th>\
                                            <th style="background: #C6D9F1">M</th>\
                                            <th style="background: #C6D9F1">F</th>\
                                            <th style="background: #FABF8F">M</th>\
                                            <th style="background: #FABF8F">F</th>\
                                            <th style="background: #FABF8F">M</th>\
                                            <th style="background: #FABF8F">F</th>\
                                            <th style="background: #E5DFEC">M</th>\
                                            <th style="background: #E5DFEC">F</th>\
                                            <th style="background: #E5DFEC">M</th>\
                                            <th style="background: #E5DFEC">F</th>\
                                            <th style="background: #B6DDE8">M</th>\
                                            <th style="background: #B6DDE8">F</th>\
                                        </tr>\
                                    </thead>\
                                    <tbody>';
                                    
                    $.each(response, function () { 
                        temp += '<tr>';
                        if (index != response.length -1) {
                            $.each(this, function (indexInArray) { 
                                temp += '<td class="align-middle"';
                                if (indexInArray > 0 && indexInArray <= 6)
                                    temp += 'style="background: #92D050"';
                                if (indexInArray > 6 && indexInArray <= 10) 
                                    temp += 'style="background: #C6D9F1"';
                                if (indexInArray > 10 && indexInArray <= 14) 
                                    temp += 'style="background: #FABF8F"';
                                if (indexInArray > 14 && indexInArray <= 18) 
                                    temp += 'style="background: #E5DFEC"';
                                if (indexInArray > 18 && indexInArray <= 20) 
                                    temp += 'style="background: #B6DDE8"';
                                //console.log(Object.keys(this));
                                temp += '>'+ ((Object.values(this) == 0) ? "-":Object.values(this)) +'</td>'
                            });
                        }
                        else {
                            $.each(this, function (indexInArray) { 
                                //console.log(Object.keys(this));
                                if (indexInArray == 0)
                                    temp += '<td class="align-middle" style="background: yellow">'+ ((Object.values(this) == 0) ? "-":Object.values(this)) +'</td>'
                                else {
                                    temp += '<td class="align-middle" colspan="2"';
                                    if (indexInArray > 0 && indexInArray <= 3)
                                        temp += 'style="background: #00B0F0"';
                                    if (indexInArray > 3 && indexInArray <= 5) 
                                        temp += 'style="background: #FFC000"';
                                    if (indexInArray > 5 && indexInArray <= 7) 
                                        temp += 'style="background: #EEECE1"';
                                    if (indexInArray > 7 && indexInArray <= 9) 
                                        temp += 'style="background: #C0504D"';
                                    if (indexInArray > 9) 
                                        temp += 'style="background: yellow"';
                                        temp += '>'+ ((Object.values(this) == 0) ? "-":Object.values(this)) +'</td>'
                                }
                            });
                        }
                        temp += '</tr>';
                        index++;
                    });
                    temp +=         '</tbody>\
                                </table>\
                            </div>';
                    $("#dashboard .card-body").html(temp);
                }
                else {
                    $("#dashboard .card-body").html('\
                        <div class="d-flex justify-content-center mt-3">\
                            <h6>Can\'t connect to server. Please make Sure you have a working internet connection.</h6>\
                        </div>');
                }
            },
            complete: function() {
                $("#patient-census-form").css('opacity', 1);
                $("#dashboard .card-body").css('opacity', 1).parent().removeClass('ajax-loader');
            }
        })
    })
    $(this).on('click', ".pending-interpretation-view-patient", function() {
        $("body").css('overflow','hidden');
        $("#pending-interpretation-body").css('opacity', .2).parent().addClass('ajax-loader');
        $("#pending-interpretation-search-form").css('opacity', .2);
        $("#pending-interpretation-footer").css('opacity', .2);
        let x_ray_no = $(this).parent().siblings().eq(0).html();

        let inputs = $("#patient-info-form input");
        let selects = $("#patient-info-form select");
        inputs.val('').attr('disabled', true);
        selects.val('').attr('disabled', true);
        $('#patient-info-alert').hide();

        $.ajax({
            type: "GET",
            url: "components/get_patient.php",
            data: {"info": x_ray_no},
            dataType: "json",
            success: function (response) {
                let input_index = 0; let select_index = 0; let all_index = 0; let multi_select_index = 3;
                let physican = '';
                for (row in response) {
                    for(col in response[row]) {
                        if (input_index == 7)
                            input_index++;
                        if (all_index == 5|| all_index == 8) {
                            inputs.eq(input_index++).val(response[row][col]).attr("disabled", true);
                        }
                        else if (all_index == 9 || all_index == 11) {
                            selects.eq(select_index++).attr("disabled", true).children().eq(0).html(response[row][col]);
                        }
                        else if (all_index == 13 || all_index == 14 || all_index == 15) {
                            physican+=response[row][col]+" ";
                        }
                        else if (all_index == 0 || all_index == 1) {
                            selects.eq(multi_select_index++).attr("disabled", true).children().eq(0).html(response[row][col]);
                        }
                        else {
                            inputs.eq(input_index++).attr('placeholder', (response[row][col] == "none" || response[row][col] == "0" || response[row][col] == null || response[row][col] == "") ? "":response[row][col]).attr("disabled", true);
                        }

                        if (all_index == 15)
                            selects.eq(select_index++).attr("disabled", true).children().eq(0).html(physican);
                        all_index++;
                    }
                }
            }, 
            complete: function() {
                $("#pending-interpretation-search-form").css('opacity', 1);
                $("#pending-interpretation-footer").css('opacity', 1);
                $("#pending-interpretation-body").css('opacity', 1).parent().removeClass('ajax-loader');
                $("#patient-info .modal").modal("show");
            }
        });
    })
    $('.navlinks').eq(0).click();
});





//------------------------------------------------------------------------- functions ----------------------------------------------//
function get_for_reading_list(role) {
    $("#pending-interpretation .card-body").addClass('ajax-loader');
    $("#pending-interpretation-body").html('');
    $("#pending-interpretation-body").css('opacity', .2);
    $("#pending-interpretation-search-form").css('opacity', .2);
    $("#pending-interpretation-search-input").val('');
    $("#pending-interpretation-footer").addClass('d-none').html('<i class="fas fa-long-arrow-alt-down"></i> See more').removeClass('text-secondary');
    $.ajax({
        type: "GET",
        url: "components/teleradiology.php",
        data: {"unknown_date": "for_reading", "input_val":tom},
        dataType: "html",
        success: function (response) {
            if (!response.match("END")) {
                populate_for_reading(role, response, "date");
            }
            else {
                if (role.match("radtech")) {
                    $("#pending-interpretation-body").html('\
                        <div class="d-flex justify-content-center mt-3">\
                            <h6>Nothing added yet!</h6>\
                        </div>\
                        <div class="d-flex justify-content-center">\
                            <p class="mt-3 mr-1">Click</p>\
                            <button id="go-to-send-xray-image" type="button" class="btn btn-outline-primary" style="height:2rem;margin-top:.6rem;padding:0 .5rem">here</button>\
                            <p class="mt-3 ml-1">to send a record.</p>\
                        </div>\
                    ');
                    $("#go-to-send-xray-image").on('click', function() {
                        $('.navlinks').eq(3).click();
                    })
                }
                else {
                    $("#pending-interpretation-body").html('\
                        <div class="d-flex justify-content-center mt-3">\
                            <h6>Nothing to interpret and diagnose for now..</h6>\
                        </div>\
                    ');
                }
                $("#pending-interpretation-body").css('opacity', 1);
                $("#pending-interpretation .card-body").removeClass('ajax-loader');
            }
        }
    });
}

function populate_for_reading(role, input_val, search_by) {
    $("#pending-interpretation-body").css('opacity', .2);
    $("#pending-interpretation-search-form").css('opacity', .2);
    $("#pending-interpretation .card-body").addClass('ajax-loader');
    $.ajax({
        type: "GET",
        url: "components/teleradiology.php",
        data: {"for_reading_by":search_by, "input_val": input_val},
        dataType: "json",
        success: function (response) {
            if (!response[0]) {
                $("#pending-interpretation-body").html('<div class="text-center"><h5 class="mt-4 mb-4">Search result/s</h5><p>No record/s found!</p></div>');
            }
            else {
                if (role.match("radtech")) {
                    $.each(response, function () { 
                        let h5 = $("#pending-interpretation-body").find('h5').eq($("#pending-interpretation-body").find('h5').length-1).html();
                        temp = '';
                        let index = 0;
                        
                        if (h5 == undefined || !h5.match(this.date)) {
                            $("#pending-interpretation-body").append('\
                                <div class="table-responsive mt-3">\
                                    <h5 class="text-center mb-4">'+this.date+'</h5>\
                                    <table class="table table-hover text-center">\
                                        <thead class="text-secondary">\
                                            <tr>\
                                                <th>XRAY NO</th>\
                                                <th>FIRST NAME</th>\
                                                <th>LAST NAME</th>\
                                                <th>AGE</th>\
                                                <th>GENDER</th>\
                                                <th>HISTORY/PURPOSE</th>\
                                                <th>ACTION/S</th>\
                                            </tr>\
                                        </thead>\
                                        <tbody>\
                                        </tbody>\
                                    </table>\
                                </div>\
                            ');
                        }
                        
                        let tbody = $("#pending-interpretation-body").find('h5').eq($("#pending-interpretation-body").find('h5').length-1).siblings().eq(0).find('tbody');
                        temp += '<tr>';
                        $.each(this, function () { 
                            if (index == 6) {
                                temp += '<td>';
                                temp+= '<a href="#" class="fa fa-trash-alt text-danger pending-interpretation-delete" style="font-size:1rem"></a>';
                                temp += '</td>';
                            }
                            if (index < 6)
                                temp += '<td>'+this+'</td>';
                            index++;
                        });
                        temp += '</tr>';
                        tbody.append(temp);
                    });
                }
                else {
                    $.each(response, function () { 
                        let h5 = $("#pending-interpretation-body").find('h5').eq($("#pending-interpretation-body").find('h5').length-1).html();
                        let temp = '';
                        let index = 0;
                        
                        if (h5 == undefined || !h5.match(this.date)) {
                            $("#pending-interpretation-body").append('\
                                <div class="table-responsive mt-3">\
                                    <h5 class="text-center mb-4">'+this.date+'</h5>\
                                    <table class="table table-hover text-center">\
                                        <thead class="text-secondary">\
                                            <tr>\
                                                <th>XRAY NO</th>\
                                                <th>FIRST NAME</th>\
                                                <th>LAST NAME</th>\
                                                <th>AGE</th>\
                                                <th>GENDER</th>\
                                                <th>HISTORY/PURPOSE</th>\
                                                <th>ACTION/S</th>\
                                            </tr>\
                                        </thead>\
                                        <tbody>\
                                        </tbody>\
                                    </table>\
                                </div>\
                            ');
                        }
                        
                        let tbody = $("#pending-interpretation-body").find('h5').eq($("#pending-interpretation-body").find('h5').length-1).siblings().eq(0).find('tbody');
                        temp += '<tr>';
                        $.each(this, function () { 
                            if (index == 7) {
                                temp += '<td>';
                                temp += '<a href="javascript:void(0)" class="badge badge-primary align-middle pending-interpretation-view-patient mr-1" style="width:auto">VIEW PATIENT</a>';
                                temp += '<a href="javascript:void(0)" class="badge badge-primary align-middle pending-interpretation-interpret">INTERPRET</a>';
                                temp += '</td>';
                            }
                            if (index < 6)
                                temp += '<td>'+this+'</td>';
                            index++;
                        });
                        temp += '</tr>';
                        tbody.append(temp);
                    });
                }
            }
        },
        complete: function () {
            $("#pending-interpretation-body").css('opacity', 1);
            $("#pending-interpretation-search-form").css('opacity', 1).removeClass('d-none');
            $("#pending-interpretation .card-body").removeClass('ajax-loader');
            $("#pending-interpretation-footer").removeClass('d-none');
        }
    });
}

function get_for_printing_list(role) {
    $("#interpretation-results .card-body").html('<div id="interpretation-results-body"></div>').addClass('ajax-loader');
    $("#interpretation-results-body").html('');
    $("#interpretation-results-body").css('opacity', .2);
    $("#interpretation-results-search-form").css('opacity', .2);
    $("#interpretation-results-search-input").val('');
    $("#interpretation-results-footer").addClass('d-none').html('<i class="fas fa-long-arrow-alt-down"></i> See more').removeClass('text-secondary');
    $.ajax({
        type: "GET",
        url: "components/teleradiology.php",
        data: {"unknown_date": "for_printing", "input_val":tom},
        dataType: "html",
        success: function (response) {
            if (!response.match("END")) {
                populate_for_printing(role, response, "date");
            }
            else {
                $("#interpretation-results-search-form").addClass('d-none');
                if (role == 'radiologist') {
                    $("#interpretation-results-body").html('\
                        <div class="d-flex justify-content-center mt-3">\
                            <h6>Nothing added yet!</h6>\
                        </div>\
                        <div class="d-flex justify-content-center">\
                            <p class="mt-3 mr-1">Click</p>\
                            <button id="go-to-pending-interpretation" type="button" class="btn btn-outline-primary" style="height:2rem;margin-top:.6rem;padding:0 .5rem">here</button>\
                            <p class="mt-3 ml-1">to interpret a radiograph.</p>\
                        </div>\
                    ');
                    $("#go-to-pending-interpretation").on('click', function() {
                        $('.navlinks').eq(0).click();
                    })
                }
                else {
                    $("#interpretation-results-body").html('\
                        <div class="d-flex justify-content-center mt-3">\
                            <h6>Nothing to print for now..</h6>\
                        </div>\
                    ');
                }
                $("#interpretation-results-body").css('opacity', 1);
                $("#interpretation-results .card-body").removeClass('ajax-loader');
            }
        }
    });
}

function populate_for_printing(role, input_val, search_by) {
    $("#interpretation-results-body").css('opacity', .2);
    $("#interpretation-results-search-form").css('opacity', .2);
    $("#interpretation-results .card-body").addClass('ajax-loader');

    $.ajax({
        type: "GET",
        url: "components/teleradiology.php",
        data: {"for_printing_by":search_by, "input_val":input_val},
        dataType: "json",
        success: function (response) {
            if (!response[0]) {
                $("#interpretation-results-body").html('<div class="text-center"><h5 class="mt-4 mb-4">Search result/s</h5><p>No record/s found!</p></div>');
            }
            else {
                if (role == 'radiologist') {
                    $.each(response, function () { 
                        let h5 = $("#interpretation-results-body").find('h5').eq($("#interpretation-results-body").find('h5').length-1).html();
                        temp = '';
                        let index = 0;
                        
                        if (h5 == undefined || !h5.match(this.date)) {
                            $("#interpretation-results-body").append('\
                                <div class="table-responsive mt-3">\
                                    <h5 class="text-center mb-4">'+this.date+'</h5>\
                                    <table class="table table-hover text-center">\
                                        <thead class="text-secondary">\
                                            <tr>\
                                                <th>XRAY NO</th>\
                                                <th>FIRST NAME</th>\
                                                <th>LAST NAME</th>\
                                                <th>AGE</th>\
                                                <th>GENDER</th>\
                                                <th>HISTORY/PURPOSE</th>\
                                                <th>ACTION/S</th>\
                                            </tr>\
                                        </thead>\
                                        <tbody>\
                                        </tbody>\
                                    </table>\
                                </div>\
                            ');
                        }
                        
                        let tbody = $("#interpretation-results-body").find('h5').eq($("#interpretation-results-body").find('h5').length-1).siblings().eq(0).find('tbody');
                        temp += '<tr>';
                        $.each(this, function () { 
                            if (index == 6) {
                                temp += '<td>';
                                    temp+= '<a href="javascript:void(0)" class="badge badge-primary align-middle interpretation-results-view mr-3">VIEW/EDIT</a>\
                                            <a href="javascript:void(0)" class="fa fa-trash-alt text-danger align-middle interpretation-results-delete" style="font-size:1rem"></a>';
                                temp += '</td>';
                            }
                            if (index < 6)
                                temp += '<td>'+this+'</td>';
                            index++;
                        });
                        temp += '</tr>';
                        tbody.append(temp);
                    });
                }
                else {
                    $.each(response, function () { 
                        let h5 = $("#interpretation-results-body").find('h5').eq($("#interpretation-results-body").find('h5').length-1).html();
                        let temp = '';
                        let index = 0;
                        
                        if (h5 == undefined || !h5.match(this.date)) {
                            $("#interpretation-results-body").append('\
                                <div class="table-responsive mt-3">\
                                    <h5 class="text-center mb-4">'+this.date+'</h5>\
                                    <table class="table table-hover text-center">\
                                        <thead class="text-secondary">\
                                            <tr>\
                                                <th>XRAY NO</th>\
                                                <th>FIRST NAME</th>\
                                                <th>LAST NAME</th>\
                                                <th>AGE</th>\
                                                <th>GENDER</th>\
                                                <th>HISTORY/PURPOSE</th>\
                                                <th>ACTION/S</th>\
                                            </tr>\
                                        </thead>\
                                        <tbody>\
                                        </tbody>\
                                    </table>\
                                </div>\
                            ');
                        }
                        
                        let tbody = $("#interpretation-results-body").find('h5').eq($("#interpretation-results-body").find('h5').length-1).siblings().eq(0).find('tbody');
                        temp += '<tr>';
                        $.each(this, function () { 
                            if (index == 7) {
                                temp += '<td>\
                                            <a href="javascript:void(0)" style="width:80%" class="badge badge-primary align-middle pending-interpretation-results-print-preview mr-2"><i class="fas fa-print mr-2"></i>PRINT</a>\
                                        </td>';
                            }
                            if (index < 6)
                                temp += '<td>'+this+'</td>';
                            index++;
                        });
                        temp += '</tr>';
                        tbody.append(temp);
                    });
                }
            }
        },
        complete: function() {
            $("#interpretation-results-body").css('opacity', 1);
            $("#interpretation-results-search-form").css('opacity', 1).removeClass('d-none');;
            $("#interpretation-results .card-body").removeClass('ajax-loader');
            $("#interpretation-results-footer").removeClass('d-none');
        }
    });
}

function add_update_presets(preset_val, exist, alert_tag, inputs, form_) {
    let form = new FormData();

    if (exist)
        form.append('overwrite', inputs.eq(0).val());
    else {
        if (preset_val == 'custom') 
            form.append('add', inputs.eq(0).val());
        if (preset_val != 'custom')  {
            form.append('id', preset_val);
            form.append('update', inputs.eq(0).val());
        }
    }
    form.append('findings', inputs.eq(1).val());
    form.append('diagnosis', inputs.eq(2).val());
    
    alert_tag.hide();
    form_.css('opacity', .2);
    form_.parent().addClass('ajax-loader');
    $.ajax({
        type: "POST",
        url: "components/presets.php",
        data: form,
        dataType: "html",
        processData: false,
        contentType: false,
        success: function (response) {
            alert_tag.finish();
            alert_tag.removeClass('alert-warning');
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
                alert_tag.removeClass('alert-success');
                alert_tag.removeClass('alert-danger');
            });
            populate_for_reading_view_comment_form_preset();
        }
    });
}

function populate_for_reading_view_comment_form_preset() {
    $(".pending-interpretation-comment-form-preset").html('<option selected value="custom">Custom</option>');
    $.ajax({
        type: "GET",
        url: "components/presets.php",
        data: {"presets":"ok"},
        dataType: "json",
        success: function (response) {
            $('.pending-interpretation-comment-form').css('opacity', 1);
            $('.pending-interpretation-comment-form').parent().removeClass('ajax-loader');
            $(response).each(function () {
                $(".pending-interpretation-comment-form-preset").append('<option value='+ this['id'] +'>'+ this['preset_name'] +'</option>');
            });
        },
        complete:function () {
            $(".pending-interpretation-comment-form .form-control").removeClass('is-valid is-invalid').val('');
            $(".pending-interpretation-comment-form-preset").removeClass('is-valid is-invalid');
            $('.pending-interpretation-comment-form').css('opacity', 1);
            $('.pending-interpretation-comment-form').parent().removeClass('ajax-loader');
        }
    });
}

function populate_patient_list() {
    $("#patient-list-card-body-table").html('');
    $("#patient-list-search-input").val('');
    $("#patient-list-footer").html('<i class="fas fa-long-arrow-alt-down"></i> See more').addClass('d-none').removeClass("text-secondary").click();
}

function get_patient_list(data, temp1) {
    let form = '';
    let th4 = 'DATE</th><th>';
    let header = 'Search result/s';

    if (temp1 == "x-ray no.")
        form = {"x_ray_no": data}
    else  if (temp1 == "last name")
        form = {"lname": data}
    else {
        form = {"date": data};
        th4 = '';
        header = data;
    }
    
    $.ajax({
        type: "GET",
        url: "components/get_patient.php",
        data: form,
        dataType: "JSON",
        success: function (response) {
            if (response[0]) {
                $('#patient-list-card-body-table').append('\
                    <div class="table-responsive mt-4">\
                        <h5 class="text-center mb-4">'+header+'</h5>\
                        <table class="table table-hover border-bottom">\
                            <thead class="text-secondary">\
                                <tr>\
                                    <th>XRAY NO</th>\
                                    <th>FIRST NAME</th>\
                                    <th>LAST NAME</th>\
                                    <th>'+th4+'</th>\
                                </tr>\
                            </thead>\
                            <tbody>\
                            </tbody>\
                        </table>\
                    </div>\
                ');
                let h5 = $('#patient-list-card-body-table').find('h5').eq($('#patient-list-card-body-table').find('h5').length-1);
                let temp = '';
                for (row in response) {
                    temp += '<tr>';
                    for(data in response[row]) {
                        if (temp1 == "date") {
                            if (data != 'date')
                                temp += '<td>' + response[row][data] + '</td>';
                        }
                        else
                            temp += '<td>' + response[row][data] + '</td>';
                    }
                    temp += '<td><a href="javascript:void(0)" class="fas fa-chevron-circle-right text-primary" style="font-size:18px;text-decoration:unset"></a></td>';
                    temp += '</tr>';
                }
                h5.siblings().eq(0).find('tbody').append(temp);
            }
            else {
                $('#patient-list-card-body-table').html('<h5 class="mt-5 mb-4">'+header+'</h5><p>No record/s found!</p>');
            }
            $("#patient-list-card-body-table").css('opacity', 1);
            $("#patient-list-search-form").css('opacity', 1);
            $("#patient-list .card-body").removeClass('ajax-loader');
            $("#patient-list-footer").removeClass("d-none");
        }, complete: function() {
            let h5s = $('#patient-list-card-body-table').find('h5');

            for (let i = 0; i < 2; i++) {
                if (h5s.eq(i).html() == today)
                    h5s.eq(i).html("Today");
                if (h5s.eq(i).html() == yesterday)
                    h5s.eq(i).html("Yesterday");
            }
        }
    });
}
function get_user_list() {
    $.ajax({
        type: "GET",
        url: "components/get_user_info.php",
        data: {"user_list":"ok"},
        dataType: "json",
        success: function (response) {
            let table = '';
            for (row in response) {
                table += '<tr>';
                for(data in response[row]) {
                    if (data == 'status') {
                        let action = 'DISABLE';
                        let color = 'secondary';
                        if (response[row][data] == 'DISABLED') {
                            action = 'ACTIVATE';
                            color = 'success';
                        }
                        table +=    '<td class="align-middle">\
                                        <a href="#" id="user-list-view" class="badge badge-primary align-middle">VIEW</a>';
                        if (row != 0) {
                            table +=    '<a href="#" id="user-list-change-user-status" class="badge badge-'+color+' align-middle ml-2">'+action+'</a>\
                                    </td>';
                        }
                        else
                            table += '</td></tr>';
                    }
                    else
                        table += '<td class="align-middle">' + response[row][data] + '</td>';
                }
                table += '</tr>';
            }
            $('#user-list-body').html(table);
        },
        complete: function() {
            $("#user-list-container .card-body").css('opacity', 1);
            $("#user-list-container").removeClass('ajax-loader');
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