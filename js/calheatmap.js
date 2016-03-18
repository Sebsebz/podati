/*jslint browser: true, node: true*/
/*global $, jQuery, alert, get2D*/
var fs  = require('fs');

/**
 * Get the ISO week date week number
 */
Date.prototype.getWeek = function () {
    'use strict';

    // Create a copy of this date object
    var target  = new Date(this.valueOf()),
        dayNr   = (this.getDay() + 6) % 7,
        firstThursday;

    // ISO 8601 states that week 1 is the week
    // with the first thursday of that year.
    // Set the target date to the thursday in the target week
    target.setDate(target.getDate() - dayNr + 3);

    // Store the millisecond value of the target date
    firstThursday = target.valueOf();

    // Set the target to the first thursday of the year
    // First set the target to january first
    target.setMonth(0, 1);
    // Not a thursday? Correct the date to the next thursday
    if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }

    // The weeknumber is the number of weeks between the
    // first thursday of the year and the thursday in the target week
    return 1 + Math.ceil((firstThursday - target) / 604800000); // 604800000 = 7 * 24 * 3600 * 1000
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
