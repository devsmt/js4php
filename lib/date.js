/*-- date time functions ---------------------------------------------------*/
// Format a local time/date
/*
a        Lowercase Ante meridiem and Post meridiem        am or pm
A        Uppercase Ante meridiem and Post meridiem        AM or PM
B        Swatch Internet time        000 through 999
d        Day of the month, 2 digits with leading zeros        01 to 31
D        A textual representation of a week, three letters        Mon through Sun
F        A full textual representation of a month, such as January or March        January through December
g        12-hour format of an hour without leading zeros        1 through 12
G        24-hour format of an hour without leading zeros        0 through 23
h        12-hour format of an hour with leading zeros        01 through 12
H        24-hour format of an hour with leading zeros        00 through 23
i        Minutes with leading zeros        00 to 59
I (capital i)        Whether or not the date is in daylights savings time        1 if Daylight Savings Time, 0 otherwise.
j        Day of the month without leading zeros        1 to 31
l (lowercase 'L')        A full textual representation of the day of the week        Sunday through Saturday
L        Whether it's a leap year        1 if it is a leap year, 0 otherwise.
m        Numeric representation of a month, with leading zeros        01 through 12
M        A short textual representation of a month, three letters        Jan through Dec
n        Numeric representation of a month, without leading zeros        1 through 12        O        Difference to Greenwich time (GMT) in hours        Example: +0200
r        RFC 822 formatted date        Example: Thu, 21 Dec 2000 16:01:07 +0200
s        Seconds, with leading zeros        00 through 59
S        English ordinal suffix for the day of the month, 2 characters         st, nd, rd or th. Works well with j
t        Number of days in the given month        28 through 31
T        Timezone setting of this machine        Examples: EST, MDT ...
U        Seconds since the Unix Epoch (January 1 1970 00:00:00 GMT)        See also time()
w        Numeric representation of the day of the week        0 (for Sunday) through 6 (for Saturday)
W        ISO-8601 week number of year, weeks starting on Monday (added in PHP 4.1.0)        Example: 42 (the 42nd week in the year)
Y        A full numeric representation of a year, 4 digits        Examples: 1999 or 2003
y        A two digit representation of a year        Examples: 99 or 03
z        The day of the year        0 through 366
Z        Timezone offset in seconds. The offset for timezones west of UTC is always negative, and for those east of UTC is always positive.        -43200 through 43200
*/
function date() {
    // If the date string matches the format string, it returns the
    // unixtimestamp (getTime()) of the date. If it does not match, it returns 0.
    var MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    //var DAY_NAMES=new Array('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sun','Mon','Tue','Wed','Thu','Fri','Sat');
    var format = arguments[0];
    var t = (arguments.length === 2) ? arguments[1] : time();
    var d = new Date();
    //alert(d.getTime());
    //alert( t*1000 )
    d.setTime(t * 1000);
    var result = format;

    function zpad(i) {
        return (i < 0 || i > 9 ? "" : "0") + i;
    }
    result = str_replace('Y', d.getFullYear(), result);
    result = str_replace('y', str_right(String(d.getFullYear()), 2), result);
    result = str_replace('m', zpad(d.getMonth() + 1), result);
    result = str_replace('d', zpad(d.getDate()), result);
    result = str_replace('h', zpad(d.getHours() > 12 ? d.getHours() - 12 : d.getHours()), result); //00-12
    result = str_replace('H', zpad(d.getHours()), result); //00-24
    result = str_replace('i', zpad(d.getMinutes()), result);
    result = str_replace('s', zpad(d.getSeconds()), result);
    // da fare per ultima per evitare di sovrascrivere valori
    result = str_replace('M', MONTH_NAMES[d.getMonth()], result);
    return result;
}
// Return current UNIX timestamp, secconds

function time() {
    var d = new Date();
    return Math.floor(d.getTime() / 1000);
}
//int mktime ( int hour, int minute, int second, int month, int day, int year [, int is_dst] )

