const regex_email = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const regex_letters_numbers = /^[a-zA-Z0-9]+$/;
const regex_numbers = /^[0-9]+$/;
const regex_names = /^([a-zA-z]+[,.]?[ ]?|[a-z]+['-]?)+$/;
const regex_x_ray_no = /^([0-9][0-9][-][0-9]+)$/;
const regex_sentence = /^[a-zA-Z][a-zA-Z0-9 .,'-]+$/;
//--------------- Run the scipt below when the document is ready or has loaded ---------------------------------------//
$(document).ready(function () {
    var temp;
    var today = (new Date()).toISOString().substr(0, 10);

    $('section .alert').hide();
    $("#welcome-message").fadeTo(15000, 500).slideUp(500, function(){
        $("#welcome-message").slideUp(500);
    });
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
                populate_patient_list(today);
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
        var alert_tag = $('#send-registration-email-alert');
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

            //--- show loading animation while request is running ---//
            alert_tag.hide();
            alert_tag.removeClass('alert-success');
            alert_tag.removeClass('alert-danger');
            loading_tag_container.removeClass('d-none');
            loading_tag.animate({
                width: "100%"
            }, 2000);

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

    //--- get user list when "view" is clicked -------------------------------------------//
    $(this).on('click', '#user-list-view', function (e) {
        e.preventDefault();
        var u_id = $(this).parent().parent().index()+1;
        $('#user-info-container .badge').removeClass('badge-success');
        $('#user-info-container .badge').removeClass('badge-secondary');

        $.ajax({
            type: "GET",
            url: "components/get_user_info.php",
            data: {'u_id' : u_id},
            dataType: "json",
            //--- if ajax request is success, place the user info inside modal's inner HTML ---//
            success: function (response) {
                var row = $('#user-info-container .modal-body').children();
                row.eq(0).children().attr('src', response['img_url']);
                row.eq(1).html(response['fname'] + " " + response['lname']);
                row.eq(2).html(response['role']);
                row.eq(3).html(response['email']);
                row.eq(4).html("(+63) " + response['cnumber']);
                row.eq(5).html(response['gender']);
                var color = 'badge-success';
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
        var status = $(this).html();
        var u_id = $(this).parent().parent().index()+1;
        
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
        var input = $(this).val();
        var input_tag =  $(this);
        var small_tag = $(this).next();

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
        var input = $(this).val();
        var small_tag = $(this).next();
        var input_tag = $(this);

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
            input_feedback(input_tag, small_tag, '', 'default');
    })
    //--- validate user input (sentence/word/phrase) ---------------------------------------------------------//
    $('.input-type-sentence').on('keyup', function () {
        var input = $(this).val();
        var small_tag = $(this).next();
        var input_tag = $(this);
        
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
        var input = $(this).val();
        var small_tag = $(this).next();
        var input_tag = $(this);

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
        var input = e.target;
        if (input.files && input.files[0]) {
            var file = input.files[0];
            var reader = new FileReader();

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
        var alert_tag = $(this).find('.alert');
        var loading_tag_container = $(this).find('.progress');
        var loading_tag = $(this).find('.progress-bar')

        var inputs = $(this).find('input');
        var all_empty = true;
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
            if ($(this).val() != "")
                all_empty = false;
        })
        //--- check if all inputs are empty, do nothing if all are empty ---//
        //--- prevent from running another process if this specific request is not completed ---//
        if (!all_empty && all_valid && !button.data('requestRunning') || $('#gender').hasClass('is-valid')) {
            button.data('requestRunning', true);

            //--- show loading animation while request is running ---//
            alert_tag.hide();
            alert_tag.removeClass('alert-success');
            alert_tag.removeClass('alert-danger');
            loading_tag_container.removeClass('d-none');
            loading_tag.animate({
                width: "100%"
            }, 2000);

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

    //--- populate inputs when button is clicked ---//
    $('#edit-account').on('click', function(e) {
        e.preventDefault();
        
        $.ajax({
            type: "GET",
            url: "components/get_user_info.php",
            data: {"profile_info":"ok"},
            dataType: "json",
            success: function (response) {
                var inputs = $('#edit-profile-form input');
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
        var input = $(this).val();
        var upass = $('#new_u_pass').val();
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

//--- Change password form on submit ---------------------------------------------------------------------------//
    $('#change-password-form').on('submit', function(e) {
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
        //--- prevent from running if an input tag is invalid ---//
        //--- prevent from running another process if this specific request is not completed ---//
        if (all_valid && !button.data('requestRunning')) {
            button.data('requestRunning', true);

            //--- show loading animation while request is running ---//
            alert_tag.hide();
            alert_tag.removeClass('alert-success');
            alert_tag.removeClass('alert-danger');
            loading_tag_container.removeClass('d-none');
            loading_tag.animate({
                width: "100%"
            }, 2000);

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
    $('.input-type-date').on('change', function() {
        var input = $(this).val();
        var small_tag = $(this).next();
        var input_tag = $(this);

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
        let all_options = '';
        let select = '';
        let isProcedure = false;

        if ($(this).parent().prop('label')) {
            all_options = $('#procedure option');
            select = $('#procedure');
            isProcedure = true;
        }
        else {
            select = $('#film_size');
            all_options = $('#film_size option');
        }

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

    $("#x_ray_no").on('keyup', function() {
        var input = $(this).val();
        var input_tag = $(this);
        var small_tag = $(this).next();
        
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
        var input = $(this).val();
        var input_tag = $(this);
        var small_tag = $(this).next();
        
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
        var alert_tag = $('#add-patient-alert');
        var loading_tag_container = $(this).find('.progress');
        var loading_tag = $(this).find('.progress-bar');

        var inputs = $(this).find('input');
        var all_valid = true;
        var button = $(this);

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
            alert_tag.removeClass('alert-success');
            alert_tag.removeClass('alert-danger');
            loading_tag_container.removeClass('d-none');
            loading_tag.animate({
                width: "100%"
            }, 2000);

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

    //--- append userlist of another date when see more is clicked ---//
    $("#patient-list-see-more").on('click', function(e) {
        e.preventDefault();
        let h5s = $("#patient-list .card-body").find('h5');
        let len = h5s.length - 1;
        let posttable = '</tbody></table></div>';
        let date = h5s.eq(len).html();
        $.ajax({
            type: "GET",
            url: "components/get_patient.php",
            data: {"known_date": date},
            dataType: "html",
            success: function (response) {
                if (response.match("END")){
                    $("#patient-list-see-more").html(response);
                    $("#patient-list-see-more").addClass("text-secondary");
                }
                else{
                    pretable = set_pretable(response);
                    get_patient_list(response, pretable, posttable)
                }
            }
        });
    }) 

});

function set_pretable(date) {
    return '\
    <div class="table-responsive mb-4">\
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

function populate_patient_list(today) {
    let Year = today.substring(0, 4);
    let Month = today.substring(5, 7);
    let Day = today.substring(8, 10);
    let date = Year+"-"+Month+"-"+Day;

    $("#patient-list .card-body").html('');
    let posttable = '</tbody></table></div>';

    get_patient_list(date, set_pretable("Today"), posttable);
    let i = "1";
    date = Year+"-"+Month+"-"+(Day - i++);
    get_patient_list(date, set_pretable("Yesterday"), posttable);
    date = Year+"-"+Month+"-"+(Day - i++);
    get_patient_list(date, set_pretable(date), posttable);
    $("#patient-list-see-more").html('See more')
    $("#patient-list-see-more").removeClass("text-secondary");
}



//functions
function get_patient_list(date, pretable, posttable) {
    $.ajax({
        type: "GET",
        url: "components/get_patient.php",
        data: {'patient_list': date},
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
                    table += '<td id="" class="align-middle"><a href="#" class="fas fa-chevron-circle-right text-primary" style="font-size:18px;text-decoration:unset"></a></td>';
                    table += '</tr>';
                }
                $('#patient-list .card-body').append(pretable+table+posttable);
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