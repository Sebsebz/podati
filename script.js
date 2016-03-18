/*jslint browser: true, node: true*/
/*global $, jQuery, alert, writePomodoro, readPomodoro*/
var ini        = require('ini');
var fs         = require('fs');

var timer;
var refreshPeriod  = 1000;

var pomodoriTime   =   25 * 60;
var shortBreakTime =    5 * 60;
var longBreakTime  =   10 * 60;

var timerFinish  = pomodoriTime;
var timerCurrent = timerFinish;
var timerSeconds;
var bool = false;

var pomodoriNb        = 7;
var pomodoriMaxNb     = 8;
var pomodoriLongBreak = 4;
var currentPomodori   = 1;
var ratioLongBreak = 4;
var isWorkingTime = true;
var state = "pause";

function updatePomodori() {
    'use strict';

    var i;

    for (i = 1; i <= pomodoriNb; i = i + 1) {
        $('span.pomodori' + i)[0].style.visibility = 'visible';
        if (i < currentPomodori) {
            $('span.pomodori' + i).removeClass("fa-circle-o").addClass("fa-circle");
        } else {
            $('span.pomodori' + i).removeClass("fa-circle").addClass("fa-circle-o");
        }
    }

    for (i = pomodoriNb + 1; i <= pomodoriMaxNb; i = i + 1) {
        $('span.pomodori' + i)[0].style.visibility = 'hidden';
    }

    if (currentPomodori > pomodoriNb) {
        currentPomodori = 0;
    }
}

function pomodoriEnd() {
    'use strict';

    var canvas = document.getElementById('myCanvas'),
        context = canvas.getContext('2d'),
        x = canvas.width / 2,
        y = canvas.height / 2,
        radius = 26,
        startAngle = 1.5 * Math.PI,
        endAngle = 360 * Math.PI / 180 + 1.5 * Math.PI,
        counterClockwise = false;

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.beginPath();
    context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
    context.lineWidth = 8;

    // line color
    if (bool === true) {
        if (isWorkingTime) {
            context.strokeStyle = '#18d83d';
        } else {
            context.strokeStyle = '#d81818';
        }
        bool = false;
    } else {
        context.strokeStyle = '#ffffff';
        bool = true;
    }
    context.stroke();
}

function get2D(num) {
    'use strict';

    if (num.toString().length < 2) {// Integer of less than two digits
        return ("0" + num); // Prepend a zero!
    }
    return (num.toString()); // return string for consistency
}

function drawTimer(percent, time) {
    'use strict';
    var displaySec = 0,
        displayMin = 0,
        deg = 360 / 100 * percent,
        canvas  = document.getElementById('myCanvas'),
        context = canvas.getContext('2d'),
        x = canvas.width / 2,
        y = canvas.height / 2,
        radius = 25,
        startAngle = 1.5 * Math.PI,
        endAngle = deg * Math.PI / 180 + 1.5 * Math.PI,
        counterClockwise = false;

    displaySec = (time % 60).toFixed(0);

    if (displaySec === 60) {
        displayMin = (Math.floor((time / 60)) + 1).toFixed(0);
        displaySec = 0;
    } else {
        displayMin = Math.floor((time / 60)).toFixed(0);
    }

    $('.percent').html(get2D(displayMin) + ':' + get2D(displaySec));

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.beginPath();
    context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
    context.lineWidth = 7;

    // line color
    if (isWorkingTime) {
        context.strokeStyle = '#d81818';
    } else {
        context.strokeStyle = '#18d83d';
    }

    context.stroke();

    canvas  = document.getElementById('myCanvas2');
    context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.font = "50px Arial";
    context.fillText(get2D(displayMin) + ':' + get2D(displaySec), 0, 55);

    // line color
    context.strokeStyle = '#198212';
    context.stroke();

}

