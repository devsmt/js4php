//mixed array_search ( mixed ago, array pagliaio [, bool strict] )
//Cerca in pagliaio per trovare ago e restituisce la chiave/indice se viene trovato nell'array, FALSE altrimenti.

function array_search(needle, a) {
    // MSIE doesn't supply us with indexOf
    var i;
    if (a.indexOf) {
        i = a.indexOf(needle); // -1 on false
        return i < 0 ? false : i;
    }
    if (a instanceof Array) {
        for (i = 0; i < a.length; i++) {
            if (a[i] == needle) {
                return i;
            }
        }
    } else if (is_object(a)) {
        i = '';
        for (i in a) {
            if (a[i] == needle) {
                return i;
            }
        }
    }
    return false;
}
// Count elements in a variable

function count(ar) {
    if (isset(ar.length)) {
        return ar.length;
    } else if (is_object(ar)) {
        var i = 0;
        for (var n in ar) {
            i++;
        }
        return i;
    }
    return null;
}

function clone(o) {
    if (o instanceof Array) {
        return o.slice(0);
    } else if (typeof(o) != 'object') {
        var temp = new o.constructor(); // changed (twice)
        for (var key in o) {
            temp[key] = clone(o[key]);
        }
        return temp;
    } else {
        var copy = o;
        return copy;
    }
}
// Return TRUE if a value exists in an array

function in_array(needle, a) {
    return array_search(needle, a) !== false;
}
//bool array_key_exists ( mixed needle, haystack )
//array_key_exists() restituisce TRUE se il parametro chiave esiste nell'array.
//chiave pu� essere qualsiasi valore accettabile per un indice di array.

function array_key_exists(needle, a) {
    if (is_object(a)) {
        for (var k in a) {
            if (k == needle) {
                return true;
            }
        }
    }
    return false;
}
//array array_values ( array input )
//array_values() restituisce tutti i valori dell'array input e indicizza numericamente l'array.

function array_values(a) {
    if (a instanceof Array) {
        return a;
    } else if (is_object(a)) {
        var r = [];
        for (var k in a) {
            r.push(a[k]);
        }
        return r;
    }
    return [];
}
//array array_keys ( array input [, mixed valore_ricerca] )
//array_keys() rstituisce le chiavi, numeriche e stringa, dell'array input.

function array_keys(a) {
    if (is_array(a)) {
        return false;
    } else if (is_object(a)) {
        var r = [];
        for (var k in a) {
            r.push(k);
        }
        return r;
    }
}
//mixed array_pop ( array array )
//array_pop() estrae e restituisce l'ultimo valore di array, accorciando array di un elemento.
//Se array � vuoto (o non � un array), viene restituito NULL.

function array_pop(a) {
    if (is_array(a)) {
        var v = a[a.length - 1];
        //this.length = a.length-1;
        return v;
    } else if (is_object(a)) {
        return null;
    }
}
//int array_push ( array array, mixed var [, mixed ...] )
//array_push() tratta array come una pila, e accoda le variabili date alla fine di array.
// La lunghezza di array aumenta del numero di variabili accodate.

function array_push(a) {
    if (a instanceof Array) {
        for (var i = 1; i < arguments.length; i++) {
            a.push(arguments[i]);
        }
    } else if (is_object(a)) {
        return false;
    }
}
//array array_slice ( array array, int offset [, int length] )
//array_slice() restituisce la sequenza di elementi dell'array array come specificato dai parametri offset e length .

function array_slice(a, offset, len) {
    var r = [];
    if (!len || len > a.length) {
        len = a.length;
    }
    for (var i = offset; i < len; i++) {
        r[r.length] = a[i];
    }
    return r;
}
// array array_merge ( array array1 [, array array2 [, array ...]] )
// array_merge() fonde gli elementi di uno o pi� array in modo che i valori di un
// array siano accodati a quelli dell'array precedente. Restituisce l'array risultante.

