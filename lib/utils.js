// IE console emulation

if (typeof window.console == 'undefined') {
    window.console = {
        log: function(msg) {
            if (window.location.href.indexOf("debug=true") > 0) {
                alert(msg);
            }
        },
        debug: function(v) {
            console.log(json_encode(v));
        }
    };
}



function set_error_handler(){
    function log_error_console(m) {
        console.debug(m);
    }
    function log_error_logger(m) {
            log_error.div = document.getElementById('logger');
            if (!div) {
                log_error.div = document.createElement('div');
                log_error.div.setAttribute('id', 'logger');
                document.body.appendChild(log_error.div);
            }
            echo(log_error.div, m);
        //------------------------------------------------------------------------------
        // Output one or more strings, to body if first argument is not an element

        function echo() {
            var s = '';
            // arguments.length===1?1:2
            for (var i = is_string(arguments[0]) ? 0 : 1;
                i < arguments.length; i++) {
            s += arguments[i];
                }
                var div = document.createElement('div');
                div.setAttribute('id', 'echo_' + echo.count);
                document.body.appendChild(div);
                div.innerHTML = s;
                echo.count++;
                return div;
        }
        echo.count = 0;
    }
    function log_error_jq(message, url, line) {
        var details = url + ':' + line + '\n\n' + message;
        $.ajax({
                type: 'POST',
                url: '/1ogger/errors',
                data: JSON.stringify({context: navigator.userAgent, details: details}),
                contentType: 'application/json; charset=utf-8'
        });
        // Just let default handler run.
        return false;
    }
    function log_error_xhr(message, url, line) {
        if (window.XMLHttpRequest) {

            var xhr = new XMLHttpRequest();
            var scripturl = '/1ogger/errors';
            var log = line + message + url;
            xhr.open("POST", scripturl);
            xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
            xhr.send(log);
        }
        // Just let default handler run.
        return false;
    }
    function log_error_dom(message, url, line) {
        var errorbox = document.createElement("div");
        errorbox.className = 'fancyerror';
        errorbox.innerHTML = 'JS: <span class="errmsg"' + message.replace('<', '&lt;').replace('>', '&gt;') + '</span><br>line number: ' + line + '<br>located: ' + url;
        document.body.appendChild(errorbox);
        // Just let default handler run.
        return false;
    }
    function log_error_alert(message, url, line) {
        alert("JavaScript error: " + message + " on line " + line + " for " + url);
        // Just let default handler run.
        return false;
    }

    // stabilisce quale error log usare di default
    if (typeof window.console != 'undefined' && typeof window.console.debug != 'undefined') {
        window.log_error = log_error_console;
    } else {
        window.log_error = log_error_alert;
    }

    /*
    browsers supporting onerror:
    Chrome 13+
    Firefox 6.0+
    Internet Explorer 5.5+
    Opera 11.60+
    Safari 5.1+
    */
    window.onerror = function(message, file, line) {
        return window.log_error(message, file, line);
    };
}
set_error_handler();

//------------------------------------------------------------------------------
// TODO: occorre anche sapere esattamente quale assertion fallisce e perché.

function AssertException(message) {
    this.message = message;
}
AssertException.prototype.toString = function() {
    return 'AssertException: ' + this.message;
};
// you may also check whether an exception is an assertion exception by using the following snippet:
//  try {  }  catch (e) {
//    if (e instanceof AssertExcept ion) {
//    }
//  }

function assert(expr, msg) {
    if (!msg) {
        throw new AssertException('assert statement called with empty Message parameter');
    }
    var expr = typeof(expr) == 'function' ? expr() : expr;
    if (!expr) {
        throw new AssertException(msg);
    }
    return true;
}
/*-------------------------------------------------------------------------------------------------------
function(myarg){
var args=[]; args = Array.prototype.slice.call(arguments, 1);
}
 */
// inizilaizza un argomento di una funzione a un valore predefinito se non presente

function arg_init(args, pos, def) {
    return ((args.length > pos) ? (args[pos]) : (def));
}

