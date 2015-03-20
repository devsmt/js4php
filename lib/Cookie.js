// legge un cookie, non è possibile leggere le singole proprietà: expires, path, domain, secure

function getcookie(name, def) {
    var c = document.cookie;
    var v = def;
    var p = c.indexOf(escape(name) + '=');
    if (p != -1) {
        var pv = p + (escape(name) + '=').length;
        var endPos = c.indexOf(';', pv);
        if (endPos != -1) {
            v = unescape(c.substring(pv, endPos));
        } else {
            v = unescape(c.substring(pv));
        }
    }
    return v;
}

function cookie_exists(name) {
    var i = document.cookie.indexOf(name);
    return (i != -1);
}
//int setcookie ( string name [, string value [, int expire [, string path [, string domain [, int secure]]]]] )
// expires è il numero di ore da ora di validità

function setcookie(name, value) {
    name = str_replace(' ', '', name);
    var expires = arg_init(arguments, 2, 0);
    var path = arg_init(arguments, 3, '/');
    var domain = arg_init(arguments, 4, '');
    var secure = arg_init(arguments, 5, '');
    secure = (secure == "1" || secure == 1 || secure == "secure") ? 1 : "";
    // numero di ore da ora
    if (expires !== 0) {
        var d = new Date();
        d.setTime(d.getTime() + (expires * 60 * 60 * 1000)); // 1 gg
        expires = d.toGMTString();
    } else {
        expires = "";
    }
    var s = name + "=" + escape(value) + ((expires !== '') ? "; expires=" + expires : '') + ((path !== '') ? "; path=" + path : "") + ((domain !== '') ? "; domain=" + domain : "") + ((secure !== '') ? "; secure" : "");
    document.cookie = s;
    if (!cookie_exists(name)) { //secure!=1
        return false;
    } else {
        return true;
    }
}
// restituire FALSE quando rimane cmq un cookie con quel nome, perché
// le proprietà non coincidono o perchè ce ne erano più di uno con lo stesso nome;
// i browser cancellano i cookie nel momento preciso in cui vengono scritti con un "expires" scaduto
// o nel momento in cui recuperano i cookies con "document.cookie" e trovano che "expires" è scaduto o non esiste
// non uso expire="Thu, 01 Jan 1970 00:00:01 GMT" perché se
// vi è un errore invece che cancellare un cookie ne scrive uno che non scade mai.
// IE non cancella i cookie se si inserisce in contenuto vuoto, poichè tale contenuto è salvato come "nome;"
// sembra non essere presente se si cerca per "nome=;"

function delcookie(name) {
    var path = arg_init(arguments, 1, '/');
    var domain = arg_init(arguments, 2, '');
    if (!cookie_exists(name)) {
        return true;
    } else {
        document.cookie += name + "=" + ((path) ? ";path=" + path : "") + ((domain) ? ";domain=" + domain : "") + ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
    }
}
/*
(function(w){
    //legge i cookie e restituisce un array nome valore
    function COOKIE_init(){
        var _COOKIE = {};

        if( document.cookie != ''){
            // array di stringhe con la coppia nome valore
            var a = explode(' ', document.cookie);
            for(var i=0; i<count(a); i++){
                var a_p = explode('=',a[i]);
                _COOKIE[a_p[0]] = unescape(a_p[1]);
            }
        }
        return _COOKIE;
    }
    _COOKIE = COOKIE_init();
})(window);
*/