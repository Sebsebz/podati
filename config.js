/*jslint browser: true, devel: true, node: true*/
/*global $, jQuery, alert*/
var fs  = require('fs');
var ini = require('ini');

/****************
 *  Range Input  *
 ****************/
$(document).ready(function () {
    'use strict';

    var range_type = 'input[type=range]',
        range_mousedown = false,
        left,
        prev_value,
        range_wrapper = '.range-field';

    $(range_type).each(function () {
        var thumb = $('<span class="thumb"><span class="value"></span></span>');
        $(this).after(thumb);

        thumb.css({
            height: "0px",
            width: "0px",
            top: "50%"
        });
    });

    $(document).on('change', range_type, function (e) {
        var thumb = $(this).siblings('.thumb');
        thumb.find('.value').html($(this).val() + "\'");
    });

    $(document).on('input mousedown touchstart', range_type, function (e) {
        var thumb = $(this).siblings('.thumb'),
            width = $(this).outerWidth();

        // If thumb indicator does not exist yet, create it
        if (thumb.length <= 0) {
            thumb = $('<span class="thumb"><span class="value"></span></span>');
            $(this).after(thumb);
        }

        // Set indicator value
        thumb.find('.value').html($(this).val() + "\'");

        // Memo value to check a change
        prev_value = $(this).val();

        range_mousedown = true;
        $(this).addClass('active');
        $(this).removeClass('changed');

        if (!thumb.hasClass('active')) {
            thumb.stop().animate({
                height: "30px",
                width: "30px",
                top: "-50%"
            }, 300, "linear");
        }

        if (e.type !== 'input') {
            if (e.pageX === undefined || e.pageX === null) {//mobile
                left = e.originalEvent.touches[0].pageX - $(this).offset().left;
            } else { // desktop
                left = e.pageX - $(this).offset().left;
            }
            if (left < 0) {
                left = 0;
            } else if (left > width) {
                left = width;
            }
            thumb.addClass('active').css('left', left);
        }

        thumb.find('.value').html($(this).val() + "\'");
    });

    $(document).on('mouseup touchend', range_wrapper, function () {
        range_mousedown = false;
        $(this).removeClass('active');
        if (prev_value != $(this).val()) {
            $(this).addClass('changed');
        }
    });

    $(document).on('mousemove touchmove', range_wrapper, function (e) {
        var thumb = $(this).children('.thumb'), left, width = $(this).outerWidth();
        if (range_mousedown) {
            if (!thumb.hasClass('active')) {
                thumb.stop().animate({
                    height: "30px",
                    width: "30px"
                }, 300, "linear");
            }
            if (e.pageX === undefined || e.pageX === null) { //mobile
                left = e.originalEvent.touches[0].pageX - $(this).offset().left;
            } else { // desktop
                left = e.pageX - $(this).offset().left;
            }

            if (left < 0) {
                left = 0;
            } else if (left > width) {
                left = width;
            }
            thumb.addClass('active').css('left', left);
            thumb.find('.value').html(thumb.siblings(range_type).val() + "\'");
        }
    });

    $(document).on('mouseout touchleave', range_wrapper, function () {
        if (!range_mousedown) {

            var thumb = $(this).children('.thumb');

            if (thumb.hasClass('active')) {
                thumb.stop().animate({
                    height: "0px",
                    width: "0px",
                    top: "50%"
                }, {
                    duration: 100
                });
            }
            thumb.removeClass('active');
        }
    });

    $('div#saveConf').click(function (e) {
        var configFile = 'configFile.ini',
            config = ini.parse(fs.readFileSync(configFile, 'utf-8')),
            l_longBreakTime  = $('input[name=longBreakTime]').val() * 60,
            l_shortBreakTime = $('input[name=shortBreakTime]').val() * 60,
            l_pomodoriTime   = $('input[name=workTime]').val() * 60;

        config.time.longBreakTime   =  l_longBreakTime;
        config.time.shortBreakTime  =  l_shortBreakTime;
        config.time.pomodoriTime    =  l_pomodoriTime;

        $('#workTime').text(get2D( $('input[name=workTime]').val() ) + "\'");
        $('#shortBreakTime').text(get2D( $('input[name=shortBreakTime]').val() ) + "\'");
        $('#longBreakTime').text(get2D( $('input[name=longBreakTime]').val() ) + "\'");

        fs.writeFileSync(configFile, ini.stringify(config));
    });
});