function mktime(hour, minute, second, month, day, year, is_dst) {
    hour = parseInt(hour, 10);
    if (isNaN(hour)) {
        return false;
    }
    minute = parseInt(minute, 10);
    if (isNaN(minute)) {
        return false;
    }
    second = parseInt(second, 10);
    if (isNaN(second)) {
        return false;
    }
    month = parseInt(month, 10);
    if (isNaN(month)) {
        return false;
    }
    day = parseInt(day, 10);
    if (isNaN(day)) {
        return false;
    }
    year = parseInt(year, 10);
    if (isNaN(year)) {
        return false;
    }
    //month is represented by 0 to 11 with 0=January and 11=December.
    // years 0-69 to 2000-2069 and years 70-100 to 1970-2000.
    if (year >= 0) {
        if (year <= 69) {
            year += 2000
        } else if (year <= 100) {
            year += 1900;
        }
    }
    var d = new Date();
    d.setFullYear(year, month - 1, day);
    d.setHours(hour, minute, second);
    return Math.floor(d.getTime() / 1000)/*- (d.getTime() < 0)*/;
}

//strptime --  Parse a time/date generated with strftime()
// // il formato deve essere '%d/%m/%Y'
// ritorna Date()
function strptime(s_date, format) {

    var parsed = strptime._parseDate(s_date, format);
    if (!parsed) {
        return null;
    }
    // create initial date ( year=0 means 1900 )
    var date = new Date(0, 0, 1, 0, 0);
    date.setFullYear(0); // reset to year 0
    if (parsed.Y) {
        date.setFullYear(parsed.Y);
    }
    if (parsed.m) {
        if (parsed.m < 1 || parsed.m > 12) {
            return null;
        }
        //  month indexes start at 0 in javascript
        date.setMonth(parsed.m - 1);
    }
    if (parsed.d) {
        if (parsed.m < 1 || parsed.m > 31) {
            return null;
        }
        date.setDate(parsed.d);
    }
    if (parsed.H) {
        if (parsed.H < 0 || parsed.H > 23) {
            return null;
        }
        date.setHours(parsed.H);
    }
    if (parsed.M) {
        if (parsed.M < 0 || parsed.M > 59) {
            return null;
        }
        date.setMinutes(parsed.M);
    }
    return date;
}

// trasforma format in regexp e le esegue estraendo i dati in un array associativo
// il formato deve essere '%d/%m/%Y'
strptime._parseDate = function (s_date, format) {
    var _DATE_FORMAT_REGXES = {
        'Y': new RegExp('^-?[0-9]+'),
        'd': new RegExp('^[0-9]{1,2}'),
        'm': new RegExp('^[0-9]{1,2}'),
        'H': new RegExp('^[0-9]{1,2}'),
        'M': new RegExp('^[0-9]{1,2}')
    }
    var parsed = {};
    for (var i1=0,i2=0;i1<format.length;i1++,i2++) {
        var c1 = format[i1];
        var c2 = s_date[i2];
        if (c1 == '%') {
            c1 = format[++i1];
            var data = _DATE_FORMAT_REGXES[c1].exec(s_date.substring(i2));
            if (!data.length) {
                return null;
            }
            data = data[0];
            i2 += data.length-1;
            var value = parseInt(data, 10);
            if (isNaN(value)) {
                return null;
            }
            parsed[c1] = value;
            continue;
        }
        if (c1 != c2) {
            return null;
        }
    }
    return parsed;
}


function strformattotime(val, format) {
    var newdate = strptime(val, format);
    if( !empty(newdate) ){
        return Math.floor(newdate.getTime() / 1000);
    } else {
        return 0;
    }
}
//------------------------------------------------------------------------------



// strtotime --  Parse about any* English textual datetime description into a UNIX timestamp

function strtotime(val) {
    var formats = ['d-m-Y', 'd-m-y', 'd/m/Y', 'd/m/y', 'm d', 'm d, Y', 'Y-m-d', 'y-m-d', 'Y/m/d', 'y/m/d'];
    var d = null;
    for (var i = 0; i < formats.length; i++) {
        var ts = strformattotime(val, formats[i]);
        if (ts !== 0) {
            return ts;
        }
    }
    return false;
}

function is_date(val, format) {
    var ts = strformattotime(val, format);
    if (ts === 0) {
        return false;
    }
    return true;
}

