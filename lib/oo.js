/*
fallback implementations of apply / call
*/
if (!Function.prototype.apply) {
    Function.prototype.apply = function(thisArg, argArray) {
        if (typeof this != "function") {
            throw new Error("apply called on incompatible " + "object (not a function)");
        }
        if (argArray !== null && !(argArray instanceof Array) && typeof argArray.callee != "function") {
            throw new Error("The 2nd argument to apply must " + "be an array or arguments object");
        }
        thisArg = (thisArg === null) ? window : Object(thisArg);
        thisArg.__applyTemp__ = this;
        // youngpup's hack
        var parameters = [],
            length = (argArray || "").length >>> 0;
        for (var i = 0; i < length; i++) {
            parameters[i] = "argArray[" + i + "]";
        }
        var functionCall = "thisArg.__applyTemp__(" + parameters + ")";
        try {
            return eval(functionCall);
        } finally {
            try {
                delete thisArg.__applyTemp__;
            } catch (e) {/* ignore */
            }
        }
    };
}
if (!Function.prototype.call) {
    Function.prototype.call = function(thisArg) {
        return this.apply(thisArg, Array.prototype.slice.apply(arguments, [1]));
    };
}

function class_exists(cls) {
    var i = '';
    //cls = this.window[cls]; // Note: will prevent inner classes
    if (typeof cls !== 'function') {
        return false;
    }
    for (i in cls.prototype) {
        return true;
    }
    for (i in cls) { // If static members exist, then consider a "class"
        if (i !== 'prototype') {
            return true;
        }
    }
    if (cls.toSource && cls.toSource().match(/this\./)) {
        // Hackish and non-standard but can probably detect if setting
        // a property (we don't want to test by instantiating as that
        // may have side-effects)
        return true;
    }
    return false;
}

function extend(subc, superc, overrides) {
    // nouvo oggetto
    var F = function() {};
    // assegna il prototipo del genitore
    F.prototype = superc.prototype;
    // assegna all'oggetto il nuovo oggetto
    subc.prototype = new F();
    // il costruttore del nuovo oggetto
    subc.prototype.constructor = subc;
    // mantiene un riferimento al costruttore della classe genitore (parentclass)
    subc.parent = superc.prototype;
    if (superc.prototype.constructor == Object.prototype.constructor) {
        // a cosa serve?
        superc.prototype.constructor = superc;
    }
    // copia i metodi del genitore
    if (overrides) {
        for (var i in overrides) {
            subc.prototype[i] = overrides[i];
        }
    }
}


/**
 * extends classes on javascript prototypes.
 * @param {Function} child
 * @param {Function} parent
 */

function class_inherits(child, parent) {
    if (child.prototype.__proto__) {
        child.prototype.__proto__ = parent.prototype;
    } else {
        function tmp() {};
        tmp.prototype = parent.prototype;
        child.prototype = new tmp();
        child.prototype.constructor = child;
    }
}

function mixin(r, s/*, a_functions_names_to_copy */) {
    var rp = r.prototype,
        sp = s.prototype,
        a = arguments,
        i, p;
    if (typeof rp == "undefined") {
        alert('Mixin needs a constructor as first argument, was passed:' + print_r(r));
    }
    if (a[2]) {
        // Only give certain methods names.
        var f = arguments[2];
        for (i = 0; i < f.length; i++) {
            rp[f[i]] = sp[f[i]];
        }
    } else {
        for (p in sp) {
            if (!rp[p]) {
                rp[p] = sp[p];
            }
        }
    }
}




