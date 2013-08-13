/**
 * Created with JetBrains WebStorm.
 * User: as
 * Date: 2013-07-09
 * Time: 3:50 AM
 * To change this template use File | Settings | File Templates.
 */

/////////////////////////////////////////////
// STATIC ELEMENTS
/////////////////////////////////////////////

var monthName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var monthDaysLeapYear = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/////////////////////////////////////////////
// HELPERS
/////////////////////////////////////////////

isLeapYear = function(year) {
    if (year % 400 == 0) {
        return true;
    } else if (year % 100 == 0) {
        return false;
    } else if (year % 4 == 0) {
        return true;
    } else {
        return false;
    }
}

getFirstDay = function(month, year) {
    var firstDayString = monthName[month] + " 1, " + String(year);
    var firstDayDate = new Date(firstDayString);
    return firstDayDate.getDay();
}

getNumRows = function(month, year) {
    var firstDay = getFirstDay(month, year);

    if( (firstDay == 6 && monthDays[month] >= 30) ||
        (firstDay == 5 && monthDays[month] == 31) ) {
        return 6;
    } else {
        return 5;
    }
}

buildTableHtml = function(date, month, year, id) {
    var numRows = getNumRows(month, year);

    //top row - arrows and month name
    var tableHtml = '<table cellspacing="0"> <tr class="top-row"> ' +
        '<td class="prev-arrow" id=' + id + '-' + 'prev-arrow' + ' style="cursor:pointer"> < </td> ' +
        '<td colspan="5" class="month-name">' + monthName[month] + ' ' + String(year) + '</td> ' +
        '<td class="next-arrow" id=' + id + '-' + 'next-arrow' + ' style="cursor:pointer"> > </td> ' +
        '</tr>';

    //days row:
    tableHtml += '<tr class="days-names"><td>Su</td><td>Mo</td><td>Tu</td><td>We</td><td>Th</td><td>Fr</td><td>Sa</td></tr>';

    // date rows:
    tableHtml += '<tr>';
    // first row of dates with last month's dates as well
    var weekCounter = 0;
    var firstDay = getFirstDay(month, year);
    var startDatePrevMonth = 0;
    var endDatePrevMonth = 0;

    if(firstDay == 0) {
        startDatePrevMonth = 0;
        endDatePrevMonth = -1;
    } else if (firstDay > 0 && firstDay <= 6) {
        if (month == 0) { // if Jan
            startDatePrevMonth = 31 - firstDay + 1;
            endDatePrevMonth = 31;
        } else if (isLeapYear()) {
            startDatePrevMonth = monthDaysLeapYear[month-1] - firstDay + 1;
            endDatePrevMonth = monthDaysLeapYear[month-1];
        } else {
            startDatePrevMonth = monthDays[month-1] - firstDay + 1;
            endDatePrevMonth = monthDays[month-1];
        }
    } else {
        console.log("ERROR - invalid firstDay: " + String(firstDay));
    }

    for(var i = startDatePrevMonth; i <= endDatePrevMonth; i++) {
        tableHtml += '<td class="prev-month-date">' + i + '</td>'
        weekCounter++;
    }
    i = 1;
    while(weekCounter < 7) {
        if(date == i) {
            tableHtml += '<td class="highlight curr-month-date">' + i + '</td>'
        } else {
            tableHtml += '<td class="curr-month-date">' + i + '</td>'
        }
        i++;
        weekCounter++;
    }

    tableHtml += '</tr>';

    //remaining rows - in the middle
    weekCounter = 0;
    for(var j=0; j < numRows-1; j++) {
        tableHtml += '<tr>';
        while(weekCounter < 7) {
            if( (isLeapYear(year) && (i > monthDaysLeapYear[month])) ||
                (i > monthDays[month]) ) {
                break; // from while loop
            }

            if(date == i) {
                tableHtml += '<td class="highlight curr-month-date">' + i + '</td>'
            } else {
                tableHtml += '<td class="curr-month-date">' + i + '</td>'
            }
            i++;
            weekCounter++;
        }
        if (weekCounter == 7) {
            tableHtml += '</tr>';
            weekCounter = 0;
        }
    }

    //fill last row - with next month's dates
    if ((j == numRows-1) && (weekCounter != 0)) { // j is still at the last row counter, so we broke from while loop, so empty space left
        i = 1;
        while(weekCounter < 7) {
            tableHtml += '<td class="next-month-date">' + i + '</td>'
            i++;
            weekCounter++;
        }
        tableHtml += '</tr>';
    }


    //table end
    tableHtml += '</table>'

    return tableHtml;
}