function obj_var_init(obj, prop, def) {
    if (typeof obj == 'undefined') {
        obj = {};
    }
    if (typeof obj[prop] == 'undefined') {
        obj[prop] = def;
    }
    return obj;
}
/*
var opt = obj_vars_init({name: default}, popt);
*/
function obj_vars_init(defaults, popt) {
    // parametri passati
    popt = popt || {};
    // parametri di default
    // parametri finali
    var opt = {};
    var k;
    // copia tutti i parametri passati
    for (k in popt) {
        opt[k] = popt[k] || defaults[k];
    }
    // copia ogni altro ulteriore parametro nei defaults
    for (k in defaults) {
        if (!opt[k]) {
            opt[k] = popt[k] || defaults[k];
        }
    }
    return opt;
}

function xor(a, b) {
    return (a && !b) || (!a && b);
}
//-------------------------------------------------------------------------------------------------------------------

function unset(v) {
    delete v;
}
// variable handling functions
/*
// BAD: This will cause an error in code when foo is undefined
if (foo) { }

// GOOD: This doesn't cause any errors. However, even when
// foo is set to NULL or false, the condition validates as true
if (typeof foo != "undefined") {
    doSomething();
}

// BETTER: This doesn't cause any errors and in addition
// values NULL or false won't validate as true
if (window.foo) {
    doSomething();
}
*/
function isset(v) {
    return ((typeof(v) == 'undefined' || v === null) ? false : true);
}

function is_null(v) {
    return (v === null);
}
// Determine whether a variable has a value

function empty(v) {
    if (typeof v == 'object') {
        for (var k in v) {
            // evita di ciclare le propriet� ereditate via prototype chain
            if (v.hasOwnProperty(k)) {
                return false;
            }
        }
        return true;
    }
    return (v === '' || v === 0 || v === '0' || v === null || v === false || v === undefined);
}
// Get the type of a variable
//function gettype(v){ return typeof(v);}
/*
usage:
    is_a('mystr', String);
*/
function is_a(who, what) {
    // only undefined and null
    // return always false
    if (who == null) {
        return false;
    }
    return (who instanceof what);
};
// Finds whether a variable is an array

function is_array(v) {
    if (v instanceof Array) {
        return true;
    }
    if (is_object(v)) {
        for (k in v) {
            if (is_function(v[k])) {
                return false;
            }
        }
        return true;
    }
    return false;
}
// Finds whether a variable is a string

function is_string(v) {
    return (typeof(v) == 'string');
}
// detrimina se � un tipo numerico(int,float) o una stringa che lo rappresenta

function is_numeric(v) {
    if (typeof(v) == 'number') {
        return true;
    } else if (typeof(v) == 'string') {
        var digits = "1234567890.";
        for (var i = 0; i < v.length; i++) {
            if (digits.indexOf(v.charAt(i)) == -1) {
                return false;
            }
        }
        // controlla che sia passato un solo punto
        return (substr_count(v, '.') <= 1);
    } else {
        return false;
    }
}
//is_float -- Finds whether a variable is a float

function is_float(v) {
    if (is_numeric(v)) {
        if (is_int(v)) {
            return false;
        } else {
            return true;
        }
    } else {
        return false;
    }
}
//is_int -- Find whether a variable is an integer
// note: non gestiscono correttamente valori come "1.0"

function is_int(v) {
    if (is_numeric(v)) {
        s = '' + v;
        return (v - Math.floor(v) === 0);
    } else {
        return false;
    }
}
//is_integer -- Alias of is_int()

function is_integer(v) {
    return is_int(v);
}
//is_object -- Finds whether a variable is an object

function is_object(v) {
    //One of the quirks of JavaScript is that typeof null returns "object". But it’s not an object. So let’s check for that, too
    return (v instanceof Object && v.toString() == '[object Object]');
}

function is_function(v) {
    // todo: manage str funcion name instead of funcion reference
    return (typeof(v) == "function");
}
// get_defined_functions --  Returns an array of all defined functions
//var myVar   = "3.14159",