function array_merge(r) {
    var i;
    if (r instanceof Array) {
        for (i = 1; i < arguments.length; i++) {
            for (var j = 0; j < count(arguments[i]); j++) {
                r[count(r)] = arguments[i][j];
            }
        }
    } else if (r instanceof Object) {
        for (i = 1; i < arguments.length; i++) {
            for (k in arguments[i]) {
                if (arguments[i][k] instanceof Array || arguments[i][k] instanceof Object) {
                    r[k] = array_merge(r[k], arguments[i][k]);
                } else {
                    r[k] = arguments[i][k];
                }
            }
        }
    }
    return r;
}
//array_map --  Applica la funzione callback a tutti gli elementi dell'array dato
//array_walk --  Esegue una funzione su ogni elemento dell'array
// callback function, array arr1 [, array arr2...]

function array_map(f, a) {
    var r;
    if (a && a.map) {
        return a.map(f);
    }
    if (a instanceof Array) {
        r = [];
        for (var j = 0; j < count(a); j++) {
            r[count(r)] = f(a[j], j);
        }
    } else if (is_object(a)) {
        r = {};
        for (k in a) {
            r[k] = f(a[k], k);
        }
    }
    return r;
}
//array_filter --  Filtra gli elementi di un array usando una funzione callback
// array array_filter ( array input [, callback function])
// usage:  array_filter( [ '' , null , 't' , undefined , 0, 100 ] , function(o){return (typeof(o)=== 'number' )   ) ;//== 0,100

function array_filter(a, f) {
    var r;
    if (typeof(f) != 'function') {
        f = function(o) {
            return !!o;
        };
    }
    if (a instanceof Array) {
        r = [];
        for (var j = 0; j < count(a); j++) {
            if (f(a[j], j)) {
                r[count(r)] = a[j];
            }
        }
    } else if (is_object(a)) {
        r = {};
        for (k in a) {
            if (f(a[k], k)) {
                r[k] = a[k];
            }
        }
    }
    return r;
}
//array_flip -- Scambia tutte le chiavi di un array con i loro valori associati
//array_intersect -- Calcola l'intersezione degli arrays
//array_reverse --  Restituisce un array con gli elementi in ordine invertito

function array_reverse(a) {
    if (a instanceof Array) {
        return a.reverse();
    } else if (is_object(a)) {
        return a;
    }
}
//array_pad --  Riempie con un valore un array fino alla lunghezza specificata

function array_pad(input, pad_size, pad_value) {
    var pad = [],
        newArray = [],
        newLength, i = 0;
    if (input instanceof Array && !isNaN(pad_size)) {
        newLength = ((pad_size < 0) ? (pad_size * -1) : pad_size);
        if (newLength > input.length) {
            for (i = 0; i < (newLength - input.length); i++) {
                newArray[i] = pad_value;
            }
            pad = ((pad_size < 0) ? newArray.concat(input) : input.concat(newArray));
        } else {
            pad = input;
        }
    }
    return pad;
}
// Removes the first element from an array and returns that element

function array_get_first(a) {
    return a.shift();
}
// Removes the last element from an array and returns that element.

function array_get_last(a) {
    return a.pop();
}
//Adds one or more elements to the front of an array and returns the new length of the array.

function array_prepend(a, elem) {
    return a.unshift(elem);
}
// Adds one or more elements to the end of an array and returns the new length of the array.

function array_append(a, elem) {
    return a.push(elem);
}
// ritorna true se  tutti gli elementi contengono il pattern

function array_match_every(a, func, context) {
    for (var i = 0; i < a.length; i++) {
        if (i in a && !func.call(context, a[i], i, a)) {
            return false;
        }
    }
    return true;
}
// ritorna true se almeno un elemento dell'array passa la funzione di test
// es. array_match_some(/^a/, ["a","b","ab","ba"])

function array_match_some(a, func, context) {
    for (var i = 0; i < a.length; i++) {
        if (i in a && func.call(context, a[i], i, a)) {
            return true;
        }
    }
    return false;
}
// Return the lowest value in an array or a series of arguments
// min(1,23,])

function min() {
    //if( arguments.length != 1 ){
    //    return min(arguments);
    //} else {
    var _min = arguments[0];
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] < _min) {
            _min = arguments[i];
        }
    }
    return _min;
    //}
}
// Return the highest value in an array or a series of arguments