function timerFunc() {
    'use strict';

    var seconds = 0,
        percent = 0,
        currentTime;

    currentTime = (new Date().getTime());

    switch (state) {
    case "play":

        timerCurrent = timerCurrent - (refreshPeriod / 1000);

        if (timerCurrent <= 0) {

            drawTimer(100, 0);

            $('span#watch')[0].setAttribute("class", 'fa fa-play-circle startstop fa-4x');
            $('span#watch')[0].setAttribute("value", 'Start');

            /// Timer end
            if (isWorkingTime === true) {
                isWorkingTime = false;
                currentPomodori = currentPomodori + 1;
                writePomodoro();
            } else {
                isWorkingTime = true;
            }

            updatePomodori();

            $('span#watch')[0].setAttribute("class", 'fa fa-play-circle startstop fa-4x');
            state = "end";

        } else {
            percent = 100 - (timerCurrent / timerFinish) * 100;
            drawTimer(percent, timerCurrent);
        }

        break;

    case "end":
        if (isWorkingTime) {
            timerFinish  = pomodoriTime;
            timerCurrent = timerFinish;
        } else {
            if ((currentPomodori % (ratioLongBreak + 1)) !== 0) {
                timerFinish  = shortBreakTime;
                timerCurrent = timerFinish;
            } else {
                timerFinish  = longBreakTime;
                timerCurrent = timerFinish;
            }
        }
        drawTimer(0, timerFinish);
        pomodoriEnd();
        break;
            
    case "pause":
        break;

    case "stop":
        $('span#watch')[0].setAttribute("class", 'fa fa-play-circle startstop fa-4x');
        state = "pause";
        break;
    }
}

$(document).ready(function () {
    'use strict';

    readPomodoro();

    var configFile = 'configFile.ini',
        config = ini.parse(fs.readFileSync(configFile, 'utf-8')),
        win = require('nw.gui').Window.get();

    win.setAlwaysOnTop(true);

    longBreakTime  = config.time.longBreakTime;
    shortBreakTime = config.time.shortBreakTime;
    pomodoriTime   = config.time.pomodoriTime;

    $('input[name=longBreakTime]').val(longBreakTime / 60);
    $('input[name=shortBreakTime]').val(shortBreakTime / 60);
    $('input[name=workTime]').val(pomodoriTime / 60);

    $('#workTime').text(get2D($('input[name=workTime]').val()) + "\'");
    $('#shortBreakTime').text(get2D($('input[name=shortBreakTime]').val()) + "\'");
    $('#longBreakTime').text(get2D($('input[name=longBreakTime]').val()) + "\'");

    timerFinish  = pomodoriTime;
    timerCurrent = timerFinish;

    timer = setInterval(function () {
        timerFunc();
    }, refreshPeriod);
    
    
    $('.quit').click(function (e) {
        var win = require('nw.gui').Window.get();
        win.close();
    });

    $('span#watch').click(function (e) {

        switch (state) {
        case "play":
            $('span#watch')[0].setAttribute("class", 'fa fa-play-circle startstop fa-4x');
            state = "pause";
            break;

        case "end":
        case "pause":
        case "stop":
            $('span#watch')[0].setAttribute("class", 'fa fa-pause-circle startstop fa-4x');
            state = "play";
            break;
        }
    });

    $('span#watch').contextmenu(function (e) {

        switch (state) {
        case "play":
        case "end":
        case "pause":
            $('span#watch')[0].setAttribute("class", 'fa fa-stop-circle startstop fa-4x');
            state = "stop";
    
            timerFinish  = pomodoriTime;
            timerCurrent = timerFinish;
            currentPomodori = 0;
            drawTimer(0, timerFinish);
            updatePomodori();
            break;

        case "stop":
            $('span#watch')[0].setAttribute("class", 'fa fa-stop-circle startstop fa-4x');
            state = "stop";
            break;
        }
    });

    $('span#calendar').click(function () {
        $('.datetime').stop().animate({
            right: 0
        }, 200);
        $('.pomodoro').stop().animate({
            right: '-220px'
        }, 200);
    });

    $('span#conf').click(function () {
        $('.config').stop().animate({
            right: 0
        }, 200);
        $('.pomodoro').stop().animate({
            right: '-220px'
        }, 200);
    });

    $('div#pomodoro_config').click(function () {

        config = ini.parse(fs.readFileSync(configFile, 'utf-8'));
        longBreakTime  = config.time.longBreakTime;
        shortBreakTime = config.time.shortBreakTime;
        pomodoriTime   = config.time.pomodoriTime;

        $('.datetime').stop().animate({
            right: '-220px'
        }, 200);
        $('.config').stop().animate({
            right: '-220px'
        }, 200);
        $('.pomodoro').stop().animate({
            right: 0
        }, 200);
    });

    $('div#pomodoro_calheatmap').click(function () {

        config = ini.parse(fs.readFileSync(configFile, 'utf-8'));
        longBreakTime  = config.time.longBreakTime;
        shortBreakTime = config.time.shortBreakTime;
        pomodoriTime   = config.time.pomodoriTime;

        $('.datetime').stop().animate({
            right: '-220px'
        }, 200);
        $('.config').stop().animate({
            right: '-220px'
        }, 200);
        $('.pomodoro').stop().animate({
            right: 0
        }, 200);
    });

    drawTimer(0, timerFinish);

    updatePomodori();
});