function setType(myVar, type) {
    switch (type) {
    case 'str':
    case 'string':
        return "" + myVar; //  to string
    case 'int':
        return ~~myVar; //  to integer
    case 'float':
        return 1 * myVar; //  to float
    case 'bool':
        return !!myVar;/*  to boolean - any string with length  and any number except 0 are true */
    case 'array':
        return [myVar]; //  to array
    }
}
// cast operations
// (int), (integer) - cast to integer

function as_int(v) {
    return setType(v, 'int');
}
// (bool), (boolean) - cast to boolean

function as_bool(v) {
    return setType(v, 'bool');
}
// (float), (double), (real) - cast to float

function as_float(v) {
    return setType(v, 'float');
}
// (string) - cast to string

function as_string(v) {
    return setType(v, 'string');
}
// (array) - cast to array

function as_array(v) {
    return setType(v, 'array');
}
/*
note:
    0xFF; // Hex declaration, returns 255
    020; // Octal declaration, returns 16
    1e3; // Exponential, same as 1 * Math.pow(10,3), returns 1000
    (1000).toExponential(); // Opposite with previous, returns 1e3
    (3.1415).toFixed(3); // Rounding the number, returns "3.142"
*/
// converts int to hex, eg 12 => "C"

function int2hex(i) {
    return (i).toString(16);
}
// converts int to octal, eg. 12 => "14"

function int2octal(i) {
    return (i).toString(8);
}
// converts hex to int, eg. "FF" => 255

function hex2int(string) {
    return parseInt(string, 16);
}
// converts octal to int, eg. "20" => 16

function octal2int(string) {
    return parseInt(string, 8);
}
// function_exists --  Return TRUE if the given function has been defined

function function_exists(v) {
    if (typeof v == 'string') {
        return (typeof this.window[v] == 'function');
    }
    return (v instanceof Function);
}
//------------------------------------------------------------------------------
/*
window.name for simple session handling
You can assign values as a string for window.name property and it preserves the values until you close the tab or window.

it’s very useful for toggling between debugging and (perfomance)
testing modes, when building a website or an application.
*/
// Dumps information about a variable

function var_dump(v) {
    log_error(json_encode(v));
}
/*-----------------------------------------------------------------------------------------------------------------------
 * Modified version of Douglas Crockford"s json.js that doesn"t mess with the Object prototype
 * http://www.json.org/js.html
 */

