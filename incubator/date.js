
/* date time functions */
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
function date(){
    var format = arguments[0];
    var t = (arguments.length==2)?arguments[1]:time();
    var d = new Date();
    //alert(d.getTime());
    //alert( t*1000 )
    d.setTime( t*1000 );
    var result = format;

    function zpad(i) { return (i<0||i>9?"":"0")+i; }

    result=str_replace('Y',d.getFullYear(),result);
    result=str_replace('y',str_right(String(d.getFullYear()),2),result);
    result=str_replace('m',zpad(d.getMonth()+1),result);
    result=str_replace('d',zpad(d.getDate()),result);
    result=str_replace('h',zpad(d.getHours()>12?d.getHours()-12:d.getHours()),result);//00-12
    result=str_replace('H',zpad(d.getHours()),result);//00-24
    result=str_replace('i',zpad(d.getMinutes()),result);
    result=str_replace('s',zpad(d.getSeconds()),result);
    // da fare per ultima per evitare di sovrascrivere valori
    result=str_replace('M',MONTH_NAMES[d.getMonth()],result);
    return result;
}

// Return current UNIX timestamp, secconds
function time(){
    var d = new Date();
    return Math.floor(d.getTime() / 1000);
}
//int mktime ( int hour, int minute, int second, int month, int day, int year [, int is_dst] )
function mktime ( hour, minute, second, month, day, year , is_dst ){
    //month is represented by 0 to 11 with 0=January and 11=December.
    var d = new Date(year, month-1, day, hour, minute, second);
    return Math.floor(d.getTime() / 1000);
}
// strtotime --  Parse about any* English textual datetime description into a UNIX timestamp
function strtotime(val){
    alert(val);
    try {
        // es. var d1 = new Date("October 13, 1975 11:13:00")
        var d = new Date(val);
        if( d ){
            return d.getTime();
        }
    } catch(e){
        alert(e);

    }


    var formats = new Array(
        '%d-%m-%Y', '%d-%m-%y','%d/%m/%Y', '%d/%m/%y', '%m %d', '%m %d, %Y',
        '%Y-%m-%d', '%y-%m-%d','%Y/%m/%d', '%y/%m/%d'
        );
    var d=null;
    for (var i=0; i<formats.length; i++) {
        ts = strformattotime(val, formats[i]);
        if (ts!=0) {
            return ts;
        }
    }
    return false;
}
// format = '%d/%m/%Y'
function is_date(val,format) {
    var ts=strformattotime(val,format);
    if (ts==0) {
        return false;
    }
    return true;
}

function checkdate( month, day, year) {
    month = is_string(month) ? parseInt(str_replace('0','',month)) : month;
    day   = is_string(day  ) ? parseInt(str_replace('0','',day  )) : day  ;
    year  = is_string(year ) ? parseInt(year ) : year ;

    //year is between 1 and 32767 inclusive
    if(year<1 || year >32767 ){ return false;}
    //month is between 1 and 12 inclusive
    if(month<1 || month>12){ return false; }
    //Day is within the allowed number of days for the given month.
    //Leap years are taken into consideration.
    if (day > 31) {
        return false;
    }
    if (month==2) {
        // Check for leap year
        if ( is_leap_year(year) ) {
            if (day > 29) {
                return 0;
            }
        } else {
            if (day > 28) {
                return false;
            }
        }
    }
    if ((month==4)||(month==6)||(month==9)||(month==11)) {
        if (day > 30) {
            return false;
        }
    }
    return true;
}

// format = '%d/%m/%Y'
function compare_dates(d1, f1, d2, f2) {
    var ts1=strformattotime(d1,f1);
    var ts2=strformattotime(d2,f2);
    if (ts1==0) {
        // la prima non � una data valida
        return -1;
    } if (ts2==0) {
        // la seconda non � una data valida
        return -2;
    } else if (ts1 > ts2) {
        // la prima � maggiore
        return 1;
    } else if (ts2 > ts1) {
        // la seconda � maggiore
        return 2;
    } else {
        //date uguali
        return 0;
    }
}

// If the date string matches the format string, it returns the
// unixtimestamp (getTime()) of the date. If it does not match, it returns 0.
var MONTH_NAMES=new Array('January','February','March','April','May','June','July','August','September','October','November','December','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec');
//var DAY_NAMES=new Array('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sun','Mon','Tue','Wed','Thu','Fri','Sat');

