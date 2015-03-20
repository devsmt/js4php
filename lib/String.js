/*
string substr  ( string $string  , int $start  [, int $length  ] )
Returns the portion of string specified by the start and length parameters.
*/
function substr(s, start, len) {
    s += '';
    if (start < 0) {
        start += s.length;
    }
    if (len === undefined) {
        len = s.length;
    } else if (len < 0) {
        len += s.length;
    } else {
        len += start;
    }
    if (len < start) {
        len = start;
    }
    return s.substring(start, len);
}
/*
Quote string with slashes
*/
function addslashes(s) {
    return str_replace('"', '\\"', str_replace("'", '\\' + "'", s));
}
// Split a string by string

function explode(sep, str) {
    return str.split(sep);
}
// Join array elements with a string
// string implode ( string glue, array pieces )

function implode(sep, a) {
    if (is_array(a)) {
        return a.join(sep);
    } else {
        var r = '';
        for (var i in a) {
            if (i > 0) {
                r += ', ';
            }
            r += a[i];
        }
        return r;
    }
}
// Convert all applicable characters to HTML entities

function htmlentities(s) {
    var div = document.createElement('div');
    var text = document.createTextNode(s);
    div.appendChild(text);
    return div.innerHTML;
}
// Formats a number as a currency string
//function money_format(){ }
// Inserts HTML line breaks before all newlines in a string

function nl2br(s) {
    return str_replace("\n", "<br \/>\n", s);
}
// Format a number with grouped thousands
//function number_format(){ }
// Return ASCII value of character, inefficient, but it works..

function ord(c) {
    c = c.charAt(0);
    // loop through all possible ASCII values
    for (var i = 0; i < 256; ++i) {
        // convert i into a 2-digit hex string
        var h = i.toString(16);
        if (h.length == 1) {
            h = "0" + h;
        }
        // insert a % character into the string
        h = "%" + h;
        // determine the character represented by the escape code
        h = unescape(h);
        // if the characters match, we've found the ASCII value
        if (h == c) {
            break;
        }
    }
    return i;
}
//chr -- Return a specific character

function chr(i) {
    return String.fromCharCode(i);
}
// Pad a string to a certain length with another string
// string str_pad ( string input, int pad_length [, string pad_string [, int pad_type]
STR_PAD_RIGHT = 1;
STR_PAD_LEFT = 2;
STR_PAD_BOTH = 3;
// pad_type default: STR_PAD_RIGHT.

function str_pad(str, len, ps, t) {
    function make_str(s, len) {
        var tmp_s = '';
        for (var i = 0; i < len; i++) {
            tmp_s += s;
        }
        return tmp_s;
    }
    t = t ? t : STR_PAD_RIGHT;
    if (t == STR_PAD_RIGHT) {
        return str + make_str(ps, len - strlen(str));
    } else if (t == STR_PAD_LEFT) {
        return make_str(ps, len - strlen(str)) + str;
    } else if (t == STR_PAD_BOTH) {
        var tmp_len = Math.floor((len - strlen(str)) / 2);
        var tmp_s = make_str(ps, tmp_len) + str + make_str(ps, tmp_len);
        //se il numero di caratteri e' stato arrotondato restituisco comunque una stringa della lunghezza giusta
        return str_pad(tmp_s, len, ps, 1);
    } else {
        // lamentati che non e' possiblie chiamere la funzione con un parametro diverso da quelli previsti
        return false;
    }
}
// Replace all occurrences of the search string with the replacement string
// str_replace ( mixed search, mixed replace, mixed subject [, int &count] )

function str_replace(s_s, s_r, s) {
    var r = new String(s);
    return r.split(s_s).join(s_r);
}
// replace, case insensitive

function str_ireplace(s_s, s_r, s) {
    var r = new String(s);
    return s.replace(new RegExp(s_s, 'gi'), s_r);
}
// Binary safe string comparison
//function strcmp(){ }
// Strip HTML tags from a string

function strip_tags(s) {
    var r = new String(s);
    return r.replace(new RegExp('<\/?[^>]+>', 'gi'), '');
}
// Un-quote string quoted with addslashes()

function stripslashes(s) {
    return str_replace("\\'", "'", s);
}
// Get string length

function strlen(s) {
    return s.length;
}
// Find position of first occurrence of a string

function strpos(s, subs, offset) {
    var i = s.indexOf(subs, (offset ? offset : 0)); // returns -1
    return i >= 0 ? i : false;
}
// Find position of first occurrence of a string CaseInsesitive

function stripos(s, sub) {
    var i = s.toLowerCase().lastIndexOf(sub.toLowerCase()); // returns -1
    return i >= 0 ? i : false;
}
// Make a string lowercase

