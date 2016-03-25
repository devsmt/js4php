/**
* @fileoverview
* <p>General Tools.</p>
* <p>Now contains a modified version of Douglas Crockford's json.js that doesn't
* mess with the DOM's prototype methods
* http://www.json.org/js.html</p>
* @author Dav Glass <dav.glass@yahoo.com>
* @version 1.0
* @requires YAHOO
* @requires YAHOO.util.Dom
* @requires YAHOO.util.Event
*
* @constructor
* @class General Tools.
*/
YAHOO.Tools = function() {
    keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    /**
    * Moved all regexes to the top level object to cache them.
    * @type Object
    */
    regExs = {
        quotes: /\x22/g,
        startspace: /^\s+/g,
        endspace: /\s+$/g,
        striptags: /<\/?[^>]+>/gi,
        hasbr: /<br/i,
        hasp: /<p>/i,
        rbr: /<br>/gi,
        rbr2: /<br\/>/gi,
        rendp: /<\/p>/gi,
        rp: /<p>/gi,
        base64: /[^A-Za-z0-9\+\/\=]/g,
        syntaxCheck: /^("(\\.|[^"\\\n\r])*?"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])+?$/
    }
 
    return {
        version: '1.0'
    }
}();
 
/**
* Trims starting and trailing white space from a string.
* @param {String} str The string to trim
*/
YAHOO.Tools.trim = function(str) {
    return str.replace(regExs.startspace, '').replace(regExs.endspace, '');
}
 
/**
* Repeats a string n number of times
* @param {String} str The string to repeat
* @param {Integer} repeat Number of times to repeat it
* @returns Repeated string
* @type String
*/
YAHOO.Tools.stringRepeat = function(str, repeat) {
    return new Array(repeat + 1).join(str);
}
 
/**
* printf function written in Javascript<br>
* <pre>var test = "You are viewing messages {0} - {1} out of {2}";
* YAHOO.Tools.printf(test, '5', '25', '500');</pre><br>
* This will return a string like:<br>
* "You are view messages 5 - 25 out of 500"<br>
* Patched provided by: Peter Foti <foti-1@comcast.net><br>
* @param {String} string
* @returns Parsed String
* @type String
*/
YAHOO.Tools.printf = function() {
    var num = arguments.length;
    var oStr = arguments[0];

    for (var i = 1; i < num; i++) {
        var pattern = "\\{" + (i-1) + "\\}";
        var re = new RegExp(pattern, "g");
        oStr = oStr.replace(re, arguments[i]);
    }
    return oStr;
}
 
/**
* Gets the currently selected text
* @param {Object} _document Optional. Reference to the document object
* @param {Object} _window Optional. Reference to the window object
* Both parameters are optional, but if you give one you need to give both.<br>
* The reason for the parameters is if you are dealing with an iFrame or FrameSet,
* you need to specify the document and the window of the frame you want to get the selection for
*/
YAHOO.Tools.getSelection = function(_document, _window) {
    if (!_document) { _document = document; }
    if (!_window) { _window = window; }
    if (_document.selection) {
    return _document.selection;
    }
  return _window.getSelection();
}
 
/**
* Set a cookie.
* @param {String} name The name of the cookie to be set
* @param {String} value The value of the cookie
* @param {String} expires A valid Javascript Date object
* @param {String} path The path of the cookie (Deaults to /)
* @param {String} domain The domain to attach the cookie to
* @param {Booleen} secure Booleen True or False
*/
YAHOO.Tools.setCookie = function(name, value, expires, path, domain, secure) {
     var argv = arguments;
     var argc = arguments.length;
     var expires = (argc > 2) ? argv[2] : null;
     var path = (argc > 3) ? argv[3] : '/';
     var domain = (argc > 4) ? argv[4] : null;
     var secure = (argc > 5) ? argv[5] : false;
     document.cookie = name + "=" + escape (value) +
       ((expires == null) ? "" : ("; expires=" + expires.toGMTString())) +
       ((path == null) ? "" : ("; path=" + path)) +
       ((domain == null) ? "" : ("; domain=" + domain)) +
       ((secure == true) ? "; secure" : "");
}

