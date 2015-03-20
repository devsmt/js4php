// Decodes URL-encoded string
// php: echo urlencode('",/?:@&=+$#" '); -> %22%2C%2F%3F%3A%40%26%3D%2B%24%23%22+
// js:urlencode('",/?:@&=+$#" ')-> %22%2C%2F%3F%3A%40%26%3D%2B%24%23%22%20

function urldecode(v) {
    var s = decodeURIComponent(v);
    return s.replace('+', ' ');
}
// URL-encodes string

function urlencode(v) {
    var s = encodeURIComponent(v);
    return s.replace('%20', '+');
}
//string http_build_url ( [mixed $url [, mixed $parts [, int $flags = HTTP_URL_REPLACE [, array &$new_url]]]] )
//from: http://www.openjs.com/scripts/data/ued_url_encoded_data/
// ued_encode() will take an array as its argument and return the data encoded in UED format - as a string.

function http_build_query(arr, current_i) {
    var s = "";
    if (typeof current_i == 'undefined') {
        current_i = '';
    }
    if (typeof(arr) == 'object') {
        var params = [];
        for (k in arr) {
            var data = arr[k];
            var k_value = k;
            if (current_i) {
                k_value = current_i + "[" + k + "]";
            }
            if (typeof(data) == 'object') {
                if (data.length) { //List
                    for (var i = 0; i < data.length; i++) {
                        params.push(k_value + "[]=" + http_build_query(data[i], k_value)); //:RECURSION:
                    }
                } else { //Associative array
                    params.push(http_build_query(data, k_value)); //:RECURSION:
                }
            } else { //String or Number
                params.push(k_value + "=" + urlencode(data));
            }
        }
        s = params.join("&");
    } else {
        s = urlencode(arr);
    }
    return s;
}
// Returns filename component of path
// gestisce l'ultimo char se '/'? return str.substr(0, (str.length-1));

function basename() {
    var url = arg_init(arguments, 0, self_uri());
    // toglie querystring
    var i = url.indexOf('?') != -1 ? url.indexOf('?') : 0;
    url = url.substr(0, i);
    var a = reg_match("(.*)/(.*)$", url);
    return a[2];
}
//Returns directory name component of path

function dirname() {
    var url = arg_init(arguments, 0, self_uri());
    var a = reg_match("(.*)/(.*)$", url);
    return a[1];
}
/*
es.
var l = parse_url('http://www.test.com?key=value#hash');
alert(l.getHref()); // http://www.test.com
alert(l.getProtocol()); // http:
*/
function parse_url(url) {
    var result = {
        url: url,
        scheme: '',
        //- e.g. http
        host: '',
        port: '',
        user: '',
        pass: '',
        path: '',
        query: '',
        //- after the question mark ?
        fragment: '',
        //- after the hashmark #
        // parte dopo il "?"
        getSearch: function() {
            return url.match(/\?(.+)/i)[1];
        },
        // parte dopo il "#"
        getHash: function() {
            return url.match(/#(.+)/i)[1];
        },
        getProtocol: function() {
            return url.match(/(ht|f)tps?:/)[0];
        },
        getHref: function() {
            return url.match(/(.+\.[a-z]{2,4})/ig)[0];
        },
        getPath: function() {
            // rimuovo il protocollo, che contien //
            var url = this.url.substr(this.url.indexOf('://') + 3);
            // togli gli eventali parametri aggiuntivi in qrystr
            var i_1 = url.indexOf('?');
            var i_2 = url.indexOf('#');
            var stop = url.length;
            if (i_1 > -1) {
                stop = i_1;
            } else if (i_2 > -1) {
                stop = i_2;
            }
            return url.substr(url.indexOf('/'), stop);
        }
    };
    var reg = "^";
    reg += "(.*)://"; // scheme
    reg += "(.[^:]*)[:]?"; // user
    reg += "(.[^@]*)[@]?"; // pass
    reg += "(.[^:]*)[:]?"; // hostname
    reg += "(.[^/]*)[/]?"; // port
    reg += "(.[^?]*)[?]?"; // path
    reg += "(.[^#]*)[#]?"; // query string
    reg += "(.*)$"; // anchor
    var a = reg_match(reg, url);
    if (!is_null(a)) {
        result['scheme'] = a[1];
        result['user'] = a[2];
        result['pass'] = a[3];
        result['host'] = a[4];
        result['port'] = a[5];
        result['path'] = result.getPath(); //a[6];
        result['query'] = a[7];
        result['fragment'] = a[8];
        return result;
    } else {
        return false;
    }
}
//-- begin non php URL Utils ---------------------------------------------------
//ritorna il percorso completo dello script

function self_uri() {
    var l = document.location;
    //l['hostname'] ?
    //l['port'] // non gestita
    // l['protocol']+'//'+l['host']+
    return l.pathname + l.search + l.hash;
}
// parsing dei dati in querystring da una url qualungue,
// se location.search non fosse disponibile dovrebbe funzionare con document.location o altra url arbitraria

function parse_qs(qs) {
    var url = qs || location.search || document.location.href;
    var i = url.indexOf("?");
    var data = {};
    if (i >= 0) {
        var q = url.substring(i + 1);
        var tokens = q.split("&");
        for (var j = 0; j < tokens.length; j++) {
            var token = tokens[j];
            var pairs = token.split("=");
            data[pairs[0]] = pairs[1];
        }
    }
    return data;
}

function get_init(n, def) {
    if (typeof _GET == 'undefined') {
        _GET = parse_qs(location.search);
    }
    if (_GET[n]) {
        return urldecode(_GET[n]);
    } else {
        return def;
    }
}

var Request = {
    get: function(name, def){
        var val =  RegExp("[&?]"+name+"=([^&]+)").exec(location)[1];
        return val ? val : def;
    }
    //If you want to support arrays (Thanks atk!)
    getArray: function(name){
        var b=[];
        var c;
        for(
            var d=eval('/[&?]'+name+'(\\[])?=([^&]+)/g');
            c=d.exec(location);
        ) {
            b.push(c[2]);
        }
        return b
    }
};




// append: aggiungi i parametri nella qs corrente alla qs risultante

function url_for(page, vars, append) {
    s = page;
    append = false;
    pairs = [];
    for (k in vars) {
        pairs.push(k + '=' + urlencode(vars[k]));
    }
    if (pairs.length > 0) {
        s += '?' + implode('&', pairs);
    }
    return s;
}
//-- end non php URL Utils ------
//-- begin PHP style parameters
(function(w) {
    _GET = parse_qs(location.search);
    REQUEST_URI = self_uri();
    PHP_SELF = dirname();
})(window);