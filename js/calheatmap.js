/*jslint browser: true, node: true*/
/*global $, jQuery, alert, get2D*/
var fs  = require('fs');

/**
 * Get the ISO week date week number
 */
Date.prototype.getWeek = function () {
    'use strict';

    // Create a copy of this date object
    var target  = new Date(this.valueOf()),  // Create a copy of this date object
        dayNr   = (this.getDay() + 6) % 7,  // ISO week date weeks start on monday, so correct the day number
        jan4,
        dayDiff;

    // Set the target to the thursday of this week so the
    // target date is in the right year
    target.setDate(target.getDate() - dayNr + 3);

    // ISO 8601 states that week 1 is the week with january 4th in it
    jan4    = new Date(target.getFullYear(), 0, 4);

    // Number of days between target date and january 4th
    dayDiff = (target - jan4) / 86400000;

    if (new Date(target.getFullYear(), 0, 4).getDay() < 5) {
        // Calculate week number: Week 1 (january 4th) plus the
        // number of weeks between target date and january 4th
        return Math.ceil(dayDiff / 7) - 1;
    } else {  // jan 4th is on the next week (so next week is week 1)
        return Math.ceil(dayDiff / 7);
    }
};


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
        dateKey = myDate.getFullYear() + "/" + (myDate.getMonth() + 1) + "/" + myDate.getDate();
        if (typeof dbPomodoro[dateKey] !== 'undefined') {
            if (dbPomodoro[dateKey] > 0 && dbPomodoro[dateKey] < 3) {
                heatmap = "v1";
            } else if (dbPomodoro[dateKey] >= 3 && dbPomodoro[dateKey] < 6) {
                heatmap = "v2";
            } else if (dbPomodoro[dateKey] >= 3 && dbPomodoro[dateKey] < 6) {
                heatmap = "v3";
            } else if (dbPomodoro[dateKey] >= 6 && dbPomodoro[dateKey] < 9) {
                heatmap = "v4";
            } else if (dbPomodoro[dateKey] >= 9 && dbPomodoro[dateKey] < 12) {
                heatmap = "v5";
            } else if (dbPomodoro[dateKey] >= 12) {
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

function readPomodoro() {
    'use strict';

    var dbPomodoro;

    $.ajax({
        url: './pomodoro.json',
        dataType: 'json',
        success: function (dbPomodoro) {
            updateCalHeatMap(dbPomodoro);
        },
        error: function (dbPomodoro) {
        }
    });
}

function writePomodoro() {
    'use strict';

    var dbPomodoro;

    $.ajax({
        url: './pomodoro.json',
        dataType: 'json',
        success: function (dbPomodoro) {
            var today   = new Date(),
                dateKey =          today.getFullYear()
                          + "/" + (today.getMonth() + 1)
                          + "/" + today.getDate();

            if (typeof dbPomodoro[dateKey] !== 'undefined') {
                dbPomodoro[dateKey] = dbPomodoro[dateKey] + 1;
            } else {
                dbPomodoro[dateKey] = 1;
            }

            fs.writeFile("./pomodoro.json",
                         JSON.stringify(dbPomodoro, null, 4), function (err) {
                    if (err) {
                        return console.log(err);
                    }

                    console.log("The file was saved!");
                });

            updateCalHeatMap(dbPomodoro);
        },
        error: function (dbPomodoro) {
        }
    });
}
