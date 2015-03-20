// TODO: sostituire con json_encode
// Prints human-readable information about a variable

function print_r(object) {
    var maxIterations = 1000;
    // Max depth that Dumper will traverse in object
    var maxDepth = -1;
    var iterations = 0;
    var indent = 1;
    var indentText = " ";
    var nl = "\n";
    // Holds properties of top-level object to traverse - others are ignored
    var properties = null;

    function pad(len) {
        var s = "";
        for (var i = 0; i < len; i++) {
            s += indentText;
        }
        return s;
    }

    function inspect(o) {
        var level = 1;
        var indentLevel = indent;
        var r = "";
        var i;
        if (arguments.length > 1 && typeof(arguments[1]) == "number") {
            level = arguments[1];
            indentLevel = arguments[2];
            if (o == object) {
                return "[original object]";
            }
        } else {
            iterations = 0;
            object = o;
            // If a list of properties are passed in
            if (arguments.length > 1) {
                var list = arguments;
                var listIndex = 1;
                if (typeof(arguments[1]) == "object") {
                    list = arguments[1];
                    listIndex = 0;
                }
                for (var i = listIndex; i < list.length; i++) {
                    if (properties === null) {
                        properties = {};
                    }
                    properties[list[i]] = 1;
                }
            }
        }
        // Just in case, so the script doesn't hang
        if (iterations++ > maxIterations) {
            return r + "\n[Max Iterations Reached]";
        }
        if (maxDepth != -1 && level > (maxDepth + 1)) {
            return "...";
        }
        // undefined
        if (typeof(o) == "undefined") {
            return "[undefined]";
        }
        // NULL
        if (o === null) {
            return "[null]";
        }
        // DOM Object
        if (o == window) {
            return "[window]";
        }
        if (o == window.document) {
            return "[document]";
        }
        // FUNCTION
        if (typeof(o) == "function") {
            return "[function]";
        }
        // BOOLEAN
        if (typeof(o) == "boolean") {
            return (o) ? "true" : "false";
        }
        // STRING
        if (typeof(o) == "string") {
            return "'" + o + "'";
        }
        // NUMBER
        if (typeof(o) == "number") {
            return o;
        }
        if (typeof(o) == "object") {
            if (typeof(o.length) == "number") {
                // ARRAY
                if (maxDepth != -1 && level > maxDepth) {
                    return "[ ... ]";
                }
                r = "[";
                for (i = 0; i < o.length; i++) {
                    if (i > 0) {
                        r += "," + nl + pad(indentLevel);
                    } else {
                        r += nl + pad(indentLevel);
                    }
                    r += inspect(o[i], level + 1, indentLevel - 0 + indent);
                }
                if (i > 0) {
                    r += nl + pad(indentLevel - indent);
                }
                r += "]";
                return r;
            } else {
                // OBJECT
                if (maxDepth != -1 && level > maxDepth) {
                    return "{ ... }";
                }
                r = "{";
                var count = 0;
                for (i in o) {
                    if (o == object && properties !== null && properties[i] != 1) {
                        // do nothing with this node
                    } else {
                        try {
                            if (typeof(o[i]) != "unknown") {
                                var processAttribute = true;
                                // Check if this is a DOM object, and if so, if we have to limit properties to look at
                                if (o.ownerDocument || o.tagName || (o.nodeType && o.nodeName)) {
                                    processAttribute = false;
                                    if (i == "tagName" || i == "nodeName" || i == "nodeType" || i == "id" || i == "className") {
                                        processAttribute = true;
                                    }
                                }
                                if (processAttribute) {
                                    if (count++ > 0) {
                                        r += "," + nl + pad(indentLevel);
                                    } else {
                                        r += nl + pad(indentLevel);
                                    }
                                    r += "'" + i + "' : " + inspect(o[i], level + 1, indentLevel - 0 + i.length + 6 + indent);
                                } else {
                                    //r += "'" + i + "' : " + typeof(o[i]);
                                }
                            }
                        } catch (e) {
                            alert(print_r(e));
                        }
                    }
                }
                if (count > 0) {
                    r += nl + pad(indentLevel - indent);
                }
                r += "}";
                return r;
            }
        }
    }
    return inspect(object);
}
// Aside from the multibyte charcters problem mentioned above, there is a serious vulnerabilty involved in having the PHP server automatically unserializing strings received from the net: if the serialized string contains php object definitions, the PHP engine will call the magic '__wakeup()' function of the given class.
// This means that the client is in fact deciding which php code runs on the server, and opens the door to code injection attacks.
// So make sure the php string is properly validated before unserializing it on the server!
// For more details see eg: http://ilia.ws/archives/107-Another-unserialize-abuse.html
// PS: other libs abound that carry out the js-to-php serialization magic, not only on js arrays but on all datatypes, eg: http://sourceforge.net/projects/jpspan
// Generates a storable representation of a value