/**
* Get the value of a cookie.
* @param {String} name The name of the cookie to get
*/
YAHOO.Tools.getCookie = function(name) {
    var dc = document.cookie;
    var prefix = name + '=';
    var begin = dc.indexOf('; ' + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    } else {
        begin += 2;
    }
    var end = document.cookie.indexOf(';', begin);
    if (end == -1) {
        end = dc.length;
    }
    return unescape(dc.substring(begin + prefix.length, end));
}
/**
* Delete a cookie
* @param {String} name The name of the cookie to delete.
*/
YAHOO.Tools.deleteCookie = function(name, path, domain) {
    if (getCookie(name)) {
        document.cookie = name + '=' + ((path) ? '; path=' + path : '') + ((domain) ? '; domain=' + domain : '') + '; expires=Thu, 01-Jan-70 00:00:01 GMT';
    }
}
/**
* Object based Browser Engine Detection<br>
* The returned object will look like:<br>
* <pre>
*   obj {
*       ua: 'Full UserAgent String'
*       opera: boolean
*       safari: boolean
*       gecko: boolean
*       msie: boolean
*       version: string
*   }
* </pre>
* @return Browser Information Object
* @type Object
*/
YAHOO.Tools.getBrowserEngine = function() {
    var opera = ((window.opera && window.opera.version) ? true : false);
    var safari = ((navigator.vendor && navigator.vendor.indexOf('Apple') != -1) ? true : false);
    var gecko = ((document.getElementById && !document.all && !opera && !safari) ? true : false);
    var msie = ((window.ActiveXObject) ? true : false);
    var version = false;
    if (msie) {
        /**
        * This checks for the maxHeight style property.
        * I.E. 7 has this
        */
        if (typeof document.body.style.maxHeight != "undefined") {
            version = '7';
        } else {
            /**
            * Fall back to 6 (might need to find a 5.5 object too...).
            */
            version = '6';
        }
    }
    if (opera) {
        /**
        * The window.opera object has a method called version();
        * Here we only grab the first 2 parts of the dotted string to get 9.01,  9.02, etc..
        */
        var tmp_version = window.opera.version().split('.');
        version = tmp_version[0] + '.' + tmp_version[1];
    }
    if (gecko) {
        /**
        * FireFox 2 has a function called registerContentHandler();
        */
        if (navigator.registerContentHandler) {
            version = '2';
        } else {
            version = '1.5';
        }
        /**
        * This should catch all pre Firefox 1.5 browsers
        */
        if ((navigator.vendorSub) && !version) {
            version = navigator.vendorSub;
        }
    }
    if (safari) {
        try {
            /**
            * Safari 1.3+ supports the console method
            */
            if (console) {
                /**
                * Safari 2+ supports the onmousewheel event
                */
                if ((window.onmousewheel !== 'undefined') && (window.onmousewheel === null)) {
                    version = '2';
                } else {
                    version = '1.3';
                }
            }
        } catch (e) {
            /**
            * Safari 1.2 does not support the console method
            */
            version = '1.2';
        }
    }
    /**
    * Return the Browser Object
    * @type Object
    */
    var browsers = {
        ua: navigator.userAgent,
        opera: opera,
        safari: safari,
        gecko: gecko,
        msie: msie,
        version: version
    }
    return browsers;
}
/**
* User Agent Based Browser Detection<br>
* This function uses the userAgent string to get the browsers information.<br>
* The returned object will look like:<br>
* <pre>
*   obj {
*       ua: 'Full UserAgent String'
*       opera: boolean
*       safari: boolean
*       firefox: boolean
*       mozilla: boolean
*       msie: boolean
*       mac: boolean
*       win: boolean
*       unix: boolean
*       version: string
*       flash: version string
*   }
* </pre><br>
* @return Browser Information Object
* @type Object
*/
YAHOO.Tools.getBrowserAgent = function() {
    var ua = navigator.userAgent.toLowerCase();
    var opera = ((ua.indexOf('opera') != -1) ? true : false);
    var safari = ((ua.indexOf('safari') != -1) ? true : false);
    var firefox = ((ua.indexOf('firefox') != -1) ? true : false);
    var msie = ((ua.indexOf('msie') != -1) ? true : false);
    var mac = ((ua.indexOf('mac') != -1) ? true : false);
    var unix = ((ua.indexOf('x11') != -1) ? true : false);
    var win = ((mac || unix) ? false : true);
    var version = false;
    var mozilla = false;
    //var flash = this.checkFlash();
    if (!firefox && !safari && (ua.indexOf('gecko') != -1)) {
        mozilla = true;
        var _tmp = ua.split('/');
        version = _tmp[_tmp.length - 1].split(' ')[0];
    }
    if (firefox) {
        var _tmp = ua.split('/');
        version = _tmp[_tmp.length - 1].split(' ')[0];
    }
    if (msie) {
        version = ua.substring((ua.indexOf('msie ') + 5)).split(';')[0];
    }
    if (safari) {
        /**
        * Safari doesn't report a string, have to use getBrowserEngine to get it
        */
        version = this.getBrowserEngine().version;
    }
    if (opera) {
        version = ua.substring((ua.indexOf('opera/') + 6)).split(' ')[0];
    }

    /**
    * Return the Browser Object
    * @type Object
    */
    var browsers = {
        ua: navigator.userAgent,
        opera: opera,
        safari: safari,
        firefox: firefox,
        mozilla: mozilla,
        msie: msie,
        mac: mac,
        win: win,
        unix: unix,
        version: version//,
        //flash: flash
    }
    return browsers;
}
 
 
 