function max() {
    //if( arguments.length != 1 ){
    //    return max(arguments);
    //} else {
    var _max = arguments[0];
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] > _max) {
            _max = arguments[i];
        }
    }
    return _max;
    //}
}
// Returns a single result from a list of values.
// Also known as inject, or foldl.
// Uses JavaScript 1.8's version of reduce, if possible.

function array_reduce(obj, iterator, context) {
    var memo;
    if (obj && obj.reduce) {
        // _.bind(iterator, context)
        return obj.reduce(iterator, memo);
    }
    foreach(obj, function(value, index, list) {
        memo = iterator.call(context, memo, value, index, list);
    });
    return memo;
}

function array_unique(a) {
    var k = '',
        a2 = {},
        a3 = {};
    var val = '';
    a2 = a;
    for (k in a2) {
        val = a2[k];
        if (false === array_search(val, a3)) {
            a3[k] = val;
        }
        delete a2[k];
    }
    return a3;
}
// Provide JavaScript 1.6's lastIndexOf, delegating to the native function,
// if possible.

function array_last_index_of(k, a) {
    if (a.lastIndexOf) {
        return a.lastIndexOf(k);
    }
    var i = a.length;
    while (i--) {
        if (a[i] === k) {
            return i;
        }
    }
    return -1;
}
// Handles objects implementing forEach, each, arrays, and raw objects.
// function( obj[key], key, obj ){}
function foreach(obj, fn, context) {
    var j = 0;
    try {
        if (obj.forEach) {
            obj.forEach(fn, context);
        } else if (obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
                fn.call(context, obj[i], i, obj);
            }
        } else if (obj.each) {
            obj.each(function(value) {
                fn.call(context, value, j++, obj);
            });
        } else {
            for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    fn.call(context, obj[key], key, obj);
                }
            }
        }
    } catch (e) {
        if (e != '__break__') {
            throw e;
        }
    }
    return obj;
}


function range(low, high, step) {
    var a = [];
    var inival, endval, plus;
    var walker = step || 1;
    var chars = false;
    if (!isNaN(low) && !isNaN(high)) {
        inival = low;
        endval = high;
    } else if (isNaN(low) && isNaN(high)) {
        chars = true;
        inival = low.charCodeAt(0);
        endval = high.charCodeAt(0);
    } else {
        inival = (isNaN(low) ? 0 : low);
        endval = (isNaN(high) ? 0 : high);
    }
    plus = ((inival > endval) ? false : true);
    if (plus) {
        while (inival <= endval) {
            a.push(((chars) ? String.fromCharCode(inival) : inival));
            inival += walker;
        }
    } else {
        while (inival >= endval) {
            a.push(((chars) ? String.fromCharCode(inival) : inival));
            inival -= walker;
        }
    }
    return a;
}
//-- sort functions----------------------
//array_multisort -- Sort multiple or multi-dimensional arrays

function sort(a, flags) {
    var valArr = [],
        keyArr = [];
    var k = '',
        i = 0,
        sorter = false,
        that = this;
    for (k in a) { // Get key and value arrays
        valArr.push(a[k]);
        delete a[k];
    }
    switch (flags) {
    case 'SORT_STRING':
        // compare items as strings
        sorter = function(a, b) {
            return that.strnatcmp(a, b);
        };
        break;
    case 'SORT_LOCALE_STRING':
        // compare items as strings, based on the current locale (set with  i18n_loc_set_default() as of PHP6)
        var loc = this.i18n_loc_get_default();
        sorter = this.php_js.i18nLocales[loc].sorting;
        break;
    case 'SORT_NUMERIC':
        // compare items numerically
        sorter = function(a, b) {
            return (a - b);
        };
        break;
    case 'SORT_REGULAR':
        // compare items normally (don't change types)
    default:
        sorter = function(a, b) {
            if (a > b) {
                return 1;
            }
            if (a < b) {
                return -1;
            }
            return 0;
        };
        break;
    }
    valArr.sort(sorter);
    for (i = 0; i < valArr.length; i++) { // Repopulate the old array
        a[i] = valArr[i];
    }
    return true;
}