/////////////////////////////////////////////
// CALENDAR CLASS
/////////////////////////////////////////////

function Calendar(id) {
    this.id = id;

    this.element = document.getElementById(this.id)
    if (this.element == null) {
        console.log("ERROR - no element of such ID: " + this.id)
        return;
    }

    this.date = null;

}

/////////////////////////////////////////////
// CALENDAR PROTOTYPE
/////////////////////////////////////////////

Calendar.prototype = {
    constructor : Calendar,

    show_id : function() {
        console.log(this.id);
    },

    render : function(theDate) {
        this.date = theDate;

        console.log(theDate.toUTCString());
        var date    = theDate.getDate();
        var month   = theDate.getMonth();
        var year    = theDate.getFullYear();

        // construct and insert the table's html
        this.element.innerHTML = buildTableHtml(date, month, year, this.id);

        this.registerEventHandlers();
    },

    registerEventHandlers : function() {
        //console.log(this.element);
        if (!this.element) {
            console.log("ERROR - table not constructed yet");
            return;
        }

        var next_arrow_id = this.id + "-" + "next-arrow";
        var prev_arrow_id = this.id + "-" + "prev-arrow";
        var next_arrow_element = document.getElementById(next_arrow_id);
        var prev_arrow_element = document.getElementById(prev_arrow_id);

        //console.log(next_arrow_element);
        //console.log(prev_arrow_element);

        var obj = this;
        next_arrow_element.onclick = function(event) {
            obj.handleNext(event);
        }

        prev_arrow_element.onclick = function(event) {
            obj.handlePrev(event);
        }

    },

    handleNext : function(event) {
        //console.log("Called next arrow on-click");

        if (!this.date) {
            console.log("ERROR - calendar doesn't have a date yet");
            return;
        }

        var nextMonth = this.date.getMonth() + 1;
        var nextYear = this.date.getFullYear();

        console.log("Next month: " + String(nextMonth));
        if(nextMonth == 12) {
            nextMonth = 0;
            nextYear += 1;
        }

        var nextMonthString = monthName[nextMonth] + " 1, " + String(nextYear);
        this.render(new Date(nextMonthString));
    },

    handlePrev : function(event) {
        //console.log("Called prev arrow on-click");

        if (!this.date) {
            console.log("ERROR - calendar doesn't have a date yet");
            return;
        }

        var prevMonth = this.date.getMonth() - 1;
        var prevYear = this.date.getFullYear();

        console.log("Prev month: " + String(prevMonth));
        if(prevMonth == -1) {
            prevMonth = 11;
            prevYear -= 1;
        }

        var prevMonthString = monthName[prevMonth] + " 1, " + String(prevYear);
        this.render(new Date(prevMonthString));
    }

}

/////////////////////////////////////////////
// DOCUMENT / WINDOW LOAD
/////////////////////////////////////////////

window.onload = function() {
    var calendar = new Calendar("div1");
    calendar.show_id();
    calendar.render(new Date()); // is today's date
    //calendar.registerEventHandlers();

    var calendar2 = new Calendar("div2");
    calendar2.show_id();
    calendar2.render(new Date("January 1, 2009"));
    //calendar2.registerEventHandlers();

}

