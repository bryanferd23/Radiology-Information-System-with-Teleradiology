const regex_email = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const regex_letters_numbers = /^[a-zA-Z0-9]+$/;
const regex_numbers = /^[0-9]+$/;
const regex_names = /^([a-zA-z]+[,.]?[ ]?|[a-z]+['-]?)+$/;
const regex_x_ray_no = /^([0-9][0-9][-][0-9]+)$/;
const regex_sentence = /^[a-zA-Z][a-zA-Z0-9 .,'-]+$/;
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
        let loading_tag_container = $(this).find('.progress');
        let loading_tag = $(this).find('.progress-bar');

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
        
        //--- prevent from running another process if this specific request is not completed ---//
        //--- prevent from running if an input is invalid ---//
        if (all_valid && !button.data('requestRunning')) {
            button.data('requestRunning', true);    

            //--- show loading animation while request is running ---//
            alert_tag.hide();
            loading_tag_container.removeClass('d-none');
            loading_tag.animate({
                width: "100%"
            }, 250);

            //--- run ajax request ---//
            $.ajax({
                type: "POST",
                url: "components/add_pending_reg.php",
                data: $(this).serialize(),
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

    //--- get user list when "view" is clicked -------------------------------------------//
    $(this).on('click', '#user-list-view', function (e) {
        e.preventDefault();
        let u_id = $(this).parent().parent().index()+1;
        $('#user-info-container .badge').removeClass('badge-success');
        $('#user-info-container .badge').removeClass('badge-secondary');

        $.ajax({
            type: "GET",
            url: "components/get_user_info.php",
            data: {'u_id' : u_id},
            dataType: "json",
            //--- if ajax request is success, place the user info inside modal's inner HTML ---//
            success: function (response) {
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
    $('.input-type-sentence').on('keyup', function () {
        let input = $(this).val();
        let small_tag = $(this).next();
        let input_tag = $(this);
        
        if (input) {
            //--- check input length ---//
            if (input.length >= 2 && input.length <= 20) {
                //--- check regular expression ---//
                if (regex_sentence.test(input)) {
                    input_feedback(input_tag, small_tag, 'Looks good!', 'valid');
                    return;
                }
            }
            input_feedback(input_tag, small_tag, 'Must be 2-20 characters long!', 'invalid');
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
        let loading_tag_container = $(this).find('.progress');
        let loading_tag = $(this).find('.progress-bar')

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
            loading_tag_container.removeClass('d-none');
            loading_tag.animate({
                width: "100%"
            }, 250);

            //--- run ajax request ---//
            $.ajax({
                type: "POST",
                url: "components/update_user.php",
                data: new FormData(this),
                processData: false,
                contentType: false,
                dataType: "html",
                success: function (response) {
                    loading_tag.finish();
                    alert_tag.finish();
                    loading_tag_container.addClass('d-none');
                    loading_tag.css({
                        width: "0%"
                    });
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
        let loading_tag_container = $(this).find('.progress');
        let loading_tag = $(this).find('.progress-bar');

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
            loading_tag_container.removeClass('d-none');
            loading_tag.animate({
                width: "100%"
            }, 250);

            //--- run ajax request ---//
            $.ajax({
                type: "POST",
                url: "components/update_user.php",
                data: $(this).serialize(),
                dataType: "html",
                success: function (response) {
                    loading_tag.finish();
                    alert_tag.finish();
                    loading_tag_container.addClass('d-none');
                    loading_tag.css({
                        width: "0%"
                    });
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
        let loading_tag_container = $(this).find('.progress');
        let loading_tag = $(this).find('.progress-bar');

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
            button.data('requestRunning', true);    
            temp = new FormData(this)
            temp.append('procedure',$('#procedure').children().first().html())
            temp.append('film_size',$('#film_size').children().first().html())
            //--- show loading animation while request is running ---//
            alert_tag.hide();
            loading_tag_container.removeClass('d-none');
            loading_tag.animate({
                width: "100%"
            }, 250);

            //--- run ajax request ---//
            $.ajax({
                type: "POST",
                url: "components/add_patient.php",
                processData: false,
                contentType: false,
                data: temp,
                dataType: "html",
                success: function (response) {
                    loading_tag.finish();
                    alert_tag.finish();
                    loading_tag_container.addClass('d-none');
                    loading_tag.css({
                        width: "0%"
                    });
                    if (response.match('Success!'))  {
                        let x_ray_no = ($('#x_ray_no').val()).split('-');
                        inputs.val('');
                        inputs.removeClass('is-valid');
                        $('#add-patient-form small').html('');
                        $('#add-patient-form small').removeClass('valid-feedback');
                        $('#add-patient-form select').removeClass('is-valid');
                        $('#add-patient-form select').prop('selectedIndex', 0);
                        x_ray_no = x_ray_no[0] + '-' + (parseInt(x_ray_no[1]) + 1)
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

    //--- append userlist of another date when see more is clicked ---//
    $("#patient-list-see-more").on('click', function(e) {
        e.preventDefault();
        let h5s = $("#patient-list-card-body-table").find('h5');
        let len = h5s.length - 1;
        let posttable = '</tbody></table></div>';
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
                    $("#patient-list-see-more").html(response);
                    $("#patient-list-see-more").addClass("text-secondary");
                }
                else{
                    pretable = set_pretable(response);
                    get_patient_list(response, pretable, posttable, "date");
                }
            },
            complete: function() {
                $("#patient-list .progress").addClass('d-none');
                $("#patient-list .progress-bar").css({
                    width: "0%"
                });
            }
        });
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
        let posttable = '</tbody></table></div>';
        $("#patient-list-card-body-table").html('');
        get_patient_list($("#patient-list-search-input").val(), set_pretable("Search result/s"), posttable, $("#patient-list-search-by").html());
        $("#patient-list-see-more").addClass("d-none");
        $("#patient-list-go-back").removeClass('d-none');
    })
    $("#patient-list-go-back").on('click', function () {
        populate_patient_list();
    })

    $(this).on('click', '#patient-list-card-body-table .fa-chevron-circle-right', function() {
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
                $("#patient-info .modal").modal("show");
            }
        });
    })
    $("#patient-info-edit").on('click', function(e) {
        e.preventDefault();

        $(this).addClass('d-none');
        $("#patient-info-update").removeClass('d-none');
        let inputs = $("#patient-info-form input");
        let selects = $("#patient-info-form select");
        
        inputs.attr('disabled', false);
        selects.attr('disabled', false);
    })
    $("#patient-info-form").on('submit', function(e) {
        e.preventDefault();
        let inputs = $("#patient-info-form input");
        let selects = $("#patient-info-form select");
        let alert_tag = $('#patient-info-alert');
        let loading_tag_container = $("#patient-info .progress");
        let loading_tag = $("#patient-info .progress-bar");
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
            loading_tag_container.removeClass('d-none');
            loading_tag.animate({
                width: "100%"
            }, 250);

            //proceed to ajax
            $.ajax({
                type: "post",
                url: "components/update_patient.php",
                data: form,
                processData: false,
                contentType: false,
                dataType: "html",
                success: function (response) {
                    loading_tag.finish();
                    alert_tag.finish();
                    loading_tag_container.addClass('d-none');
                    loading_tag.css({
                        width: "0%"
                    });
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
        alert_tag.hide();

        if (input.hasClass('is-invalid')) {
            input.focus();
            return;
        }

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
                        url: "components/teleradiology.php",
                        data: {'exist': response[0]["x_ray_no"]},
                        dataType: "html",
                        success: function (response) {
                            if (response.match('does not exist!')) {
                                $("#send-x-ray-image-form1").addClass('d-none');
                                $("#send-x-ray-image-form2").removeClass('d-none');
                                $("#step1").removeClass('step1');
                                $("#step1").addClass('step1-active');
                                $("#step2").removeClass('step2');
                                $("#step2").addClass('step2-active');
                                $("#send-x-ray-image-form2-send-button").removeClass('d-none');
                                $("#send-x-ray-image-h5").html("STEP 2");
                                $("#send-x-ray-image-form2-body").html('');
                                $("#send-x-ray-image-form2-body").append('<input type="text" class="d-none" name="send-x-ray-image-form2-body-x_ray_no" value="'+x_ray_no+'">');
                                for (elem in procedures) {
                                    $("#send-x-ray-image-form2-body").append('\
                                        <div class="text-center mt-5 mb-4" style="height:18rem">\
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
                                    $(this).parent().siblings().eq(0).append('<input type="file" class="send-x-ray-image-form2-input" name="image_of_'+procedure+'[]" multiple="multiple" accept="image/*">');
                                    $(this).parent().siblings().eq(0).children().eq($(this).parent().siblings().eq(0).children().length-1).click();
                                })
                            }
                            else {
                                alert_tag.finish();
                                alert_tag.addClass('alert-danger');
                                alert_tag.html(response).css({
                                    'opacity': 0
                                });
                                alert_tag.show();
                                alert_tag.animate({
                                    'opacity': 1
                                }, 500);
                                alert_tag.fadeTo(5000, 500).slideUp(500, function(){
                                    alert_tag.removeClass('alert-danger');
                                });
                            }
                        }
                    });
                }
            }
        }).fail(function(){ 
            alert_tag.finish();
            alert_tag.addClass('alert-danger');
            alert_tag.html('X-ray no. doesn\'t exist!').css({
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
        })
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
                    temp.parent().parent().parent().children().eq(2).append('\
                        <div class="mr-3 d-flex justify-content-center">\
                            <img src="'+reader.result+'" class="rounded mt-3 mb-3 float-left" width="150px" height="150px">\
                            <a href="" style="margin-top:-.3rem;margin-left:-.35rem;font-size:1.25rem;color:var(--danger)" class="send-x-ray-image-form2-delete-button"><i class="fas fa-times-circle"></i></a>\
                        </div>\
                    ')
                }
            }
        })
    })
    $(this).on('click', '.send-x-ray-image-form2-delete-button', function (e) {
        e.preventDefault();
        let index = $(this).parent().index();
        let inputs = $(".send-x-ray-image-form2-input");
        inputs.eq(index).remove();
        $(this).parent().remove();
    })
    $("#send-x-ray-image-form2-back").on('click', function(e) {
        e.preventDefault();
        $("#step1").removeClass('step1-active');
        $("#step1").addClass('step1');
        $("#step2").removeClass('step2-active');
        $("#step2").addClass('step2');
        $("#send-x-ray-image-form1").removeClass('d-none');
        $("#send-x-ray-image-form2").addClass('d-none');
        $("#send-x-ray-image-h5").html("STEP 1")
    })
    $("#send-x-ray-image-form2").on('submit', function(e) {
        e.preventDefault();
        let inputs = $(".send-x-ray-image-form2-input");
        let h5s = $(this).find('h5');
        let alert_tag = $("#send-x-ray-image-form2 .alert");
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
            window.scrollTo(0, 0);
            return;
        }
        
        if (!button.data('requestRunning')) {
            button.data('requestRunning', true); 
            $.ajax({
                type: "POST",
                url: "components/teleradiology.php",
                data: new FormData(this),
                processData: false,
                contentType: false,
                dataType: "html",
                success: function (response) {
                    alert_tag.finish();
                    if (response.match('Success!'))  {
                        alert_tag.addClass('alert-success');
                        $("#send-x-ray-image-form2-send-button").addClass('d-none');
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
                    window.scrollTo(0, 0);
                },
                complete: function () {
                    button.data('requestRunning', false);
                }
            });
        }
    })
});

function set_pretable(date) {
    return '\
    <div class="table-responsive mt-4">\
        <h5 class="text-center mb-4">'+date+'</h5>\
        <table class="table table-hover border-bottom">\
            <thead class="text-secondary">\
                <tr>\
                    <th>XRAY NO</th>\
                    <th>FIRST NAME</th>\
                    <th>LAST NAME</th>\
                    <th></th>\
                </tr>\
            </thead>\
            <tbody id="patient-list-body">\
            ';
}

function populate_patient_list() {
    $("#patient-list-card-body-table").html('').addClass('d-none');
    $("#patient-list-see-more").click();
    $("#patient-list-see-more").removeClass("d-none");
    $("#patient-list-see-more").html('<i class="fas fa-long-arrow-alt-down"></i> See more');
    $("#patient-list-go-back").addClass('d-none');
    $("#patient-list-see-more").removeClass("text-secondary");
    
    
    $("#patient-list .progress").removeClass('d-none');
    $("#patient-list .progress-bar").animate({
        width: "100%"
    }, 200, function() {
        $("#patient-list-card-body-table").removeClass('d-none')
        $("#patient-list .progress-bar").finish();
    });
}



//functions
function get_patient_list(data, pretable, posttable, temp1) {
    let form = '';
    if (temp1 == "x-ray no.")
        form = {"x_ray_no": data}
    else  if (temp1 == "last name")
        form = {"lname": data}
    else
        form = {"date": data};
    
    $.ajax({
        type: "GET",
        url: "components/get_patient.php",
        data: form,
        dataType: "JSON",
        success: function (response) {
            if (response[0]) {
                let table = '';
                for (row in response) {
                    table += '<tr>';
                    for(data in response[row]) {
                        if (data == 'x_ray_no' || data == 'p_fname' || data == 'p_lname') {
                            table += '<td class="align-middle">' + response[row][data] + '</td>';
                        }
                    }
                    table += '<td class="align-middle"><a href="javascript:void(0)" class="fas fa-chevron-circle-right text-primary" style="font-size:18px;text-decoration:unset"></a></td>';
                    table += '</tr>';
                }
                $('#patient-list-card-body-table').append(pretable+table+posttable);
            }
            else {
                if (temp1 != "gdate")
                    $('#patient-list-card-body-table').html('<h5 class="mt-5 mb-4">Search result/s</h5><p>No info</p>');
            }
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