function checkdate(month, day, year) {
    month = (is_string(month)) ? parseInt(str_replace('0', '', month)) : month;
    day = (is_string(day)) ? parseInt(str_replace('0', '', day)) : day;
    year = (is_string(year)) ? parseInt(year) : year;
    //year is between 1 and 32767 inclusive
    if (year < 1 || year > 32767) {
        return false;
    }
    //month is between 1 and 12 inclusive
    if (month < 1 || month > 12) {
        return false;
    }
    //Day is within the allowed number of days for the given month.
    //Leap years are taken into consideration.
    if (day > 31) {
        return false;
    }
    if (month === 2) {
        // Check for leap year
        if (is_leap_year(year)) {
            if (day > 29) {
                return 0;
            }
        } else {
            if (day > 28) {
                return false;
            }
        }
    }
    if ((month === 4) || (month === 6) || (month === 9) || (month === 11)) {
        if (day > 30) {
            return false;
        }
    }
    return true;
}

function compare_dates(d1, f1, d2, f2) {
    var ts1 = strformattotime(d1, f1);
    var ts2 = strformattotime(d2, f2);
    if (ts1 === 0) {
        // la prima non è una data valida
        return -1;
    }
    if (ts2 === 0) {
        // la seconda non è una data valida
        return -2;
    } else if (ts1 > ts2) {
        // la prima è maggiore
        return 1;
    } else if (ts2 > ts1) {
        // la seconda è maggiore
        return 2;
    } else {
        //date uguali
        return 0;
    }
}
//strptime --  Parse a time/date generated with strftime()
// ritorna Date()

function strptime(val, format) {
    // generare regexp  apartire dal formato, estrarre le info, rimappare le info ai valori di giorno mese anno
    return new Date(year, month - 1, date, hh, min, ss);
}

function strformattotime(val, format) {
    var newdate = strptime(val, format);
    if (newdate !== 0) {
        return Math.floor(newdate.getTime() / 1000);
    } else {
        return 0;
    }
}

function is_leap_year(year) {
    if (year % 100 === 0) {
        if (year % 400 === 0) {
            return true;
        }
    } else {
        if ((year % 4) === 0) {
            return true;
        }
    }
    return false;
}
// Takes an ISO time and returns a string representing how
// long ago the date represents.

function pretty_date(time) {
    var date = new Date((time || "").replace(/-/g, "/").replace(/[TZ]/g, " "));
    var diff = (((new Date()).getTime() - date.getTime()) / 1000);
    var day_diff = Math.floor(diff / 86400);
    if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31) {
        return;
    }
    return day_diff === 0 && (diff < 60 && "just now" || diff < 120 && "1 minute ago" || diff < 3600 && Math.floor(diff / 60) + " minutes ago" || diff < 7200 && "1 hour ago" || diff < 86400 && Math.floor(diff / 3600) + " hours ago") || day_diff == 1 && "Yesterday" || day_diff < 7 && day_diff + " days ago" || day_diff < 31 && Math.ceil(day_diff / 7) + " weeks ago";
}
//usage:
//    var CurrentDate = new Date();
//    self.alert(DateAdd('s', CurrentDate, 200));

function date_add(date, val, portion) {
    switch (portion) {
        //date portion
    case 'd':
        //add days
        date.setDate(date.getDate() + val)
        break;
    case 'm':
        //add months
        date.setMonth(date.getMonth() + val)
        break;
    case 'y':
        //add years
        date.setYear(date.getFullYear() + val)
        break;
        //time portion
    case 'h':
        //add days
        date.setHours(date.getHours() + val)
        break;
    case 'n':
        //add minutes
        date.setMinutes(date.getMinutes() + val)
        break;
    case 's':
        //add seconds
        date.setSeconds(date.getSeconds() + val)
        break;
    }
    return date;
}
/*
 * Copyright (C) 2004 Baron Schwartz <baron at sequent dot org>
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by the
 * Free Software Foundation, version 2.1.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
 * details.
 */