function json_encode(o) {
    var useHasOwn = {}.hasOwnProperty ? true : false;
    // crashes Safari in some instances
    //var validRE = /^("(\\.|[^"\\\n\r])*?"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])+?$/;
    var pad = function(n) {
            return n < 10 ? "0" + n : n;
        };
    var m = {
        "\b": '\\b',
        "\t": '\\t',
        "\n": '\\n',
        "\f": '\\f',
        "\r": '\\r',
        '"': '\\"',
        "\\": '\\\\'
    };
    var encodeString = function(s) {
            if (/["\\\x00-\x1f]/.test(s)) {
                return '"' + s.replace(/([\x00-\x1f\\"])/g, function(a, b) {
                    var c = m[b];
                    if (c) {
                        return c;
                    }
                    c = b.charCodeAt();
                    return "\\u00" + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
                }) + '"';
            }
            return '"' + s + '"';
        };
    var encodeArray = function(o) {
            var a = ["["],
                b, i, l = o.length,
                v;
            for (i = 0; i < l; i += 1) {
                v = o[i];
                switch (typeof v) {
                case "undefined":
                case "function":
                case "unknown":
                    break;
                default:
                    if (b) {
                        a.push(',');
                    }
                    a.push(v === null ? "null" : json_encode(v));
                    b = true;
                }
            }
            a.push("]");
            return a.join("");
        };
    var encodeDate = function(o) {
            return '"' + o.getFullYear() + "-" + pad(o.getMonth() + 1) + "-" + pad(o.getDate()) + "T" + pad(o.getHours()) + ":" + pad(o.getMinutes()) + ":" + pad(o.getSeconds()) + '"';
        };
    if (typeof o == "undefined" || o === null) {
        return "null";
    } else if (o instanceof Array) {
        return encodeArray(o);
    } else if (o instanceof Date) {
        return encodeDate(o);
    } else if (typeof o == "string") {
        return encodeString(o);
    } else if (typeof o == "number") {
        return isFinite(o) ? String(o) : "null";
    } else if (typeof o == "boolean") {
        return String(o);
    } else {
        var a = ["{"],
            b, i, v;
        for (i in o) {
            if (!useHasOwn || o.hasOwnProperty(i)) {
                v = o[i];
                switch (typeof v) {
                case "undefined":
                case "function":
                case "unknown":
                    break;
                default:
                    if (b) {
                        a.push(',');
                    }
                    a.push(json_encode(i), ":", v === null ? "null" : json_encode(v));
                    b = true;
                }
            }
        }
        a.push("}");
        return a.join("");
    }
}

function json_decode(json) {
    return eval("(" + json + ')');
}
//---------------------------------------------------------------------------------------------------------------------------
/* see http://dean.edwards.name/js-load/loadScript.js
function include(f , callback  ){
    if( str_right(f,2)=='js' ){
        var el = document.createElement('script');
        el.setAttribute('language', 'javascript');
        el.setAttribute('type', 'text/javascript');
        el.setAttribute('src', f);

        if( arguments.length==2 ){
            if (el.readyState){  //IE
                el.onreadystatechange = function(){
                    if (el.readyState == "loaded" || el.readyState == "complete"){
                        el.onreadystatechange = null;
                        if( typeof arguments[1] == 'function' ){
                            var callback = arguments[1];
                            callback();
                        }
                    }
                };
            } else {  //Others
                el.onload = function(){ arguments[1](); };
            }
        }
    } else if (str_right(f,3)=='css'){
        var el = document.createElement('link');
        el.setAttribute('rel', 'stylesheet');
        el.setAttribute('type', 'text/css');
        el.setAttribute('href', f);
    }
    document.getElementsByTagName('head')[0].appendChild(el);
    return true;
}*/
function include(url, callback) {
    var script;
    if (str_right(url, 2) == 'js') {
        script = document.createElement("script");
        script.type = "text/javascript";
        if (script.readyState) { //IE
            script.onreadystatechange = function() {
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    script.onreadystatechange = null;
                    callback();
                }
            };
        } else { //Others
            script.onload = function() {
                callback();
            };
        }
        script.src = url;
    } else if (str_right(url, 3) == 'css') {
        script = document.createElement('link');
        script.setAttribute('rel', 'stylesheet');
        script.setAttribute('type', 'text/css');
        script.setAttribute('href', url);
    }
    document.getElementsByTagName("head")[0].appendChild(script);
}

function include_once(f, callback) {
    function included() {
        for (var k in include_once._INCLUDED_FILES) {
            if (include_once._INCLUDED_FILES[k] === f) {
                return true;
            }
        }
        return false;
    }
    if (!included()) {
        include_once._INCLUDED_FILES.push(f);
        include(f, callback);
    }
}
include_once._INCLUDED_FILES = [];
var Resource = {
  injectCss: function(cssResource) {
    var css = document.createElement('LINK');
    css.type = 'text/css';
    css.rel = 'stylesheet';
    css.href = chrome.extension.getURL(cssResource);
    (document.head || document.body || document.documentElement).
        appendChild(css);
  },
  injectJavaScript: function(scriptResource) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.charset = "utf-8";
    script.src = chrome.extension.getURL(scriptResource);
    (document.head || document.body || document.documentElement).
        appendChild(script);
  }
};


// call it with arguments of current function
// __FUNCTION__(arguments)

function __FUNCTION__(args) {
    return args.callee.toString();
}

function __FILE__() {
    // window.fileName;
    return window.location.pathname;
}


