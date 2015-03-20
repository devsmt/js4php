/*
Simples test Harness
    make it the simples possible
*/
function test(tests, opt) {
    opt = opt || {};
    var results = {},
        failed = 0,
        num_tests = 0;
    // ensure we got a dumper function
    window.json_encode = window.json_encode ||
    function(v) {
        return v;
    };
    for (var testName in tests) {
        num_tests++;
        try {
            tests[testName]();
            test.write(testName + " passed");
            results[testName] = null;
        } catch (ex) {
            test.fail(testName + ' failed with "' + ex.message + '"<br> ' + print_r(ex.stack));
            results[testName] = ex;
            failed++;
        }
    }
    if (failed) {
        test.fail(num_tests + " tests <br>");
        test.fail(failed + " failed.");
    } else {
        test.diag(num_tests + " tests ok <br>");
    }
    return results;
}
test.write = function(message, cls) {
    cls = cls || 'ok';
    // todo: gestire da configurazione
    var console_id = null;
    var console = typeof(console_id) === "string" ? document.getElementById(console_id) : console_id || document.body;
    if (!console.appendChild) {
        return;
    }
    var e = document.createElement("pre");
    //e.style.color = color;
    e.className = 'test ' + cls;
    e.innerHTML = message;
    console.appendChild(e);
};
test.diag = function(m) {
    test.write(m, 'diag');
};
test.fail = function(m) {
    test.write(m, 'error');
};
test.ok = function(condition, failMessage) {
    if (!condition) {
        throw new Error(failMessage || "Assertion failed.");
    }
};
test.print_expected = function(val, control_val) {
    return 'result was: "' + json_encode(val) + '", expected:"' + json_encode(control_val) + '"';
};/* controlla che tutti gli elementi di a1 siano presenti in a2(che potrebbe avere un numero maggiore di elementi)*/

function array_equals(a1, a2) {
    var i;
    if (is_object(a1)) {
        for (i in a1) {
            if (typeof a2[i] == 'undefined') {
                return false;
            }
        }
    } else if (is_array(a1)) {
        for (i = 0; i < a1.length; i++) {
            if (a1[i] !== a2[i]) {
                return false;
            }
        }
    }
    return true;
}/* si accerta che gli oggetti abbiano esattamente gli stessi elementi */

function array_equals_strict(a1, a2) {
    var i;
    if (is_object(a1)) {
        for (i in a1) {
            if (typeof a2[i] == 'undefined') {
                return false;
            }
            // gestire array ricorsivi
        }
        for (i in a2) {
            if (typeof a1[i] == 'undefined') {
                return false;
            }
        }
    } else if (is_array(a1)) {
        return a1.length == a2.length;
    }
    return true;
}