function rsort(a, flags) {
    var valArr = [],
        k = '',
        i = 0,
        sorter = false,
        that = this;
    for (k in a) { // Get key and value arrays
        valArr.push(a[k]);
        delete a[k];
    }
    switch (flags) {
    case 'SORT_STRING':
        // compare items as strings
        sorter = function(a, b) {
            return that.strnatcmp(b, a);
        };
        break;
    case 'SORT_LOCALE_STRING':
        // compare items as strings, based on the current locale (set with  i18n_loc_set_default() as of PHP6)
        var loc = this.i18n_loc_get_default();
        sorter = this.php_js.i18nLocales[loc].sorting;
        break;
    case 'SORT_NUMERIC':
        // compare items numerically
        sorter = function(a, b) {
            return (b - a);
        };
        break;
    case 'SORT_REGULAR':
        // compare items normally (don't change types)
    default:
        sorter = function(a, b) {
            if (a < b) {
                return 1;
            }
            if (a > b) {
                return -1;
            }
            return 0;
        };
        break;
    }
    valArr.sort(sorter);
    for (i = 0; i < valArr.length; i++) { // Repopulate the old array
        a[i] = valArr[i];
    }
    return true;
}

function ksort(array, flags) {
    var tmp_arr = {},
        keys = [],
        sorter, i, key, that = this;
    switch (flags) {
    case 'SORT_STRING':
        // compare items as strings
        sorter = function(a, b) {
            return that.strnatcmp(a, b);
        };
        break;
    case 'SORT_LOCALE_STRING':
        // compare items as strings, based on the current locale (set with  i18n_loc_set_default() as of PHP6)
        var loc = this.i18n_loc_get_default();
        sorter = this.php_js.i18nLocales[loc].sorting;
        break;
    case 'SORT_NUMERIC':
        // compare items numerically
        sorter = function(a, b) {
            return (a - b);
        };
        break;
    case 'SORT_REGULAR':
        // compare items normally (don't change types)
    default:
        sorter = function(a, b) {
            if (a > b) {
                return 1;
            }
            if (a < b) {
                return -1;
            }
            return 0;
        };
        break;
    }
    // Make a list of key names
    for (key in array) {
        keys.push(key);
    }
    keys.sort(sorter);
    // Rebuild array with sorted key names
    for (i = 0; i < keys.length; i++) {
        key = keys[i];
        tmp_arr[key] = array[key];
        delete array[key];
    }
    for (i in tmp_arr) {
        array[i] = tmp_arr[i];
    }
    return true;
}

function krsort(array, flags) {
    var tmp_arr = {},
        keys = [],
        sorter, i, key, that = this;
    switch (flags) {
    case 'SORT_STRING':
        // compare items as strings
        sorter = function(a, b) {
            return that.strnatcmp(b, a);
        };
        break;
    case 'SORT_LOCALE_STRING':
        // compare items as strings, based on the current locale (set with  i18n_loc_set_default() as of PHP6)
        var loc = this.i18n_loc_get_default();
        sorter = this.php_js.i18nLocales[loc].sorting;
        break;
    case 'SORT_NUMERIC':
        // compare items numerically
        sorter = function(a, b) {
            return (b - a);
        };
        break;
    case 'SORT_REGULAR':
        // compare items normally (don't change types)
    default:
        sorter = function(a, b) {
            if (a < b) {
                return 1;
            }
            if (a > b) {
                return -1;
            }
            return 0;
        };
        break;
    }
    // Make a list of key names
    for (key in array) {
        keys.push(key);
    }
    keys.sort(sorter);
    // Rebuild array with sorted key names
    for (i = 0; i < keys.length; i++) {
        key = keys[i];
        tmp_arr[key] = array[key];
        delete array[key];
    }
    for (i in tmp_arr) {
        array[i] = tmp_arr[i];
    }
    return true;
}

// Builds a hash table(fast search) out of an array of objects,
// using the specified `key` within in each object.
function build_hash_table(key, objects) {
    if (!$.isArray(objects)) return objects;
    var i, n, table = {};
    for (i = 0, n = objects.length; i < n; i++) {
        if (objects[i].hasOwnProperty(key)) {
            table[objects[i][key]] = objects[i];
        }
    }
    return table;
};