// strptime --  Parse a time/date generated with strftime()
// format '%d/%m/%Y'
// come strformattotime, ritorna Date()
function strptime(val, format){
    val=val+"";
    format=format+"";
    var i_val=0;
    var i_format=0;
    //var c="";
    var token="";
    //var token2="";
    var x,y;
    var now=new Date();
    var year=now.getYear();
    var month=now.getMonth()+1;
    var date=1;
    var hh=now.getHours();
    var min=now.getMinutes();
    var ss=now.getSeconds();
    var ampm="";

    function parse_token(str,i,minlength,maxlength) {
        for (var x=maxlength; x>=minlength; x--) {
            var token=str.substring(i,i+x);
            if (token.length < minlength) {
                return null;
            } if (is_numeric(token)) {
                return token;
            }
        }
        return null;
    }

    while (i_format < format.length) {
        /*
        c=format.charAt(i_format);
        token="";
        // gestisce pattern composti di pi� caratteri, da togliere
        while ((format.charAt(i_format)==c) && (i_format < format.length)) {
            token += format.charAt(i_format++);
        }
        */
        token = format.charAt(i_format);
        i_format++;

        // estrai il dato in base alla stringa formato
        if ( token=="Y" || token=="y" ) {
            if ( token=="Y") {
                x=4;
                y=4;
            } else if (token=="y") {
                x=2;
                y=2;
            }
            year=parse_token(val,i_val,x,y);
            if (year==null) {
                return 0;
            }
            i_val += year.length;
            if (year.length==2) {
                if (year > 70) {
                    year=1900+(year-0);
                } else {
                    year=2000+(year-0);
                }
            }
        } else if ( token=="m") {
            month=parse_token(val,i_val,token.length,2);
            if(month==null||(month<1)||(month>12)) {
                return 0;
            }
            i_val+=month.length;
        } else if (token=="M") {
            month=0;
            for (var i=0; i<MONTH_NAMES.length; i++) {
                var month_name=MONTH_NAMES[i];
                if (val.substring(i_val,i_val+month_name.length).toLowerCase()==month_name.toLowerCase()) {
                    //if (token=="M") {
                        month=i+1;
                        if (month>12) {
                            month -= 12;
                        }
                        i_val += month_name.length;
                        break;
                    //}
                }
            }
            //if ((month < 1)||(month>12)) {
            //    return 0;
            //}
        } else if (token=="d") {
            date=parse_token(val,i_val,token.length,2);
            if(date==null||(date<1)||(date>31)) {
                return 0;
            }
            i_val+=date.length;
        } else if (token=="h") {
            hh=parse_token(val,i_val,token.length,2);
            if(hh==null||(hh<1)||(hh>12)) {
                return 0;
            }
            i_val+=hh.length;
        } else if (token=="H") {
            hh=parse_token(val,i_val,token.length,2);
            if(hh==null||(hh<0)||(hh>23)) {
                return 0;
            }
            i_val+=hh.length;
        } else if (token=="i" ) {
            min=parse_token(val,i_val,token.length,2);
            if(min==null||(min<0)||(min>59)) {
                return 0;
            }
            i_val+=min.length;
        } else if (token=="s") {
            ss=parse_token(val,i_val,token.length,2);
            if(ss==null||(ss<0)||(ss>59)) {
                return 0;
            }
            i_val+=ss.length;
        } else if (token=="a") {
            if (val.substring(i_val,i_val+2).toLowerCase()=="am") {
                ampm="AM";
            } else if (val.substring(i_val,i_val+2).toLowerCase()=="pm") {
                ampm="PM";
            } else {
                return 0;
            }
            i_val+=2;
        } else {
            if (val.substring(i_val,i_val+token.length)!=token) {
                return 0;
            } else {
                i_val+=token.length;
            }
        }
    }
    // Correct hours value
    if (hh<12 && ampm=="PM") {
        hh=hh-0+12;
    } else if (hh>11 && ampm=="AM") {
        hh-=12;
    }

    // If there are any trailing characters left in the value, it doesn't match
    if (i_val != val.length) {
        return 0;
    }

    if( !checkdate( month, date, year)){
        return 0;
    }

    return new Date(year,month-1,date,hh,min,ss);
}

// format '%d/%m/%Y'
function strformattotime(val, format) {
    var newdate = strptime(val, format);
    if( newdate != 0 )
        return Math.floor(newdate.getTime() / 1000);
    else
        return 0;
}

function is_leap_year(year){
    if (intYear % 100 == 0) {
        if (intYear % 400 == 0) {
            return true;
        }
    } else {
        if ((intYear % 4) == 0) {
            return true;
        }
    }
    return false;
}
/* end date time */