/*
parsing string namespaces and automatically generating nested namespaces
use:
namespace("AA.BB.CC");
AA.BB.CC.identifier = function(){};
*/
function namespace(ns_string) {
    var parts = ns_string.split(".");
    var object = this;
    var i;
    var len = parts.length;
    for (i = 0; i < len; i++) {
        var name = parts[i];
        if (!object[name]) {
            object[name] = {};
        }
        object = object[name];
    }
    return object;
}
/*
function overload(object, name, fn){
    // Save a reference to the old method
    var old = object[ name ];

    // Overwrite the method with our new one
    object[ name ] = function(){
        // Check the number of incoming arguments,
        // compared to our overloaded function
        if ( fn.length == arguments.length ){
            // If there was a match, run the function
            return fn.apply( this, arguments );

        // Otherwise, fallback to the old method
        } else if ( typeof old === "function" ){
            return old.apply( this, arguments );
        }
    };
}
*/
/*
Duck Typing Interface

The idea behind this approach is simple: if an object contains methods that are named the same as the
methods defined in your interface, it implements that interface. Using a helper function, you
can ensure that the required methods are there:
*/
var Interface = function(name, methods) {
        if (arguments.length != 2) {
            throw new Error("Interface constructor called with " + arguments.length + "arguments, but expected exactly 2.");
        }
        this.name = name;
        this.methods = [];
        for (var i = 0, len = methods.length; i < len; i++) {
            if (typeof methods[i] !== 'string') {
                throw new Error("Interface constructor expects method names to be passed in as a string.");
            }
            this.methods.push(methods[i]);
        }
    };
// Static class method.
Interface.ensureImplements = function(object/*[, Interface, Interface ...]*/) {
    if (arguments.length < 2) {
        throw new Error("Function Interface.ensureImplements called with " + arguments.length + "arguments, but expected at least 2.");
    }
    for (var i = 1, len = arguments.length; i < len; i++) {
        var _interface_ = arguments[i];
        if (_interface_.constructor !== Interface) {
            throw new Error("Function Interface.ensureImplements expects arguments two and above to be instances of Interface.");
        }
        for (var j = 0, methodsLen = _interface_.methods.length; j < methodsLen; j++) {
            var method = _interface_.methods[j];
            if (!object[method] || typeof object[method] !== 'function') {
                throw new Error("Function Interface.ensureImplements: object does not implement the " + _interface_.name + " interface. Method " + method + " was not found.");
            }
        }
    }
    return true;
};
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function() {
    var initializing = false,
        fnTest = /xyz/.test(function() {
            xyz;
        }) ? /\b__construct\b/ : /.*/;
    // The base Class implementation (does nothing)
    this.Class = function() {};
    // Create a new Class that inherits from this class
    Class.extend = function(prop) {
        var __construct = this.prototype;
        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;
        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" && typeof __construct[name] == "function" && fnTest.test(prop[name]) ? (function(name, fn) {
                return function() {
                    var tmp = this.__construct;
                    // Add a new .__construct() method that is the same method
                    // but on the super-class
                    this.__construct = __construct[name];
                    // The method only need to be bound temporarily, so we
                    // remove it when we're done executing
                    var ret = fn.apply(this, arguments);
                    this.__construct = tmp;
                    return ret;
                };
            })(name, prop[name]) : prop[name];
        }
        // The dummy class constructor

        function Class() {
            // All construction is actually done in the init method
            if (!initializing && this.init) this.init.apply(this, arguments);
        }
        // Populate our constructed prototype object
        Class.prototype = prototype;
        // Enforce the constructor to be what we expect
        Class.constructor = Class;
        // And make this class extendable
        Class.extend = arguments.callee;
        return Class;
    };
})();
/*
function clone_obj(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    var c = obj instanceof Array ? [] : {};

    for (var i in obj) {
        var prop = obj[i];

        if (typeof prop == 'object') {
           if (prop instanceof Array) {
               c[i] = [];

               for (var j = 0; j < prop.length; j++) {
                   if (typeof prop[j] != 'object') {
                       c[i].push(prop[j]);
                   } else {
                       c[i].push(clone_obj(prop[j]));
                   }
               }
           } else {
               c[i] = clone_obj(prop);
           }
        } else {
           c[i] = prop;
        }
    }

    return c;
}
*/