/**
* Divide your desired pixel width by 13 to find em width. Multiply that value by 0.9759 for IE via *width.
* @param    {Integer}   size The pixel size to convert to em.
* @return Object of sizes (2) {msie: size, other: size }
* @type Object
*/
YAHOO.Tools.PixelToEm = function(size) {
    var data = {};
    var sSize = (size / 13);
    data.other = (Math.round(sSize * 100) / 100);
    data.msie = (Math.round((sSize * 0.9759) * 100) / 100);
    return data;
}

 

/**
* Base64 Encodes a string
* @param    {String}    str The string to base64 encode.
* @return Base64 Encoded String
* @type String
*/
YAHOO.Tools.base64Encode = function(str) {
    var data = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    do {
        chr1 = str.charCodeAt(i++);
        chr2 = str.charCodeAt(i++);
        chr3 = str.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        data = data + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
    } while (i < str.length);

    return data;
}
/**
* Base64 Dncodes a string
* @param    {String}    str The base64 encoded string to decode.
* @return The decoded String
* @type String
*/
YAHOO.Tools.base64Decode = function(str) {
    var data = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
    str = str.replace(regExs.base64, "");

    do {
        enc1 = keyStr.indexOf(str.charAt(i++));
        enc2 = keyStr.indexOf(str.charAt(i++));
        enc3 = keyStr.indexOf(str.charAt(i++));
        enc4 = keyStr.indexOf(str.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        data = data + String.fromCharCode(chr1);

        if (enc3 != 64) {
            data = data + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            data = data + String.fromCharCode(chr3);
        }
    } while (i < str.length);

    return data;
}

/**
* Parses a Query String, if one is not provided, it will look in location.href<br>
* NOTE: This function will also handle test[] vars and convert them to an array inside of the return object.<br>
* This now supports #hash vars, it will return it in the object as Obj.hash
* @param    {String}    str The string to parse as a query string
* @return An object of the parts of the parsed query string
* @type Object
*/
YAHOO.Tools.getQueryString = function(str) {
    var qstr = {};
    if (!str) {
        var str = location.href.split('?');
        if (str.length != 2) {
            str = ['', location.href];
        }
    } else {
        var str = ['', str];
    }
    if (str[1].match('#')) {
        var _tmp = str[1].split('#');
        qstr.hash = _tmp[1];
        str[1] = _tmp[0];
    }
    if (str[1]) {
        str = str[1].split('&');
        if (str.length) {
            for (var i = 0; i < str.length; i++) {
                var part = str[i].split('=');
                if (part[0].indexOf('[') != -1) {
                    if (part[0].indexOf('[]') != -1) {
                        //Array
                        var arr = part[0].substring(0, part[0].length - 2);
                        if (!qstr[arr]) {
                            qstr[arr] = [];
                        }
                        qstr[arr][qstr[arr].length] = part[1];
                    } else {
                        //Object
                        var arr = part[0].substring(0, part[0].indexOf('['));
                        var data = part[0].substring((part[0].indexOf('[') + 1), part[0].indexOf(']'));
                        if (!qstr[arr]) {
                            qstr[arr] = {};
                        }
                        //Object
                        qstr[arr][data] = part[1];
                    }
                } else {
                    qstr[part[0]] = part[1];
                }
            }
        }
    }
    return qstr;
}
/**
* Parses a Query String Var<br>
* NOTE: This function will also handle test[] vars and convert them to an array inside of the return object.
* @param    {String}    str The var to get from the query string
* @return The value of the var in the querystring.
* @type String/Array
*/
YAHOO.Tools.getQueryStringVar = function(str) {
    var qs = this.getQueryString();
    if (qs[str]) {
        return qs[str];
    } else {
        return false;
    }
}


 
 
 

