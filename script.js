/*jslint browser: true*/
/*global $, jQuery, alert*/

var ini        = require('ini');
var fs         = require('fs');

var timer;
var timer2;

var timerCurrent;
var timerFinish;
var timerSeconds;
var bool = false;

var pomodoriTime   =   25 * 60;
var shortBreakTime =    5 * 60;
var longBreakTime  =   10 * 60;

var pomodoriNb        = 7;
var pomodoriMaxNb     = 8;
var pomodoriLongBreak = 4;
var currentPomodori   = 1;
var ratioLongBreak = 4;
var isWorkingTime = true;


/**
 * Returns the week number for this date.  dowOffset is the day of week the week
 * "starts" on for your locale - it can be from 0 to 6. If dowOffset is 1 (Monday),
 * the week returned is the ISO 8601 week number.
 * @param int dowOffset
 * @return int
 */
/*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.epoch-calendar.com */
Date.prototype.getWeek = function (dowOffset) {
    'use strict';

    dowOffset = typeof (dowOffset) === 'int' ? dowOffset : 0; //default dowOffset to zero

    var newYear   = new Date(this.getFullYear(), 0, 1),
        day       = newYear.getDay() - dowOffset, //the day of week the year begins on
        daynum    = Math.floor((this.getTime() - newYear.getTime() -
             (this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1,
        weeknum   = 0,
        nYear     = 0,
        nday      = 0;

    day = (day >= 0 ? day : day + 7);
    
    //if the year starts before the middle of a week
    if (day < 4) {
        weeknum = Math.floor((daynum + day - 1) / 7) + 1;
        if (weeknum > 52) {
            nYear = new Date(this.getFullYear() + 1, 0, 1);
            nday = nYear.getDay() - dowOffset;
            nday = nday >= 0 ? nday : nday + 7;
            /*if the next year starts before the middle of
              the week, it is week #1 of that year*/
            weeknum = nday < 4 ? 1 : 53;
        }
    } else {
        weeknum = Math.floor((daynum + day - 1) / 7);
    }
    return weeknum;
};


function readPomodoro() {

    var dbPomodoro;

  $.ajax({
    url: './pomodoro.json',
    dataType: 'json',
    success: function( dbPomodoro ) {
        updateCalHeatMap(dbPomodoro);
    },
    error: function( dbPomodoro ) {
    }
  });
}


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

function stopWatch() {
    'use strict';
    var seconds = 0,
        percent = 0,
        a_window;

    seconds = (timerFinish - (new Date().getTime())) / 1000;

    if (seconds <= 0) {
        //drawTimer(100, pomodoriTime);
        clearInterval(timer);

        $('span#watch')[0].setAttribute("class", 'fa fa-play-circle startstop fa-4x');
        $('span#watch')[0].setAttribute("value", 'Start');

        timer2 = setInterval(function () {
            pomodoriEnd();
        }, 500);

        /// Timer end
        if (isWorkingTime === true) {
            isWorkingTime = false;
            currentPomodori = currentPomodori + 1;
        } else {
            isWorkingTime = true;
        }

        updatePomodori();

    } else {
        percent = 100 - ((seconds / timerSeconds) * 100);
        drawTimer(percent, seconds);
    }
}

function updateCalHeatMap(dbPomodoro) {
    'use strict';

    var dayString   = ["sun", "mon",
                       "tue", "wed",
                       "thu", "fri",
                       "sat"],
        monthString = ["jan", "feb", "mar",
                       "apr", "may", "jun",
                       "jul", "aug", "sep",
                       "oct", "nov", "dec"],
        today   = new Date(),
        endDate = new Date(),
        myDate  = new Date(),
        i       = 0,
        week    = 0,
        weekNb  = 0,
        month   = 0,
        dateKey = "",
        heatmap = "",
        pomodoroNb = 0;

    myDate.setMonth(today.getMonth() - 1);
    myDate.setDate(1);

    endDate.setMonth(today.getMonth() + 2);
    endDate.setDate(1);

    do {
        if (myDate.getDate() === 1) {
            month = monthString[myDate.getMonth()];
            document.getElementById("calheatmap").innerHTML +=
                '<div class="month" style="left:' +
                11 * (week + 3) +
                'px">' + month + '</div>';


            week = week + 1;
        }

        heatmap    = "";
        pomodoroNb = 0;
        dateKey = myDate.getFullYear() + "/" + (myDate.getMonth() + 1) + "/" + myDate.getDate() 
        if (typeof dbPomodoro[dateKey] != 'undefined') {
            if(dbPomodoro[dateKey] > 0 && dbPomodoro[dateKey] < 3 ) {
                heatmap = "v1";
            } else if (dbPomodoro[dateKey] >= 3 && dbPomodoro[dateKey] < 6) {
                heatmap = "v2";
            } else if (dbPomodoro[dateKey] >= 3 && dbPomodoro[dateKey] < 6) {
                heatmap = "v3";
            } else if (dbPomodoro[dateKey] >= 6 && dbPomodoro[dateKey] < 9) {
                heatmap = "v4";
            }  else if (dbPomodoro[dateKey] >= 9 && dbPomodoro[dateKey] < 12) {
                heatmap = "v5";
            }  else if (dbPomodoro[dateKey] >= 12) {
                heatmap = "v6";
            }
            pomodoroNb = dbPomodoro[dateKey];
        }
        
        document.getElementById("calheatmap").innerHTML +=
            '<div class="day ' + dayString[myDate.getDay()] +
            " " + heatmap + " " +
            (today.getTime() === myDate.getTime() ? " today " : "") +
            '" style="left:' + 11 * week + 'px" title="' +
            myDate.getDate() + " " +
            monthString[myDate.getMonth()] + " " +
            myDate.getFullYear() + " : " + pomodoroNb +
            '"></div>';


        myDate.setDate(myDate.getDate() + 1);

        if (myDate.getDay() === 1) {
            weekNb = myDate.getWeek();
            document.getElementById("calheatmap").innerHTML +=
                '<div class="week" style="left:' + 11 * week +
                'px;color:' + (weekNb % 2 ? "red" : "blue") + '">' +
                get2D(weekNb) + '</div>';

            week = week + 1;
        }

    } while (myDate.getTime() < endDate.getTime());
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

    $('div#saveConf').click(function (e) {
        longBreakTime  = $('input[name=longBreakTime]').val() * 60;
        shortBreakTime = $('input[name=shortBreakTime]').val() * 60;
        pomodoriTime   = $('input[name=workTime]').val() * 60;

        config.time.longBreakTime   = longBreakTime;
        config.time.shortBreakTime  = shortBreakTime;
        config.time.pomodoriTime    = pomodoriTime;

       fs.writeFileSync(configFile, ini.stringify(config));
    });

    $('.quit').click(function(e) {
        var win = require('nw.gui').Window.get();
        win.close();
    });

    $('span#watch').click(function (e) {
        var timerValue = 0;

        if (isWorkingTime) {
            timerValue = pomodoriTime;
        } else {
            if (currentPomodori % (ratioLongBreak + 1)) {
                timerValue = shortBreakTime;
            } else {
                timerValue = longBreakTime;
            }
        }

        e.preventDefault();
        if ($('span#watch')[0].getAttribute("value") === 'Start') {
            $('span#watch')[0].setAttribute("value", 'Stop');
            $('span#watch')[0].setAttribute("class", 'fa fa-stop-circle-o startstop fa-4x');
            timerSeconds = timerValue;
            timerCurrent = 0;
            timerFinish = new Date().getTime() + (timerSeconds * 1000);
            timer = setInterval(function () {
                stopWatch();
            }, 50);

            clearInterval(timer2);
            drawTimer(0, timerValue);

        } else if ($('span#watch')[0].getAttribute("value") === 'Stop') {

            $('span#watch')[0].setAttribute("value", 'Start');
            $('span#watch')[0].setAttribute("class", 'fa fa-play-circle-o fa-4x startstop fa-4x');
            clearInterval(timer);

        } else if ($('span#watch')[0].getAttribute("value") === 'Pause') {

            $('span#watch')[0].setAttribute("value", 'Stop');
            $('span#watch')[0].setAttribute("class", 'fa fa-stop-circle-o fa-4x startstop fa-4x');
            timer = setInterval(function () {
                stopWatch();
            }, 50);
        }
    });

    $('span#watch').dblclick(function (e) { });

    $('span#watch').contextmenu(function (e) {
        if ($('span#watch')[0].getAttribute("value") === 'Stop') {
            $('span#watch')[0].setAttribute("value", 'Pause');
            $('span#watch')[0].setAttribute("class", 'fa fa-pause-circle-o fa-4x startstop fa-4x');
            clearInterval(timer);
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

    $('span#pomodoro').click(function () {
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

    $('span#watch').click();

    drawTimer(0, pomodoriTime);

    updatePomodori();
});