function serialize(obj) {
    var o = '',
        tmp = '',
        count = 0,
        key;
    if (typeof(obj) == 'object') {
        if (obj instanceof Array) {
            o = 'a:';
            for (key in obj) {
                tmp += serialize(key);
                tmp += serialize(obj[key]);
                count++;
            }
            o += count + ':{';
            o += tmp;
            o += '}';
        } else if (obj instanceof Object) {
            var classname = obj.toString();
            if (classname == '[object Object]') {
                classname = 'StdClass';
            }
            o = 'O:' + classname.length + ':"' + classname + '":';
            for (key in obj) {
                tmp += serialize(key);
                if (obj[key]) {
                    tmp += serialize(obj[key]);
                } else {
                    tmp += serialize('');
                }
                count++;
            }
            o += count + ':{' + tmp + '}';
        }
    } else {
        switch (typeof(obj)) {
        case 'number':
            if (is_float(obj)) {
                o += 'd:' + obj + ';';
            } else {
                o += 'i:' + obj + ';';
            }
            break;
        case 'string':
            o += 's:' + obj.length + ':"' + obj + '";';
            break;
        case 'boolean':
            o += (obj) ? 'b:1;' : 'b:0;';
            break;
        }
    }
    return o;
}
// Creates a PHP value from a stored representation

function unserialize(v) {
    // Returns length of strings/arrays etc

    function _serialized_len(input) {
        input = input.substring(2);
        var length = Number(input.substr(0, input.indexOf(':')));
        return length;
    }
    //Function which performs the actual unserializing

    function _unseialize(input) {
        var length = 0;
        switch (input.charAt(0)) {
            // array
        case 'a':
            length = _serialized_len(input);
            input = input.substr(String(length).length + 4);
            var arr = [];
            var key = null;
            var value = null;
            for (var i = 0; i < length; ++i) {
                key = _unseialize(input);
                input = key[1];
                value = _unseialize(input);
                input = value[1];
                arr[key[0]] = value[0];
            }
            input = input.substr(1);
            return [arr, input];
            break;
            // Objects
        case 'O':
            length = _serialized_len(input);
            var classname = String(input.substr(String(length).length + 4, length));
            input = input.substr(String(length).length + 6 + length);
            var numProperties = Number(input.substring(0, input.indexOf(':')));
            input = input.substr(String(numProperties).length + 2);
            var obj = {};
            var property = null;
            var value = null;
            for (var i = 0; i < numProperties; ++i) {
                key = _unseialize(input);
                input = key[1];
                // Handle private/protected
                key[0] = key[0].replace(new RegExp('^\x00' + classname + '\x00'), '');
                key[0] = key[0].replace(new RegExp('^\x00\\*\x00'), '');
                value = _unseialize(input);
                input = value[1];
                obj[key[0]] = value[0];
            }
            input = input.substr(1);
            return [obj, input];
            break;
            //Strings
        case 's':
            length = _serialized_len(input);
            return [String(input.substr(String(length).length + 4, length)), input.substr(String(length).length + 6 + length)];
            break;
            // Integers and doubles
        case 'i':
        case 'd':
            var num = Number(input.substring(2, input.indexOf(';')));
            return [num, input.substr(String(num).length + 3)];
            break;
            // Booleans
        case 'b':
            var bool = (input.substr(2, 1) == 1);
            return [bool, input.substr(4)];
            break;
            // Null
        case 'N':
            return [null, input.substr(2)];
            break;
            // Unsupported
        case 'o':
        case 'r':
        case 'C':
        case 'R':
        case 'U':
            log('Error: Unsupported PHP data type found!', 'error');
            // Error
        default:
            return [null, null];
            break;
        }
    }
    var r = _unseialize(v);
    return r[0];
}