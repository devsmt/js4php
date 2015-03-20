// Perform a regular expression match
// return array o null

function reg_match(p, s) {
    var f = arg_init(arguments, 2, "gi");
    var r = new RegExp(p, f);
    var a = r.exec(s);
    if (!empty(a)) {
        return a;
    } else {
        return null;
    }
}
// Perform a regular expression search and replace
// sostituisce un solo match per volta, replacement può essere una funzione
// es. function (str, p1, p2){ return p1 + " , " + p2; }

function reg_replace(p, replacement, s) {
    var f = arg_init(arguments, 3, "gi");
    var r = new RegExp(p, f);
    return s.replace(r, replacement);
}
// return true if regexp metch

function reg_test(p, s) {
    var f = arg_init(arguments, 2, "gi");
    var r = new RegExp(p, f);
    return r.test(s);
}
// Firefox includes a non-standard JavaScript extension that makes regular expressions callable as functions.
RegExp.prototype.call = function(context, str) {
    return this.exec(str);
};
RegExp.prototype.apply = function(context, args) {
    return this.exec(args[0]);
};