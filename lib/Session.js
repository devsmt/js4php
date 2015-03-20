/**
 * Implements cookie-less JavaScript SESSION variables
 * v1.0
 *
 * By Craig Buckler, Optimalworks.net
 *
 * As featured on SitePoint.com
 * Please use as you wish at your own risk.
*
 * Usage:
 *
 * // store a SESSION value/object
 * SESSION.set(name, object);
 *
 * // retreive a SESSION value/object
 * SESSION.get(name);
 *
 * // clear all SESSION data
 * SESSION.clear();
 *
 * // dump SESSION data
 * SESSION.dump();
 */

// if (JSON && JSON.stringify && JSON.parse)
var SESSION = SESSION || (function() {

        // window object
        var win = window.top || window;

        // SESSION store
        var store = (win.name ? JSON.parse(win.name) : {});

        // save store on page unload
        function Save() {
            win.name = JSON.stringify(store);
        };

        // page unload event
        if (window.addEventListener) window.addEventListener("unload", Save, false);
        else if (window.attachEvent) window.attachEvent("onunload", Save);
        else window.onunload = Save;

        // public methods
        return {

            // set a SESSION variable
            set: function(name, value) {
                store[name] = value;
            },

            // get a SESSION value
            get: function(name) {
                return (store[name] ? store[name] : undefined);
            },

            // clear SESSION
            clear: function() { store = {}; },

            // dump SESSION data
            dump: function() { return JSON.stringify(store); }

        };

     })();