function strtolower(s) {
    return s.toLowerCase();
}
// Make a string uppercase

function strtoupper(s) {
    return s.toUpperCase();
}
// Count the number of substring occurrences
// questa implementazione va in loop

function substr_count(s, subs) {
    var c = 0;
    var pos = s.length;
    var i = 0;
    while ((i >= 0) && (pos <= s.length)) {
        i = s.lastIndexOf(subs, pos);
        if (i > 0) {
            pos = i - 1;
            c++;
        } else if (i === 0) {
            c++;
            break;
        } else {
            break;
        }
    }
    return c;
}
// Strip whitespace from thea string (beginning and end by default)
// RIGHT = 1
// LEFT = 2
// BOTH. = 3

function trim(s, t) {
    t = t ? t : 3;
    switch (t) {
    case 1:
        return s.replace(/\W+$/, '');
    case 2:
        return s.replace(/^\W+/, '');
    case 3:
        return (s.replace(/^\W+/, '')).replace(/\W+$/, '');
    }
}
// Make a string's first character uppercase

function ucfirst(s) {
    var f = s.charAt(0).toUpperCase();
    return f + s.substr(1, s.length - 1);
}
// Uppercase the first character of each word in a string

function ucwords(s) {
    var a = explode(' ', s);
    var r = '';
    for (var i = 0; i < count(a); i++) {
        r += ' ' + ucfirst(a[i]);
    }
    return trim(r);
}
// Wraps a string to a given number of characters using a string break character.
// function wordwrap(s){ }

function str_repeat(s, i) {
    var a = new Array(++i);
    return a.join(s);
}

function str_left(s, ln) {
    //var r = new String(s);
    return s.substr(0, ln);
}

function str_right(s, i) {
    // assert(is_string(s), 'string', 'str_right');
    // assert(is_int(i), 'int', 'str_right');
    var ln = s.length;
    if (i <= ln) {
        return s.substr(ln - i, i);
    } else {
        return s; //i+' >'+ ln;
    }
}
// sub e' contenuta in s?

function str_match(s, sub) {
    return s.toLowerCase().indexOf(sub.toLowerCase()) >= 0;
}

// minimalistic template engine
// Str.Format('tempalte {0}', ['test']);
// Str.Format('tempalte {test}', {test: 'test2' });
// pattern "{var}"
var Str = {
    Format: function() {
        var num = arguments.length;
        var oStr = arguments[0];
        var pattern, re;
        if ( arguments[1] instanceof Array ) {
            for (var i = 0; i < num; i++) {
                pattern = "\\{" + (i) + "\\}";
                re = new RegExp(pattern, "g");
                oStr = oStr.replace(re, arguments[1][i]);
            }
        } else if( typeof arguments[1] === 'object' ) {
            for (var k in arguments[1]) {
                pattern = "\\{" + k + "\\}";
                re = new RegExp(pattern, "g");
                oStr = oStr.replace(re, arguments[1][k]);
            }
        } else {
            return "Format error";
        }
        return oStr;
    }
};
// alias. il formato dei parametri è piuttosto diverso dalla printf originale
var sprintf = Str.Format;


// s, len, reminder
function str_reminder(str) {
    var len = arg_init(arguments, 1, 20);
    var reminder = arg_init(arguments, 2, '...');
    var str_len = strlen(strip_tags(str));
    var reminder_len = strlen(strip_tags(reminder));
    if (str_len > len) {
        return str_left(str, len - reminder_len) + reminder;
    } else {
        return str;
    }
}

function str_rm_diacritics(str) {
    // hash "lettera latina" => regexp char group da sostituire
    var DIACRITICS = {
        'a': '[aÀÁÂÃÄÅàáâãäåĀā]',
        'c': '[cÇçćĆčČ]',
        'd': '[dđĐďĎ]',
        'e': '[eÈÉÊËèéêëěĚĒē]',
        'i': '[iÌÍÎÏìíîïĪī]',
        'n': '[nÑñňŇ]',
        'o': '[oÒÓÔÕÕÖØòóôõöøŌō]',
        'r': '[rřŘ]',
        's': '[sŠš]',
        't': '[tťŤ]',
        'u': '[uÙÚÛÜùúûüůŮŪū]',
        'y': '[yŸÿýÝ]',
        'z': '[zŽž]'
    };
    var str_escape = function(str) {
        return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
    };
    var str_result = str_escape(str);
    for (letter in DIACRITICS) {
        if (DIACRITICS.hasOwnProperty(letter)) {
            var dia_regex = DIACRITICS[letter];
            str_result = str_result.replace(new RegExp(dia_regex, 'g'), letter);
        }
    }
    return str_result;
}

function escape_html(str) {
    return (str + '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
};