Date.parseFunctions = {
    count: 0
};
Date.parseRegexes = [];
Date.formatFunctions = {
    count: 0
};
Date.prototype.dateFormat = function(format) {
    if (Date.formatFunctions[format] == null) {
        Date.createNewFormat(format);
    }
    var func = Date.formatFunctions[format];
    return this[func]();
}
Date.createNewFormat = function(format) {
    var funcName = "format" + Date.formatFunctions.count++;
    Date.formatFunctions[format] = funcName;
    var code = "Date.prototype." + funcName + " = function(){return ";
    var special = false;
    var ch = '';
    for (var i = 0; i < format.length; ++i) {
        ch = format.charAt(i);
        if (!special && ch == "\\") {
            special = true;
        } else if (special) {
            special = false;
            code += "'" + String.escape(ch) + "' + ";
        } else {
            code += Date.getFormatCode(ch);
        }
    }
    eval(code.substring(0, code.length - 3) + ";}");
}
Date.getFormatCode = function(character) {
    switch (character) {
    case "d":
        return "String.leftPad(this.getDate(), 2, '0') + ";
    case "D":
        return "Date.dayNames[this.getDay()].substring(0, 3) + ";
    case "j":
        return "this.getDate() + ";
    case "l":
        return "Date.dayNames[this.getDay()] + ";
    case "S":
        return "this.getSuffix() + ";
    case "w":
        return "this.getDay() + ";
    case "z":
        return "this.getDayOfYear() + ";
    case "W":
        return "this.getWeekOfYear() + ";
    case "F":
        return "Date.monthNames[this.getMonth()] + ";
    case "m":
        return "String.leftPad(this.getMonth() + 1, 2, '0') + ";
    case "M":
        return "Date.monthNames[this.getMonth()].substring(0, 3) + ";
    case "n":
        return "(this.getMonth() + 1) + ";
    case "t":
        return "this.getDaysInMonth() + ";
    case "L":
        return "(this.isLeapYear() ? 1 : 0) + ";
    case "Y":
        return "this.getFullYear() + ";
    case "y":
        return "('' + this.getFullYear()).substring(2, 4) + ";
    case "a":
        return "(this.getHours() < 12 ? 'am' : 'pm') + ";
    case "A":
        return "(this.getHours() < 12 ? 'AM' : 'PM') + ";
    case "g":
        return "((this.getHours() %12) ? this.getHours() % 12 : 12) + ";
    case "G":
        return "this.getHours() + ";
    case "h":
        return "String.leftPad((this.getHours() %12) ? this.getHours() % 12 : 12, 2, '0') + ";
    case "H":
        return "String.leftPad(this.getHours(), 2, '0') + ";
    case "i":
        return "String.leftPad(this.getMinutes(), 2, '0') + ";
    case "s":
        return "String.leftPad(this.getSeconds(), 2, '0') + ";
    case "O":
        return "this.getGMTOffset() + ";
    case "T":
        return "this.getTimezone() + ";
    case "Z":
        return "(this.getTimezoneOffset() * -60) + ";
    default:
        return "'" + String.escape(character) + "' + ";
    }
}
Date.parseDate = function(input, format) {
    if (Date.parseFunctions[format] == null) {
        Date.createParser(format);
    }
    var func = Date.parseFunctions[format];
    return Date[func](input);
}
Date.createParser = function(format) {
    var funcName = "parse" + Date.parseFunctions.count++;
    var regexNum = Date.parseRegexes.length;
    var currentGroup = 1;
    Date.parseFunctions[format] = funcName;
    var code = "Date." + funcName + " = function(input){\n" + "var y = -1, m = -1, d = -1, h = -1, i = -1, s = -1;\n" + "var d = new Date();\n" + "y = d.getFullYear();\n" + "m = d.getMonth();\n" + "d = d.getDate();\n" + "var results = input.match(Date.parseRegexes[" + regexNum + "]);\n" + "if (results && results.length > 0) {"
    var regex = "";
    var special = false;
    var ch = '';
    for (var i = 0; i < format.length; ++i) {
        ch = format.charAt(i);
        if (!special && ch == "\\") {
            special = true;
        } else if (special) {
            special = false;
            regex += String.escape(ch);
        } else {
            obj = Date.formatCodeToRegex(ch, currentGroup);
            currentGroup += obj.g;
            regex += obj.s;
            if (obj.g && obj.c) {
                code += obj.c;
            }
        }
    }
    code += "if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0 && s >= 0)\n" + "{return new Date(y, m, d, h, i, s);}\n" + "else if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0)\n" + "{return new Date(y, m, d, h, i);}\n" + "else if (y > 0 && m >= 0 && d > 0 && h >= 0)\n" + "{return new Date(y, m, d, h);}\n" + "else if (y > 0 && m >= 0 && d > 0)\n" + "{return new Date(y, m, d);}\n" + "else if (y > 0 && m >= 0)\n" + "{return new Date(y, m);}\n" + "else if (y > 0)\n" + "{return new Date(y);}\n" + "}return null;}";
    Date.parseRegexes[regexNum] = new RegExp("^" + regex + "$");
    eval(code);
}
Date.formatCodeToRegex = function(character, currentGroup) {
    switch (character) {
    case "D":
        return {
            g: 0,
            c: null,
            s: "(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)"
        };
    case "j":
    case "d":
        return {
            g: 1,
            c: "d = parseInt(results[" + currentGroup + "], 10);\n",
            s: "(\\d{1,2})"
        };
    case "l":
        return {
            g: 0,
            c: null,
            s: "(?:" + Date.dayNames.join("|") + ")"
        };
    case "S":
        return {
            g: 0,
            c: null,
            s: "(?:st|nd|rd|th)"
        };
    case "w":
        return {
            g: 0,
            c: null,
            s: "\\d"
        };
    case "z":
        return {
            g: 0,
            c: null,
            s: "(?:\\d{1,3})"
        };
    case "W":
        return {
            g: 0,
            c: null,
            s: "(?:\\d{2})"
        };
    case "F":
        return {
            g: 1,
            c: "m = parseInt(Date.monthNumbers[results[" + currentGroup + "].substring(0, 3)], 10);\n",
            s: "(" + Date.monthNames.join("|") + ")"
        };
    case "M":
        return {
            g: 1,
            c: "m = parseInt(Date.monthNumbers[results[" + currentGroup + "]], 10);\n",
            s: "(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
        };
    case "n":
    case "m":
        return {
            g: 1,
            c: "m = parseInt(results[" + currentGroup + "], 10) - 1;\n",
            s: "(\\d{1,2})"
        };
    case "t":
        return {
            g: 0,
            c: null,
            s: "\\d{1,2}"
        };
    case "L":
        return {
            g: 0,
            c: null,
            s: "(?:1|0)"
        };
    case "Y":
        return {
            g: 1,
            c: "y = parseInt(results[" + currentGroup + "], 10);\n",
            s: "(\\d{4})"
        };
    case "y":
        return {
            g: 1,
            c: "var ty = parseInt(results[" + currentGroup + "], 10);\n" + "y = ty > Date.y2kYear ? 1900 + ty : 2000 + ty;\n",
            s: "(\\d{1,2})"
        };
    case "a":
        return {
            g: 1,
            c: "if (results[" + currentGroup + "] == 'am') {\n" + "if (h == 12) { h = 0; }\n" + "} else { if (h < 12) { h += 12; }}",
            s: "(am|pm)"
        };
    case "A":
        return {
            g: 1,
            c: "if (results[" + currentGroup + "] == 'AM') {\n" + "if (h == 12) { h = 0; }\n" + "} else { if (h < 12) { h += 12; }}",
            s: "(AM|PM)"
        };
    case "g":
    case "G":
    case "h":
    case "H":
        return {
            g: 1,
            c: "h = parseInt(results[" + currentGroup + "], 10);\n",
            s: "(\\d{1,2})"
        };
    case "i":
        return {
            g: 1,
            c: "i = parseInt(results[" + currentGroup + "], 10);\n",
            s: "(\\d{2})"
        };
    case "s":
        return {
            g: 1,
            c: "s = parseInt(results[" + currentGroup + "], 10);\n",
            s: "(\\d{2})"
        };
    case "O":
        return {
            g: 0,
            c: null,
            s: "[+-]\\d{4}"
        };
    case "T":
        return {
            g: 0,
            c: null,
            s: "[A-Z]{3}"
        };
    case "Z":
        return {
            g: 0,
            c: null,
            s: "[+-]\\d{1,5}"
        };
    default:
        return {
            g: 0,
            c: null,
            s: String.escape(character)
        };
    }
}
Date.prototype.getTimezone = function() {
    return this.toString().replace(/^.*? ([A-Z]{3}) [0-9]{4}.*$/, "$1").replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/, "$1$2$3");
}
Date.prototype.getGMTOffset = function() {
    return (this.getTimezoneOffset() > 0 ? "-" : "+") + String.leftPad(Math.floor(this.getTimezoneOffset() / 60), 2, "0") + String.leftPad(this.getTimezoneOffset() % 60, 2, "0");
}
Date.prototype.getDayOfYear = function() {
    var num = 0;
    Date.daysInMonth[1] = this.isLeapYear() ? 29 : 28;
    for (var i = 0; i < this.getMonth(); ++i) {
        num += Date.daysInMonth[i];
    }
    return num + this.getDate() - 1;
}
Date.prototype.getWeekOfYear = function() {
    // Skip to Thursday of this week
    var now = this.getDayOfYear() + (4 - this.getDay());
    // Find the first Thursday of the year
    var jan1 = new Date(this.getFullYear(), 0, 1);
    var then = (7 - jan1.getDay() + 4);
    document.write(then);
    return String.leftPad(((now - then) / 7) + 1, 2, "0");
}
Date.prototype.isLeapYear = function() {
    var year = this.getFullYear();
    return ((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)));
}
Date.prototype.getFirstDayOfMonth = function() {
    var day = (this.getDay() - (this.getDate() - 1)) % 7;
    return (day < 0) ? (day + 7) : day;
}
Date.prototype.getLastDayOfMonth = function() {
    var day = (this.getDay() + (Date.daysInMonth[this.getMonth()] - this.getDate())) % 7;
    return (day < 0) ? (day + 7) : day;
}
Date.prototype.getDaysInMonth = function() {
    Date.daysInMonth[1] = this.isLeapYear() ? 29 : 28;
    return Date.daysInMonth[this.getMonth()];
}
Date.prototype.getSuffix = function() {
    switch (this.getDate()) {
    case 1:
    case 21:
    case 31:
        return "st";
    case 2:
    case 22:
        return "nd";
    case 3:
    case 23:
        return "rd";
    default:
        return "th";
    }
}
String.escape = function(string) {
    return string.replace(/('|\\)/g, "\\$1");
}
String.leftPad = function(val, size, ch) {
    var result = new String(val);
    if (ch == null) {
        ch = " ";
    }
    while (result.length < size) {
        result = ch + result;
    }
    return result;
}
Date.daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
Date.monthNames = ["January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"];
Date.dayNames = ["Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"];
Date.y2kYear = 50;
Date.monthNumbers = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11
};
Date.patterns = {
    ISO8601LongPattern: "Y-m-d H:i:s",
    ISO8601ShortPattern: "Y-m-d",
    ShortDatePattern: "n/j/Y",
    LongDatePattern: "l, F d, Y",
    FullDateTimePattern: "l, F d, Y g:i:s A",
    MonthDayPattern: "F d",
    ShortTimePattern: "g:i A",
    LongTimePattern: "g:i:s A",
    SortableDateTimePattern: "Y-m-d\\TH:i:s",
    UniversalSortableDateTimePattern: "Y-m-d H:i:sO",
    YearMonthPattern: "F, Y"
};
/*
converte una stringa contentente l'unità di misura in un numero
    str_to_ms('2d')      // 172800000
    str_to_ms('1.5h')    // 5400000
    str_to_ms('1h')      // 3600000
    str_to_ms('1m')      // 60000
    str_to_ms('5s')      // 5000
    str_to_ms('500ms')   // 500
    str_to_ms('100')     // 100
    str_to_ms(100)       // 100
*/
function str_to_ms(str) {
    var r = /(\d*.?\d+)([mshd]+)/;
    var conv_tbl = {};
    conv_tbl.ms = 1;
    conv_tbl.s = 1000;
    conv_tbl.m = conv_tbl.s * 60;
    conv_tbl.h = conv_tbl.m * 60;
    conv_tbl.d = conv_tbl.h * 24;
    if (str == Number(str)) {
        return Number(str);
    }
    r.exec(str.toLowerCase());
    return RegExp.$1 * conv_tbl[RegExp.$2];
}