const regex_email = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const regex_letters_numbers = /^[a-zA-Z0-9]+$/;
const regex_numbers = /^[0-9]+$/;
const regex_names = /^([a-zA-z]+[,.]?[ ]?|[a-z]+['-]?)+$/;
const x_ray_no = /^([0-9]+)+([-])+([0-9]+)$/;
//--------------- Run the scipt below when the document is ready or has loaded ---------------------------------------//
$(document).ready(function () {
    var temp;
    var nav_links = [$("#navlink1"), $("#navlink2"), $("#navlink3"), $("#edit-account")];
    var nav_link_content = $(".nav_link_content");
    var today = new Date();
    

    $.each(nav_links, function (indexInArray) { 
         nav_links[indexInArray].on('click', function(e) {
             e.preventDefault();
            
            if (nav_links[indexInArray].html() == "Administration") {
                get_user_list();
            }
            if (nav_links[indexInArray].html().match("Add patient")) {
                $('#exam_date').val(today.toISOString().substr(0, 10));
            }


             nav_link_content.addClass('d-none');
             nav_link_content.eq(indexInArray).removeClass('d-none');
         })
    });

    $('section .alert').hide();

    $("#welcome-message").fadeTo(15000, 500).slideUp(500, function(){
        $("#welcome-message").slideUp(500);
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

    //--- validate user input (email - send registration email) ---------------------------------------------------------//
    $('.email').on('keyup', function () {
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
    //--- validate user input (Code) --------------------------------------------------------------//
    $('#reg_code').on('keyup', function () {
        var input = $(this).val();
        var small_tag = $(this).next();
        var input_tag = $(this);

        if (input) {
            //--- check input length ---//
            if (input.length >= 5 && input.length <= 20) {
                //--- check regular expression ---//
                if (regex_letters_numbers.test(input)) {
                    input_feedback(input_tag, small_tag, 'Looks good!', 'valid');
                    return;
                }
            }
            input_feedback(input_tag, small_tag, 'Must be 5-20 characters long, containing letters and numbers only.', 'invalid');
        }
        else 
            input_feedback(input_tag, small_tag, 'Must be 5-20 characters long, containing letters and numbers only.', 'default');
    })
    $('#role').on('change', function () {
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
    //--- validate user input (fname - edit profile) ---------------------------------------------------------//
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
    //--- validate edit profile (gender) ---//
    $('#gender').on('change', function () {
        var input = $(this).val();
        var small_tag = $(this).next();
        var input_tag = $(this);

        if (input)
            input_feedback(input_tag, small_tag, 'Looks good!', 'valid');
        else 
            input_feedback(input_tag, small_tag, '', 'default');
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

    //--- validate user input new pass (change pass) ---//
    $('#new_u_pass').on('keyup', function () {
        var input = $(this).val();
        var input_tag = $(this);
        var small_tag = $(this).next();
        
        if (input) {
            //--- check input length ---//
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
        else
            input_feedback(input_tag, small_tag, 'Must be 8-20 characters long, containing letters and numbers only.', 'default');
        $('#new_u_pass2').keyup();
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

//--- Change password on submit ---------------------------------------------------------------------------//
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
    $('#b_date').on('focusout', function() {
        let DateNow = today.toISOString().substr(0, 10)
        let YearNow = DateNow.substr(0, 4)
        let MonthNow = DateNow.substr(6, 7)
        let DayNow = DateNow.substr(9, 10)
        let BDay = $(this).val().substr(9,10)
        let BYear = $(this).val().substr(0, 4)
        let BMonth = $(this).val().substr(6, 7)
        let Age = (YearNow - BYear) - 1;
        if (MonthNow > BMonth || (MonthNow == BMonth && DayNow >= BDay))
            Age++;
        $('#age').val(Age);
    })
    
    $('#procedure').on('focus', function() {
        $('#procedure').css({
            'height':'8.5rem',
            'position':'absolute',
            'width': '95%',
            'z-index':'999'
        })
        $(this).prop('multiple', true)
    })
    $('#procedure').on('focusout', function() {
        $(this).css({
            'height':'35.6px',
            'position':'relative',
            'width': '100%'
        })
        $(this).prop('multiple', false)
        if ($('#procedure-placeholder').html() == '')
            $('#procedure-placeholder').html('Choose...')
    })
    $('#procedure').on('change', function() {
        let temp ='';
        for (elem in $(this).val()) {
            temp+=$(this).val()[elem]+", ";
        }
        temp = temp.substr(0, temp.length-2)
        $('#procedure-placeholder').html(temp)
    })

    $('#procedure option').on('click', function(e) {
        if (e.ctrlKey) {
            $(this).siblings().removeClass("form-control form-control-sm is-valid");
            $(this).siblings().prop('selected', false);
            $('#procedure').change();
            if (!$(this).hasClass('is-valid')) {
                $(this).toggleClass("form-control form-control-sm is-valid");
                $(this).prop('selected', true);
            }
            else {
                $(this).removeClass("form-control form-control-sm is-valid");
                $(this).prop('selected', false);
            }
            let temp = $('#procedure option');
            for (option in temp) {
                if (temp.eq(option).hasClass('is-valid'))
                    temp.eq(option).prop('selected', true)
            }
            $('#procedure').change();
        }
        else {
            $('#procedure option').removeClass("form-control form-control-sm is-valid");
            $('#procedure option').prop('selected', false);
            $(this).toggleClass("form-control form-control-sm is-valid");
            $('#procedure').val('');
            $(this).prop('selected', true);
        }
    })

    $('#film_size').on('focus', function() {
        $(this).css({
            'height':'8.5rem',
            'position':'absolute',
            'width': '95%',
            'z-index':'999'
        })
        $(this).prop('multiple', true)
    })
    $('#film_size').on('focusout', function() {
        $(this).css({
            'height':'35.6px',
            'position':'relative',
            'width': '100%'
        })
        $(this).prop('multiple', false)
        if ($('#film_size-placeholder').html() == '')
            $('#film_size-placeholder').html('Choose...')
    })

    $('#film_size option').on('click', function(e) {
        if (e.ctrlKey) {
            if (!$(this).hasClass('is-valid')) {
                $(this).toggleClass("form-control form-control-sm is-valid");
                $(this).prop('selected', true);
            }
            else {
                $(this).removeClass("form-control form-control-sm is-valid");
                $(this).prop('selected', false);
            }
            let temp = $('#film_size option');
            for (option in temp) {
                if (temp.eq(option).hasClass('is-valid'))
                    temp.eq(option).prop('selected', true)
            }
            $('#film_size').change();
        }
        else {
            $('#film_size option').removeClass("form-control form-control-sm is-valid");
            $('#film_size option').prop('selected', false);
            $(this).toggleClass("form-control form-control-sm is-valid");
            $(this).prop('selected', true);
        }
    })
    $('#film_size').on('change', function() {
        let temp = '';
        for (elem in $(this).val()) {
            temp+=$(this).val()[elem]+', ';
        }
        temp = temp.substr(0, temp.length-2)
        $('#film_size-placeholder').html(temp);
    })
});





//--- get all user list ---------------------------------------------------------------//
function get_user_list() {
    $.ajax({
        type: "GET",
        url: "components/get_user_info.php",
        data: {"user_list":"ok"},
        dataType: "json",
        success: function (response) {
            var table = '';
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