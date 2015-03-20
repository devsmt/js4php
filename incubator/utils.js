//--------------------------------------------------------------------------
//  addEvent
//--------------------------------------------------------------------------
function addEvent( obj, type, fn ) {
  if (obj.addEventListener) {
    obj.addEventListener( type, fn, false );
    EventCache.add(obj, type, fn);
  }
  else if (obj.attachEvent) {
    obj["e"+type+fn] = fn;
    obj[type+fn] = function() { obj["e"+type+fn]( window.event ); }
    obj.attachEvent( "on"+type, obj[type+fn] );
    EventCache.add(obj, type, fn);
  }
  else {
    obj["on"+type] = obj["e"+type+fn];
  }
}

var EventCache = function(){
  var listEvents = [];
  return {
    listEvents : listEvents,
    add : function(node, sEventName, fHandler){
      listEvents.push(arguments);
    },
    flush : function(){
      var i, item;
      for(i = listEvents.length - 1; i >= 0; i = i - 1){
        item = listEvents[i];
        if(item[0].removeEventListener){
          item[0].removeEventListener(item[1], item[2], item[3]);
        };
        if(item[1].substring(0, 2) != "on"){
          item[1] = "on" + item[1];
        };
        if(item[0].detachEvent){
          item[0].detachEvent(item[1], item[2]);
        };
        item[0][item[1]] = null;
      };
    }
  };
}();
addEvent(window,'unload',EventCache.flush);

function addLoadEvent(func){
  addEvent(window,'load',func, false);
}

//------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------
function getElementsByClass(searchClass,node,tag) {
  var classElements = new Array();
  if ( node == null )
    node = document;
  if ( tag == null )
    tag = '*';
  var els = node.getElementsByTagName(tag);
  var elsLen = els.length;
  var pattern = new RegExp('(^|\\s)'+searchClass+'(\\s|$)');
  for (i = 0, j = 0; i < elsLen; i++) {
    if ( pattern.test(els[i].className) ) {
      classElements[j] = els[i];
      j++;
    }
  }
  return classElements;
}


//------------------------------------------------------------------------------
//  CSS QUESRY
//------------------------------------------------------------------------------
/*
    cssQuery, version 2.0.2 (2005-08-19)
    Copyright: 2004-2005, Dean Edwards (http://dean.edwards.name/)
    License: http://creativecommons.org/licenses/LGPL/2.1/
*/

// the following functions allow querying of the DOM using CSS selectors
var cssQuery = function() {
var version = "2.0.2";

// -----------------------------------------------------------------------
// main query function
// -----------------------------------------------------------------------

var $COMMA = /\s*,\s*/;
var cssQuery = function($selector, $$from) {
try {
    var $match = [];
    var $useCache = arguments.callee.caching && !$$from;
    var $base = ($$from) ? ($$from.constructor == Array) ? $$from : [$$from] : [document];
    // process comma separated selectors
    var $$selectors = parseSelector($selector).split($COMMA), i;
    for (i = 0; i < $$selectors.length; i++) {
        // convert the selector to a stream
        $selector = _toStream($$selectors[i]);
        // faster chop if it starts with id (MSIE only)
        if (isMSIE && $selector.slice(0, 3).join("") == " *#") {
            $selector = $selector.slice(2);
            $$from = _msie_selectById([], $base, $selector[1]);
        } else $$from = $base;
        // process the stream
        var j = 0, $token, $filter, $arguments, $cacheSelector = "";
        while (j < $selector.length) {
            $token = $selector[j++];
            $filter = $selector[j++];
            $cacheSelector += $token + $filter;
            // some pseudo-classes allow arguments to be passed
            //  e.g. nth-child(even)
            $arguments = "";
            if ($selector[j] == "(") {
                while ($selector[j++] != ")" && j < $selector.length) {
                    $arguments += $selector[j];
                }
                $arguments = $arguments.slice(0, -1);
                $cacheSelector += "(" + $arguments + ")";
            }
            // process a token/filter pair use cached results if possible
            $$from = ($useCache && cache[$cacheSelector]) ?
                cache[$cacheSelector] : select($$from, $token, $filter, $arguments);
            if ($useCache) cache[$cacheSelector] = $$from;
        }
        $match = $match.concat($$from);
    }
    delete cssQuery.error;
    return $match;
} catch ($error) {
    cssQuery.error = $error;
    return [];
}};

// -----------------------------------------------------------------------
// public interface
// -----------------------------------------------------------------------

cssQuery.toString = function() {
    return "function cssQuery() {\n  [version " + version + "]\n}";
};

// caching
var cache = {};
cssQuery.caching = false;
cssQuery.clearCache = function($selector) {
    if ($selector) {
        $selector = _toStream($selector).join("");
        delete cache[$selector];
    } else cache = {};
};

// allow extensions
var modules = {};
var loaded = false;
cssQuery.addModule = function($name, $script) {
    if (loaded) eval("$script=" + String($script));
    modules[$name] = new $script();;
};

// hackery
cssQuery.valueOf = function($code) {
    return $code ? eval($code) : this;
};

// -----------------------------------------------------------------------
// declarations
// -----------------------------------------------------------------------

var selectors = {};
var pseudoClasses = {};
// a safari bug means that these have to be declared here
var AttributeSelector = {match: /\[([\w-]+(\|[\w-]+)?)\s*(\W?=)?\s*([^\]]*)\]/};
var attributeSelectors = [];

// -----------------------------------------------------------------------
// selectors
// -----------------------------------------------------------------------

// descendant selector
selectors[" "] = function($results, $from, $tagName, $namespace) {
    // loop through current selection
    var $element, i, j;
    for (i = 0; i < $from.length; i++) {
        // get descendants
        var $subset = getElementsByTagName($from[i], $tagName, $namespace);
        // loop through descendants and add to results selection
        for (j = 0; ($element = $subset[j]); j++) {
            if (thisElement($element) && compareNamespace($element, $namespace))
                $results.push($element);
        }
    }
};

// ID selector
selectors["#"] = function($results, $from, $id) {
    // loop through current selection and check ID
    var $element, j;
    for (j = 0; ($element = $from[j]); j++) if ($element.id == $id) $results.push($element);
};

// class selector
selectors["."] = function($results, $from, $className) {
    // create a RegExp version of the class
    $className = new RegExp("(^|\\s)" + $className + "(\\s|$)");
    // loop through current selection and check class
    var $element, i;
    for (i = 0; ($element = $from[i]); i++)
        if ($className.test($element.className)) $results.push($element);
};

// pseudo-class selector
selectors[":"] = function($results, $from, $pseudoClass, $arguments) {
    // retrieve the cssQuery pseudo-class function
    var $test = pseudoClasses[$pseudoClass], $element, i;
    // loop through current selection and apply pseudo-class filter
    if ($test) for (i = 0; ($element = $from[i]); i++)
        // if the cssQuery pseudo-class function returns "true" add the element
        if ($test($element, $arguments)) $results.push($element);
};

// -----------------------------------------------------------------------
// pseudo-classes
// -----------------------------------------------------------------------

pseudoClasses["link"] = function($element) {
    var $document = getDocument($element);
    if ($document.links) for (var i = 0; i < $document.links.length; i++) {
        if ($document.links[i] == $element) return true;
    }
};

pseudoClasses["visited"] = function($element) {
    // can't do this without jiggery-pokery
};

// -----------------------------------------------------------------------
// DOM traversal
// -----------------------------------------------------------------------

// IE5/6 includes comments (LOL) in it's elements collections.
// so we have to check for this. the test is tagName != "!". LOL (again).
var thisElement = function($element) {
    return ($element && $element.nodeType == 1 && $element.tagName != "!") ? $element : null;
};

// return the previous element to the supplied element
//  previousSibling is not good enough as it might return a text or comment node
var previousElementSibling = function($element) {
    while ($element && ($element = $element.previousSibling) && !thisElement($element)) continue;
    return $element;
};

// return the next element to the supplied element
var nextElementSibling = function($element) {
    while ($element && ($element = $element.nextSibling) && !thisElement($element)) continue;
    return $element;
};

// return the first child ELEMENT of an element
//  NOT the first child node (though they may be the same thing)
var firstElementChild = function($element) {
    return thisElement($element.firstChild) || nextElementSibling($element.firstChild);
};

var lastElementChild = function($element) {
    return thisElement($element.lastChild) || previousElementSibling($element.lastChild);
};

// return child elements of an element (not child nodes)
var childElements = function($element) {
    var $childElements = [];
    $element = firstElementChild($element);
    while ($element) {
        $childElements.push($element);
        $element = nextElementSibling($element);
    }
    return $childElements;
};

// -----------------------------------------------------------------------
// browser compatibility
// -----------------------------------------------------------------------

// all of the functions in this section can be overwritten. the default
//  configuration is for IE. The functions below reflect this. standard
//  methods are included in a separate module. It would probably be better
//  the other way round of course but this makes it easier to keep IE7 trim.

var isMSIE = true;

var isXML = function($element) {
    var $document = getDocument($element);
    return (typeof $document.mimeType == "unknown") ?
        /\.xml$/i.test($document.URL) :
        Boolean($document.mimeType == "XML Document");
};

// return the element's containing document
var getDocument = function($element) {
    return $element.ownerDocument || $element.document;
};

var getElementsByTagName = function($element, $tagName) {
    return ($tagName == "*" && $element.all) ? $element.all : $element.getElementsByTagName($tagName);
};

var compareTagName = function($element, $tagName, $namespace) {
    if ($tagName == "*") return thisElement($element);
    if (!compareNamespace($element, $namespace)) return false;
    if (!isXML($element)) $tagName = $tagName.toUpperCase();
    return $element.tagName == $tagName;
};

var compareNamespace = function($element, $namespace) {
    return !$namespace || ($namespace == "*") || ($element.scopeName == $namespace);
};

var getTextContent = function($element) {
    return $element.innerText;
};

function _msie_selectById($results, $from, id) {
    var $match, i, j;
    for (i = 0; i < $from.length; i++) {
        if ($match = $from[i].all.item(id)) {
            if ($match.id == id) $results.push($match);
            else if ($match.length != null) {
                for (j = 0; j < $match.length; j++) {
                    if ($match[j].id == id) $results.push($match[j]);
                }
            }
        }
    }
    return $results;
};

// for IE5.0
if (![].push) Array.prototype.push = function() {
    for (var i = 0; i < arguments.length; i++) {
        this[this.length] = arguments[i];
    }
    return this.length;
};

// -----------------------------------------------------------------------
// query support
// -----------------------------------------------------------------------

// select a set of matching elements.
// "from" is an array of elements.
// "token" is a character representing the type of filter
//  e.g. ">" means child selector
// "filter" represents the tag name, id or class name that is being selected
// the function returns an array of matching elements
var $NAMESPACE = /\|/;
function select($$from, $token, $filter, $arguments) {
    if ($NAMESPACE.test($filter)) {
        $filter = $filter.split($NAMESPACE);
        $arguments = $filter[0];
        $filter = $filter[1];
    }
    var $results = [];
    if (selectors[$token]) {
        selectors[$token]($results, $$from, $filter, $arguments);
    }
    return $results;
};

// -----------------------------------------------------------------------
// parsing
// -----------------------------------------------------------------------

// convert css selectors to a stream of tokens and filters
//  it's not a real stream. it's just an array of strings.
var $STANDARD_SELECT = /^[^\s>+~]/;
var $$STREAM = /[\s#.:>+~()@]|[^\s#.:>+~()@]+/g;
function _toStream($selector) {
    if ($STANDARD_SELECT.test($selector)) $selector = " " + $selector;
    return $selector.match($$STREAM) || [];
};

var $WHITESPACE = /\s*([\s>+~(),]|^|$)\s*/g;
var $IMPLIED_ALL = /([\s>+~,]|[^(]\+|^)([#.:@])/g;
var parseSelector = function($selector) {
    return $selector
    // trim whitespace
    .replace($WHITESPACE, "$1")
    // e.g. ".class1" --> "*.class1"
    .replace($IMPLIED_ALL, "$1*$2");
};

var Quote = {
    toString: function() {return "'"},
    match: /^('[^']*')|("[^"]*")$/,
    test: function($string) {
        return this.match.test($string);
    },
    add: function($string) {
        return this.test($string) ? $string : this + $string + this;
    },
    remove: function($string) {
        return this.test($string) ? $string.slice(1, -1) : $string;
    }
};

var getText = function($text) {
    return Quote.remove($text);
};

var $ESCAPE = /([\/()[\]?{}|*+-])/g;
function regEscape($string) {
    return $string.replace($ESCAPE, "\\$1");
};

// -----------------------------------------------------------------------
// modules
// -----------------------------------------------------------------------

// -------- >>      insert modules here for packaging       << -------- \\

loaded = true;

// -----------------------------------------------------------------------
// return the query function
// -----------------------------------------------------------------------

return cssQuery;

}(); // cssQuery
/*
    cssQuery, version 2.0.2 (2005-08-19)
    Copyright: 2004-2005, Dean Edwards (http://dean.edwards.name/)
    License: http://creativecommons.org/licenses/LGPL/2.1/
*/

cssQuery.addModule("css-standard", function() { // override IE optimisation

// cssQuery was originally written as the CSS engine for IE7. It is
//  optimised (in terms of size not speed) for IE so this module is
//  provided separately to provide cross-browser support.

// -----------------------------------------------------------------------
// browser compatibility
// -----------------------------------------------------------------------

// sniff for Win32 Explorer
isMSIE = eval("false;/*@cc_on@if(@\x5fwin32)isMSIE=true@end@*/");

if (!isMSIE) {
    getElementsByTagName = function($element, $tagName, $namespace) {
        return $namespace ? $element.getElementsByTagNameNS("*", $tagName) :
            $element.getElementsByTagName($tagName);
    };

    compareNamespace = function($element, $namespace) {
        return !$namespace || ($namespace == "*") || ($element.prefix == $namespace);
    };

    isXML = document.contentType ? function($element) {
        return /xml/i.test(getDocument($element).contentType);
    } : function($element) {
        return getDocument($element).documentElement.tagName != "HTML";
    };

    getTextContent = function($element) {
        // mozilla || opera || other
        return $element.textContent || $element.innerText || _getTextContent($element);
    };

    function _getTextContent($element) {
        var $textContent = "", $node, i;
        for (i = 0; ($node = $element.childNodes[i]); i++) {
            switch ($node.nodeType) {
                case 11: // document fragment
                case 1: $textContent += _getTextContent($node); break;
                case 3: $textContent += $node.nodeValue; break;
            }
        }
        return $textContent;
    };
}
}); // addModule


//------------------------------------------------------------------------------
//  TOGLE
//------------------------------------------------------------------------------
var toggle = {
  show : function() {
    for ( i=0; i < arguments.length; i++ ) {
      $(arguments[i]).style.display = '';
    }
  },
  hide : function() {
    for ( i=0; i < arguments.length; i++ ) {
      $(arguments[i]).style.display = 'none';
    }
  }
};

//------------------------------------------------------------------------------
//  COOKIE
//------------------------------------------------------------------------------
function getCookie( name ) {
  var start = document.cookie.indexOf( name + "=" );
  var len = start + name.length + 1;
  if ( ( !start ) && ( name != document.cookie.substring( 0, name.length ) ) ) {
    return null;
  }
  if ( start == -1 ) return null;
  var end = document.cookie.indexOf( ';', len );
  if ( end == -1 ) end = document.cookie.length;
  return unescape( document.cookie.substring( len, end ) );
}

function setCookie( name, value, expires, path, domain, secure ) {
  var today = new Date();
  today.setTime( today.getTime() );
  if ( expires ) {
    expires = expires * 1000 * 60 * 60 * 24;
  }
  var expires_date = new Date( today.getTime() + (expires) );
  document.cookie = name+'='+escape( value ) +
    ( ( expires ) ? ';expires='+expires_date.toGMTString() : '' ) + //expires.toGMTString()
    ( ( path ) ? ';path=' + path : '' ) +
    ( ( domain ) ? ';domain=' + domain : '' ) +
    ( ( secure ) ? ';secure' : '' );
}

function deleteCookie( name, path, domain ) {
  if ( getCookie( name ) ) document.cookie = name + '=' +
      ( ( path ) ? ';path=' + path : '') +
      ( ( domain ) ? ';domain=' + domain : '' ) +
      ';expires=Thu, 01-Jan-1970 00:00:01 GMT';
}
//------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------




//! reach dialog(html)
// msg[, att]
function ShowMessage(){
  if(count(arguents) = 1){
    att = {};
  }
  att = array_merge(att, {});
}


/*

The first and most important code in forms validation is an event handler in the form tag.
This event handler, onSubmit, must return true for the form to be submited:

    <FORM
     NAME = "theform"
     ACTION = "mailto:"
     METHOD = "POST"
     ENCTYPE = "multipart/form-data"
     onSubmit="return formCheck()">

When the submit button is pressed, the event handler is triggered; it in turn
runs function formCheck() which makes sure there are no errors in the form:

    function formCheck()
    {
        if (document.theform.email.value.indexOf("@") == -1 ||
            document.theform.email.value == "")
        {
        alert("Please include a proper email address.");
        return false;
        }

        if (document.theform.user_name.value == "")
        {
        alert("Please put in a name.");
        return false;
        }
    }

//------------------------------------------------------------------------
function plugdetect(plugName)
{
         if (navigator.plugins[plugName]) return true;
         else return false;
}

Use an if statement similiar to this one combined with the above function to detect plugins, putting the plugin name in place of "LiveAudio":

        if (plugdetect("LiveAudio") == true)
        document.write("have the LiveAudio plugin");
        else document.write("do not have the LiveAudio plugin");



*/

function addslashes(str) {
str=str.replace(/\'/g,'\\\'');
str=str.replace(/\"/g,'\\"');
str=str.replace(/\\/g,'\\\\');
str=str.replace(/\0/g,'\\0');
return str;
}
function stripslashes(str) {
str=str.replace(/\\'/g,'\'');
str=str.replace(/\\"/g,'"');
str=str.replace(/\\\\/g,'\\');
str=str.replace(/\\0/g,'\0');
return str;
}

// Copyright © 2001 by Apple Computer, Inc., All Rights Reserved.
//
// You may incorporate this Apple sample code into your own code
// without restriction. This Apple sample code has been provided "AS IS"
// and the responsibility for its operation is yours. You may redistribute
// this code, but you are not permitted to redistribute it as
// "Apple sample code" after having made changes.

// ugly workaround for missing support for selectorText in Netscape6/Mozilla
// call onLoad() or before you need to do anything you would have otherwise used
// selectorText for.
var ugly_selectorText_workaround_flag = false;
var allStyleRules;
// code developed using the following workaround (CVS v1.15) as an example.
// http://lxr.mozilla.org/seamonkey/source/extensions/xmlterm/ui/content/XMLTermCommands.js
function ugly_selectorText_workaround() {
  if((navigator.userAgent.indexOf("Gecko") == -1) ||
     (ugly_selectorText_workaround_flag)) {
    return; // we've already been here or shouldn't be here
  }
  var styleElements = document.getElementsByTagName("style");

  for(var i = 0; i < styleElements.length; i++) {
    var styleText = styleElements[i].firstChild.data;
    // this should be using match(/\b[\w-.]+(?=\s*\{)/g but ?= causes an
    // error in IE5, so we include the open brace and then strip it
    allStyleRules = styleText.match(/\b[\w-.]+(\s*\{)/g);
  }

  for(var i = 0; i < allStyleRules.length; i++) {
    // probably insufficient for people who like random gobs of
    // whitespace in their styles
    allStyleRules[i] = allStyleRules[i].substr(0, (allStyleRules[i].length - 2));
  }
  ugly_selectorText_workaround_flag = true;
}


// setStyleById: given an element id, style property and
// value, apply the style.
// args:
//  i - element id
//  p - property
//  v - value
//
function setStyleById(i, p, v) {
  var n = document.getElementById(i);
  n.style[p] = v;
}

// getStyleById: given an element ID and style property
// return the current setting for that property, or null.
// args:
//  i - element id
//  p - property
function getStyleById(i, p) {
  var n = document.getElementById(i);
  var s = eval("n.style." + p);

  // try inline
  if((s != "") && (s != null)) {
    return s;
  }

  // try currentStyle
  if(n.currentStyle) {
    var s = eval("n.currentStyle." + p);
    if((s != "") && (s != null)) {
      return s;
    }
  }

  // try styleSheets
  var sheets = document.styleSheets;
  if(sheets.length > 0) {
    // loop over each sheet
    for(var x = 0; x < sheets.length; x++) {
      // grab stylesheet rules
      var rules = sheets[x].cssRules;
      if(rules.length > 0) {
        // check each rule
        for(var y = 0; y < rules.length; y++) {
          var z = rules[y].style;
          // selectorText broken in NS 6/Mozilla: see
          // http://bugzilla.mozilla.org/show_bug.cgi?id=51944
          ugly_selectorText_workaround();
          if(allStyleRules) {
            if(allStyleRules[y] == i) {
              return z[p];
            }
          } else {
            // use the native selectorText and style stuff
            if(((z[p] != "") && (z[p] != null)) ||
               (rules[y].selectorText == i)) {
              return z[p];
            }
          }
        }
      }
    }
  }
  return null;
}

// setStyleByClass: given an element type and a class selector,
// style property and value, apply the style.
// args:
//  t - type of tag to check for (e.g., SPAN)
//  c - class name
//  p - CSS property
//  v - value
var ie = (document.all) ? true : false;

function setStyleByClass(t,c,p,v){
  var elements;
  if(t == '*') {
    // '*' not supported by IE/Win 5.5 and below
    elements = (ie) ? document.all : document.getElementsByTagName('*');
  } else {
    elements = document.getElementsByTagName(t);
  }
  for(var i = 0; i < elements.length; i++){
    var node = elements.item(i);
    for(var j = 0; j < node.attributes.length; j++) {
      if(node.attributes.item(j).nodeName == 'class') {
        if(node.attributes.item(j).nodeValue == c) {
          eval('node.style.' + p + " = '" +v + "'");
        }
      }
    }
  }
}

// getStyleByClass: given an element type, a class selector and a property,
// return the value of the property for that element type.
// args:
//  t - element type
//  c - class identifier
//  p - CSS property
function getStyleByClass(t, c, p) {
  // first loop over elements, because if they've been modified they
  // will contain style data more recent than that in the stylesheet
  var elements;
  if(t == '*') {
    // '*' not supported by IE/Win 5.5 and below
    elements = (ie) ? document.all : document.getElementsByTagName('*');
  } else {
    elements = document.getElementsByTagName(t);
  }
  for(var i = 0; i < elements.length; i++){
    var node = elements.item(i);
    for(var j = 0; j < node.attributes.length; j++) {
      if(node.attributes.item(j).nodeName == 'class') {
        if(node.attributes.item(j).nodeValue == c) {
          var theStyle = eval('node.style.' + p);
          if((theStyle != "") && (theStyle != null)) {
            return theStyle;
          }
        }
      }
    }
  }
  // if we got here it's because we didn't find anything
  // try styleSheets
  var sheets = document.styleSheets;
  if(sheets.length > 0) {
    // loop over each sheet
    for(var x = 0; x < sheets.length; x++) {
      // grab stylesheet rules
      var rules = sheets[x].cssRules;
      if(rules.length > 0) {
        // check each rule
        for(var y = 0; y < rules.length; y++) {
          var z = rules[y].style;
          // selectorText broken in NS 6/Mozilla: see
          // http://bugzilla.mozilla.org/show_bug.cgi?id=51944
          ugly_selectorText_workaround();
          if(allStyleRules) {
            if((allStyleRules[y] == c) ||
               (allStyleRules[y] == (t + "." + c))) {
              return z[p];
            }
          } else {
            // use the native selectorText and style stuff
            if(((z[p] != "") && (z[p] != null)) &&
               ((rules[y].selectorText == c) ||
                (rules[y].selectorText == (t + "." + c)))) {
              return z[p];
            }
          }
        }
      }
    }
  }

  return null;
}

// setStyleByTag: given an element type, style property and
// value, and whether the property should override inline styles or
// just global stylesheet preferences, apply the style.
// args:
//  e - element type or id
//  p - property
//  v - value
//  g - boolean 0: modify global only; 1: modify all elements in document
function setStyleByTag(e, p, v, g) {
  if(g) {
    var elements = document.getElementsByTagName(e);
    for(var i = 0; i < elements.length; i++) {
      elements.item(i).style[p] = v;
    }
  } else {
    var sheets = document.styleSheets;
    if(sheets.length > 0) {
      for(var i = 0; i < sheets.length; i++) {
        var rules = sheets[i].cssRules;
        if(rules.length > 0) {
          for(var j = 0; j < rules.length; j++) {
            var s = rules[j].style;
            // selectorText broken in NS 6/Mozilla: see
            // http://bugzilla.mozilla.org/show_bug.cgi?id=51944
            ugly_selectorText_workaround();
            if(allStyleRules) {
              if(allStyleRules[j] == e) {
                s[p] = v;
              }
            } else {
              // use the native selectorText and style stuff
              if(((s[p] != "") && (s[p] != null)) &&
                 (rules[j].selectorText == e)) {
                s[p] = v;
              }
            }

          }
        }
      }
    }
  }
}

// getStyleByTag: given an element type and style property, return
// the property's value
// args:
//  e - element type
//  p - property
function getStyleByTag(e, p) {
  var sheets = document.styleSheets;
  if(sheets.length > 0) {
    for(var i = 0; i < sheets.length; i++) {
      var rules = sheets[i].cssRules;
      if(rules.length > 0) {
        for(var j = 0; j < rules.length; j++) {
          var s = rules[j].style;
          // selectorText broken in NS 6/Mozilla: see
          // http://bugzilla.mozilla.org/show_bug.cgi?id=51944
          ugly_selectorText_workaround();
          if(allStyleRules) {
            if(allStyleRules[j] == e) {
              return s[p];
            }
          } else {
            // use the native selectorText and style stuff
            if(((s[p] != "") && (s[p] != null)) &&
               (rules[j].selectorText == e)) {
              return s[p];
            }
          }

        }
      }
    }
  }

  // if we don't find any style sheets, return the value for the first
  // element of this type we encounter without a CLASS or STYLE attribute
  var elements = document.getElementsByTagName(e);
  var sawClassOrStyleAttribute = false;
  for(var i = 0; i < elements.length; i++) {
    var node = elements.item(i);
    for(var j = 0; j < node.attributes.length; j++) {
      if((node.attributes.item(j).nodeName == 'class') ||
         (node.attributes.item(j).nodeName == 'style')){
         sawClassOrStyleAttribute = true;
      }
    }
    if(! sawClassOrStyleAttribute) {
      return elements.item(i).style[p];
    }
  }
}
// end css manipulation


// cross browser css retrieve
<head>
<style type="text/css">
#test{
width: 100px;
height: 80px;
background-color: yellow;
}
</style>
</head>

<body>
<div id="test">This is some text</div>

<script type="text/javascript">

var mydiv=document.getElementById("test")

function cascadedstyle(el, cssproperty, csspropertyNS){
if (el.currentStyle)
return el.currentStyle[cssproperty]
else if (window.getComputedStyle){
var elstyle=window.getComputedStyle(el, "")
return elstyle.getPropertyValue(csspropertyNS)
}
}

alert(cascadedstyle(mydiv, "backgroundColor", "background-color")) //alerts "yellow"
</script>
</body>
// end css property


// funzione Test
function Test(){
  // parametro pubblico
  this.parametro = "Ciao Mondo";
  // parametro privato
  var parametro = "Ciao Mondo Parallelo";
  // global
  count = 0;
  // same global
  window.count = 0;

  // metodo pubblico
  this.leggiParametro = function() {
    alert(parametro);
  };
  // METODO PRIVATO
  function leggi(){}

};

// inheritance in js...
function Test() {
  this.saluta = function() {
    alert("Ciao");
  };
  this.salutaTest = function() {
    alert("Ciao Test");
  };
};
function SubTest() {
  this.saluta = function() {
    alert("Ciao SubTest");
  };
};
SubTest.prototype = new Test;

var subtest = new SubTest();

subtest.saluta();	// Ciao SubTest
subtest.salutaTest();	// Ciao Test

//
//     INHERITANCE
//
function Test() {
  this.saluta = function() {
    alert("Ciao");
  };
  this.salutaTest = function() {
    alert("Ciao Test");
  };
  this.getNested = function(saluto) {
    function getNested(message){alert(message)};
    this.salutoInCostruzione = saluto;
    this.saluta = function() {
      getNested(this.salutoInCostruzione);
    };
  };
  this.salutaDallaSub = function() {
    this.saluta();				// Ciao SubTest
  };
};
function SubTest() {
  this.saluta = function() {
    alert("Ciao SubTest");
  };
  this.salutaSuperNested = function() {
    var super = new this.constructor();
    super.saluta();				// Ciao
    new super.getNested("Nested").saluta();	// Nested
  };
};
SubTest.prototype = new Test;

var subtest = new SubTest();

subtest.saluta();		// Ciao SubTest
subtest.salutaTest();		// Ciao Test
subtest.salutaSuperNested();	// Ciao, Nested
subtest.salutaDallaSub();	// Ciao SubTest


//--------------------------------------------------------------------------
/* Made by Mathias Bynens <http://mathiasbynens.be/> */
// string number_format ( float number [, int decimals [, string dec_point, string thousands_sep]] )
// number_format() returns a formatted version of number
function number_format(num, dec, dp, thousands_sep) {
 var num = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
 var e = num + '';
 var f = e.split('.');
 var g, h, i;
 if (!f[0]) {
  f[0] = '0';
 }
 if (!f[1]) {
  f[1] = '';
 }
 if (f[1].length < dec) {
  g = f[1];
  for (i=f[1].length + 1; i <= dec; i++) {
   g += '0';
  }
  f[1] = g;
 }
 if(thousands_sep != '' && f[0].length > 3) {
  h = f[0];
  f[0] = '';
  for(j = 3; j < h.length; j+=3) {
   i = h.slice(h.length - j, h.length - j + 3);
   f[0] = thousands_sep + i +  f[0] + '';
  }
  j = h.substr(0, (h.length % 3 == 0) ? 3 : (h.length % 3));
  f[0] = j + f[0];
 }
 dp = (dec <= 0) ? '' : dp;
 return f[0] + dp + f[1];
}

//--------------------------------------------------------------------------
//! restituisce il valore di una select
// non credo funzioni con select multiple
function form_select_value(select_id){
  return $(select_id).options[$(select_id).selectedIndex].value;
}

function form_input_disable(id, disabled){
  var sel = $(id);
  if( sel != null){
    sel.readOnly = !disabled;
    sel.disabled = !disabled;
  }
}

function form_input_enable(id, enabled){
  var sel = $(id);
  if( sel != null){
    sel.readOnly = !enabled;
    sel.disabled = !enabled;
  }
}
//--------------------------------------------------------------------------
function print(s){
  document.write(s);
}

function echo(s, id){
  if(id){
    document.getElementById(id).innerHTML = s;
  } else {
    document.write(s);
  }
}

/*
RConn - Simple XMLHTTP Interface - bfults@gmail.com - 2005-04-08
Code licensed under Creative Commons Attribution-ShareAlike License
http://creativecommons.org/licenses/by-sa/2.0/
*/
function RConn() {
  var xmlhttp = false;
  var bComplete = false;

  try {
    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) {
    try {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (e) {
      try {
        xmlhttp = new XMLHttpRequest();
      } catch (e) {
        xmlhttp = false;
      }
    }
  }
  if (!xmlhttp) return null;

  this.open = function(url, param, fnDone) {
    // astrarre
    sMethod = "GET";
    sMethod = sMethod.toUpperCase();

    if (!xmlhttp) return false;
    bComplete = false;

    try {
    this.OnRequestBegin();
      if (sMethod == "GET") {
        //asinc
        xmlhttp.open(sMethod, url, true);
      } else {
        xmlhttp.open(sMethod, url, true);
        xmlhttp.setRequestHeader("Method", "POST "+url+" HTTP/1.1");
        xmlhttp.setRequestHeader("Content-Type",
          "application/x-www-form-urlencoded");
      }
      xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4 && !bComplete) {
          // qui occorre testare se esistono errori dalla risposta
          bComplete = true;
          //this.OnRequestEnd(); // in questo contesto non è visibile!
          html_set_visible('ajax_notification', false);
          fnDone(xmlhttp);
        }
      };
      xmlhttp.send(/*sVars*/ null);
    } catch(z) {
      return false;
    }
    return true;
  };

  return this;
}

RConn.prototype.OnRequestBegin = function(){
  html_set_visible('ajax_notification', true);
}

RConn.prototype.OnRequestEnd = function(){
  html_set_visible('ajax_notification', false);
}


// param= {url: , method: , }
function r_call(url, param, call_back){
  var o = new RConn();
  o.open(url, param,  call_back);
}

function r_include(url, param, id) {
  var o = new RConn();
  o.open(url, param, function(xmlhttp) {
        document.getElementById(id).innerHTML = xmlhttp.responseText;
      }
    );
}
// ottieni dati da remoto in forma di oggetto
function r_data(url, param, call_back) {
  var o = new RConn();
  o.open(url, param, function(xmlhttp) {
        call_back(unserialize(xmlhttp.responseText));
      }
    );
}
/*
  First off—I fully understand and agree to the point of not extending language functionality. That said I think the point in relation to javascript and inheritance is often misunderstood. It is central to javascript that it is a “typeless objectoriented language”. This goes for ECMAscript3.0 all the same. Where people most often get it wrong is when they mistake prototypes for classes—they are not.
  In a typed OO-language the objects code lies with the class—objects are just instances. In js, the code lies in the object. Therefore, the object is not tied to the prototype. It is ok in js to manipulate the prototype runtime, even after objects has been instantiated. Consider doing that with a typed language.
  Anyway. I have been working a lot with js recently, and found that one-level inheritance is simple enough using prototypes, but further inheritance cause trouble. I guess you came to the same conclusion with JPSpan. My first googling on the subject turned up a lot of wierd hacks, that I don’t appreciate. I eventually invented a solution witch I use, and witch I’m very happy with. It may look as a hack, but it works so well, that I kind of forgive it for that.
  To defend myself further I’ll point out that it’s not a language extension, if you just understand what it does. It’s merely a utility that extends a prototype—Which should not be confused with class inheritance (though the result is the same).

1. When you call copyPrototype matters, as already mentioned. In practice it means you’re best off calling it immediately after declaring a child constructor.

2. Do not declare a toString method for the parent class Function object as this may break the regular expression in copyPrototype. You can still modify a parent prototype without doing any harm though. In other words this will break copyPrototype;
Animal.toString = function() {
    return "this is an animal";
}

*/
function copyPrototype(descendant, parent) {
    var sConstructor = parent.toString();
    var aMatch = sConstructor.match( /\s*function (.*)\(/ );
    if ( aMatch != null ) { descendant.prototype[aMatch[1]] = parent; }
    for (var m in parent.prototype) {
        descendant.prototype[m] = parent.prototype[m];
    }
};


//------------------------------------------------------------------------------
// (C) Andrea Giammarchi - JSL 1.2
//------------------------------------------------------------------------------
var undefined;
function $JSL(){
  this.inArray=function(){
    var tmp=false,i=arguments[1].length;
    while(i&&!tmp)tmp=arguments[1][--i]===arguments[0];
    return tmp;
  };
  this.has=function(str){
    return $JSL.inArray(str,$has);
  }
  this.random=function(elm){
    var tmp=$JSL.$random();
    while(typeof(elm[tmp])!=="undefined")tmp=$JSL.$random();
    return tmp;
  };
  this.$random=function(){return (Math.random()*123456789).toString()};
  this.reverse=function(str){return str.split("").reverse().join("");};
  this.replace=function(str){
    var tmp=str.split(""),i=tmp.length;
    while(i>0)tmp[--i]=$JSL.$replace(tmp[i]);
    return tmp.join("");
  };
  this.$replace=function(tmp){
    switch(tmp) {
      case "\n":tmp="\\n";break;
      case "\r":tmp="\\r";break;
      case "\t":tmp="\\t";break;
      case "\b":tmp="\\b";break;
      case "\f":tmp="\\f";break;
      case "\\":tmp="\\\\";break;
      case "\"":tmp="\\\"";break;
      default:
        tmp=tmp.replace(/([\x00-\x07]|[\x0E-\x1F]|[\x7F-\xFF])/g,function(a,b){return "\\x"+$JSL.charCodeAt(b)});
        tmp=tmp.replace(/([\x100-\xFFFF])/g,function(a,b){b=$JSL.charCodeAt(b);return b.length<4?"\\u0"+b:"\\u"+b});
        break;
    };
    return tmp;
  };
  this.charCodeAt=function(str){return $JSL.$charCodeAt(str.charCodeAt(0));};
  this.$charCodeAt=function(i){
    var str=i.toString(16).toUpperCase();
    return str.length<2?"0"+str:str;
  };
  this.$toSource=function(elm){return elm.toSource().replace(/^(\(new \w+\()([^\000]+)(\)\))$/,"$2");};
  this.$toInternalSource=function(elm){
    var tmp=null;
    switch(elm.constructor) {
      case Boolean:
      case Number:
        tmp=elm;
        break;
      case String:
        tmp=$JSL.$toSource(elm);
        break;
      default:
        tmp=elm.toSource();
        break;
    };
    return tmp;
  };
  this.getElementsByTagName=function(scope,i,elm,str){
    var tmp=$JSL.$getElementsByTagName(scope),j=tmp.length,$tmp=[];
    while(i<j){if(tmp[i][str]===elm)$tmp.push($JSL.$getElementsByName(tmp[i]));++i};
    return $tmp;
  };
  this.$getElementsByTagName=function(scope){return scope.layers||scope.all;};
  this.$getElementsByName=function(elm) {
    if(!elm.getElementsByTagName)	elm.getElementsByTagName=document.getElementsByTagName;
    return elm;
  };
  this.encodeURI=function(str){return str.replace(/"/g,"%22").replace(/\\/g,"%5C")};
  this.$encodeURI=function(str){
    return $JSL.$charCodeAt(str);
  };
  this.$encodeURIComponent=function(a,b){
    var i=b.charCodeAt(0),str=[];
    if(i<128)		str.push(i);
    else if(i<2048)		str.push(0xC0+(i>>6),0x80+(i&0x3F));
    else if(i<65536)	str.push(0xE0+(i>>12),0x80+(i>>6&0x3F),0x80+(i&0x3F));
    else			str.push(0xF0+(i>>18),0x80+(i>>12&0x3F),0x80+(i>>6&0x3F),0x80+(i&0x3F));
    return "%"+str.map($JSL.$encodeURI).join("%");
  };
  this.$decodeURIComponent=function(a,b,c,d,e){
    var i=0;
    if(e)	  i=parseInt(e.substr(1,2),16);
    else if(d)i=((parseInt(d.substr(1,2),16)-0xC0)<<6)+(parseInt(d.substr(4,2),16)-0x80);
    else if(c)i=((parseInt(c.substr(1,2),16)-0xE0)<<12)+((parseInt(c.substr(4,2),16)-0x80)<<6)+(parseInt(c.substr(7,2),16)-0x80);
    else	  i=((parseInt(b.substr(1,2),16)-0xF0)<<18)+((parseInt(b.substr(4,2),16)-0x80)<<12)+((parseInt(b.substr(7,2),16)-0x80)<<6)+(parseInt(b.substr(10,2),16)-0x80);
    return String.fromCharCode(i);
  };
  var $has=[];
  if(!Object.prototype.toSource){
    $has[$has.length]="toSource";
    Object.prototype.toSource=function(){
    var str=[];
    switch(this.constructor) {
      case Boolean:
        str.push("(new Boolean(",this,"))");
        break;
      case Number:
        str.push("(new Number(",this,"))");
        break;
      case String:
        str.push("(new String(\"",$JSL.replace(this),"\"))");
        break;
      case Date:
        str.push("(new Date(",this.getTime(),"))");
        break;
      case Error().constructor:
        str.push("(new Error(",$JSL.$toSource(this.message),",",$JSL.$toSource(this.fileName),",",this.lineNumber,"))");
        break;
      case Function:
        str.push("(",$JSL.$replace(this.toString()),")");
        break;
      case Array:
        var i=0,j=this.length;
        while(i<j)	str.push($JSL.$toInternalSource(this[i++]));
        str=["[",str.join(", "),"]"];
        break;
      default:
        var i=0,tmp;
        for(i in this){if(i!=="toSource")
          str.push($JSL.$toSource(i)+":"+$JSL.$toInternalSource(this[i]));
        };
        str=["{",str.join(", "),"}"];
        break;
    };
    return str.join("");
  }
  };
  if(!Array.prototype.pop){$has[$has.length]="pop";Array.prototype.pop=function(){
    var a=this.length,r=this[--a];
    if(a>=0)this.length=a;
    return r;
  }};
  if(!Array.prototype.push){$has[$has.length]="push";Array.prototype.push=function(){
    var a=0,b=arguments.length,r=this.length;
    while(a<b)this[r++]=arguments[a++];
    return r;
  }};
  if(!Array.prototype.shift){$has[$has.length]="shift";Array.prototype.shift=function(){
    this.reverse();
    var r=this.pop();
    this.reverse();
    return r;
  }};
  if(!Array.prototype.splice){$has[$has.length]="splice";Array.prototype.splice=function(){
    var a,b,c,d=arguments.length,tmp=[];
    if(d>1){
      arguments[0]=parseInt(arguments[0]);
      arguments[1]=parseInt(arguments[1]);
      c=arguments[0]+arguments[1];
      for(a=0,b=this.length;a<b;a++){
        if(a<arguments[0]||a>=c){
          if(a===c&&d>2){
            for(a=2;a<d;a++)tmp.push(arguments[a]);
            a=c;
          };
          tmp.push(this[a]);
        };
      };
      for(a=0,b=tmp.length;a<b;a++)
        this[a]=tmp[a];
      this.length = a;
    }
  }};
  if(!Array.prototype.unshift){$has[$has.length]="unshift";Array.prototype.unshift=function(){
    var i=arguments.length;
    this.reverse();
    while(i>0)this.push(arguments[--i]);
    this.reverse();
    return this.length;
  }};
  if(!Array.prototype.indexOf){$has[$has.length]="indexOf";Array.prototype.indexOf=function(elm,i){
    var j=this.length;
    if(!i)i=0;
    if(i>=0){while(i<j){if(this[i++]===elm){
      i=i-1+j;j=i-j;
    }}}
    else
      j=this.indexOf(elm,j+i);
    return j!==this.length?j:-1;
  }};
  if(!Array.prototype.lastIndexOf){$has[$has.length]="lastIndexOf";Array.prototype.lastIndexOf=function(elm,i){
    var j=-1;
    if(!i)i=this.length;
    if(i>=0){do{if(this[i--]===elm){
      j=i+1;i=0;
    }}while(i>0)}
    else if(i>-this.length)
      j=this.lastIndexOf(elm,this.length+i);
    return j;
  }};
  if(!Array.prototype.every){$has[$has.length]="every";Array.prototype.every=function(callback,elm){
    var b=false,i=0,j=this.length;
    if(!elm){while(i<j&&!b)	b=!callback(this[i]||this.charAt(i),i++,this)}
    else {
      tmp=$JSL.random(elm);
      elm[tmp]=callback;
      while(i<j&&!b)	b=!elm[tmp](this[i]||this.charAt(i),i++,this);
      delete elm[tmp];
    }
    return !b;
  }};
  if(!Array.prototype.filter){
    $has[$has.length]="filter";
    Array.prototype.filter=function(callback,elm){
    var r=[],i=0,j=this.length,tmp;
    if(!elm){while(i<j){if(callback(this[i],i++,this))
      r.push(this[i-1]);
    }} else {
      tmp=$JSL.random(elm);
      elm[tmp]=callback;
      while(i<j){if(elm[tmp](this[i],i++,this))
        r.push(this[i-1]);
      };
      delete elm[tmp];
    }
    return r;
  }
  };
  if(!Array.prototype.forEach){$has[$has.length]="forEach";Array.prototype.forEach=function(callback,elm){
    var i=0,j=this.length,tmp;
    if(!elm){while(i<j)	callback(this[i],i++,this)}
    else {
      tmp=$JSL.random(elm);
      elm[tmp]=callback;
      while(i<j)	elm[tmp](this[i],i++,this);
      delete elm[tmp];
    }
  }};
  if(!Array.prototype.map){$has[$has.length]="map";Array.prototype.map=function(callback,elm){
    var r=[],i=0,j=this.length,tmp;
    if(!elm){while(i<j)	r.push(callback(this[i],i++,this))}
    else {
      tmp=$JSL.random(elm);
      elm[tmp]=callback;
      while(i<j)	r.push(elm[tmp](this[i],i++,this));
      delete elm[tmp];
    }
    return r;
  }};
  if(!Array.prototype.some){$has[$has.length]="some";Array.prototype.some=function(callback,elm){
    var b=false,i=0,j=this.length,tmp;
    if(!elm){while(i<j&&!b)	b=callback(this[i],i++,this)}
    else {
      tmp=$JSL.random(elm);
      elm[tmp]=callback;
      while(i<j&&!b)	b=elm[tmp](this[i],i++,this);
      delete elm[tmp];
    }
    return b;
  }};
  if(!Function.prototype.apply){$has[$has.length]="apply";Function.prototype.apply=function(){
    var i=arguments[1].length,str,tmp=[];
    if(!arguments[0])arguments[0]={};
    str=$JSL.random(arguments[0]);
    arguments[0][str]=this;
    while(i)tmp.unshift("arguments[1]["+(--i)+"]");
    tmp=eval("arguments[0][str]("+tmp.join(",")+")");
    delete arguments[0][str];
    return tmp;
  }};
  if(!Function.prototype.call){$has[$has.length]="call";Function.prototype.call=function(){
    var i=arguments.length,tmp=[];
    while(i>1)tmp.unshift(arguments[--i]);
    return this.apply(arguments[0],tmp);
  }};
  if(!String.prototype.lastIndexOf){if(!this.inArray("lastIndexOf",$has))$has[$has.length]="lastIndexOf";String.prototype.lastIndexOf=function(elm,i){
    var str=$JSL.reverse(this),elm=$JSL.reverse(elm),r=str.indexOf(elm,i);
    return r<0?r:this.length-r;
  }};
  if("aa".replace(/\w/g,function(){return arguments[1]+" "})!=="0 1 "){$has[$has.length]="replace";String.prototype.replace=function(replace){return function(reg,func){
    var r="",tmp=$JSL.random(String);
    String.prototype[tmp]=replace;
    if(func.constructor!==Function)
      r=this[tmp](reg,func);
    else {
      function getMatches(reg,pos,a) {
        function io() {
          var a=reg.indexOf("(",pos),b=a;
          while(a>0&&reg.charAt(--a)==="\\"){};
          pos=b!==-1?b+1:b;
          return (b-a)%2===1?1:0;
        };
        do{a+=io()}while(pos!==-1);
        return a;
      };
      function $replace(str){
        var j=str.length-1;
        while(j>0)str[--j]='"'+str[j].substr(1,str[j--].length-2)[tmp](/(\\|")/g,'\\$1')+'"';
        return str.join("");
      };
      var p=-1,i=getMatches(""+reg,0,0),args=[],$match=this.match(reg),elm=$JSL.$random()[tmp](/\./,'_AG_');
      while(this.indexOf(elm)!==-1)elm=$JSL.$random()[tmp](/\./,'_AG_');
      while(i)args[--i]=[elm,'"$',(i+1),'"',elm].join("");
      if(!args.length)r="$match[i],(p=this.indexOf($match[i++],p+1)),this";
      else		r="$match[i],"+args.join(",")+",(p=this.indexOf($match[i++],p+1)),this";
      r=eval('['+$replace((elm+('"'+this[tmp](reg,'"'+elm+',func('+r+'),'+elm+'"')+'"')+elm).split(elm))[tmp](/\n/g,'\\n')[tmp](/\r/g,'\\r')+'].join("")');
    };
    delete String.prototype[tmp];
    return r;
  }}(String.prototype.replace)};
  if((new Date().getYear()).toString().length===4){$has[$has.length]="getYear";Date.prototype.getYear=function(){
    return this.getFullYear()-1900;
  }};
};
$JSL=new $JSL();
if(typeof(encodeURI)==="undefined"){function encodeURI(str){
  var elm=/([\x00-\x20]|[\x25|\x3C|\x3E|\x5B|\x5D|\x5E|\x60|\x7F]|[\x7B-\x7D]|[\x80-\uFFFF])/g;
  return $JSL.encodeURI(str.replace(elm,$JSL.$encodeURIComponent));
}};
if(typeof(encodeURIComponent)==="undefined"){function encodeURIComponent(str){
  var elm=/([\x23|\x24|\x26|\x2B|\x2C|\x2F|\x3A|\x3B|\x3D|\x3F|\x40])/g;
  return $JSL.encodeURI(encodeURI(str).replace(elm,function(a,b){return "%"+$JSL.charCodeAt(b)}));
}};
if(typeof(decodeURIComponent)==="undefined"){function decodeURIComponent(str){
  var elm=/(%F[0-9A-F]%E[0-9A-F]%[A-B][0-9A-F]%[8-9A-B][0-9A-F])|(%E[0-9A-F]%[A-B][0-9A-F]%[8-9A-B][0-9A-F])|(%[C-D][0-9A-F]%[8-9A-B][0-9A-F])|(%[0-9A-F]{2})/g;
  return str.replace(elm,$JSL.$decodeURIComponent);
}};
if(typeof(decodeURI)==="undefined"){function decodeURI(str){
  return decodeURIComponent(str);
}};
if(!document.getElementById){document.getElementById=function(elm){
  return $JSL.$getElementsByName($JSL.$getElementsByTagName(this)[elm]);
}};
if(!document.getElementsByTagName){document.getElementsByTagName=function(elm){
  return $JSL.getElementsByTagName(this,0,elm.toUpperCase(),"tagName");
}};
if(!document.getElementsByName){document.getElementsByName=function(elm){
  return $JSL.getElementsByTagName(this,0,elm,"name");
}};
if(typeof(XMLHttpRequest)==="undefined"){XMLHttpRequest=function(){
  var tmp=null,elm=navigator.userAgent;
  if(elm.toUpperCase().indexOf("MSIE 4")<0&&window.ActiveXObject)
    tmp=elm.indexOf("MSIE 5")<0?new ActiveXObject("Msxml2.XMLHTTP"):new ActiveXObject("Microsoft.XMLHTTP");
  return tmp;
}};
if(typeof(Error)==="undefined")Error=function(){};
Error = function(base){return function(message){
  var tmp=new base();
  tmp.message=message||"";
  if(!tmp.fileName)
    tmp.fileName=document.location.href;
  if(!tmp.lineNumber)
    tmp.lineNumber=0;
  if(!tmp.stack)
    tmp.stack="Error()@:0\n(\""+this.message+"\")@"+tmp.fileName+":"+this.lineNumber+"\n@"+tmp.fileName+":"+this.lineNumber;
  if(!tmp.name)
    tmp.name="Error";
  return tmp;
}}(Error);

//
// http://www.dustindiaz.com/top-ten-javascript
//

//------------------------------------------------------------------------------------------------------------------
//  staic vars
//-------------------------------------------------------------------------------------------------------------------
function setStaticVar(__class__, __name__, __value__) {
  __class__.prototype[__name__] = __value__;
}
function getStaticVar(__class__, __name__) {
  return (new __class__())[__name__];
}



function MyClass(){};
setStaticVar(MyClass, "staticVar", 1);


alert(getStaticVar(MyClass, "staticVar"));	// 1


var test = new MyClass();
test.staticVar++;
alert(test.staticVar);				// 2

alert(getStaticVar(MyClass, "staticVar"));	// 1


setStaticVar(MyClass, "staticVar", getStaticVar(MyClass, "staticVar") + 5);
alert(test.staticVar);				// 2
alert(getStaticVar(MyClass, "staticVar"));	// 6

test = new MyClass();
alert(test.staticVar);		// 6


//--------------------------------------------------------------------------
//
//--------------------------------------------------------------------------
/*
JSAN.use('Wait');

wait(
   // Wait for this function to return true
   function() {
       return (v1 == 100);
   },
   // ... and then do this
   function() {
       v2 = true;
   },
   // ... unless the waiting is so long
   function() {
       v3 = false;
   },
   // ... as 10000 ms.
   10000
);
*/
if ( typeof Wait == 'undefined' ) {
    Wait = {}
}

Wait.VERSION = 0.01;
Wait.EXPORT  = [ 'wait' ];
Wait.EXPORT_TAGS = { ':all': Wait.EXPORT };

Wait.interval = 100;

Wait.wait = function(arg1, arg2, arg3, arg4) {
    if (   typeof arg1 == 'function'
        && typeof arg2 == 'function'
        && typeof arg3 == 'function'
        ) {
            return Wait._wait3(arg1, arg2, arg3, arg4);
        }

    if (   typeof arg1 == 'function'
        && typeof arg2 == 'function'
        ) {
            return Wait._wait2(arg1, arg2, arg3);
        }
}

Wait._wait2 = function(test, callback, max) {
    Wait._wait3(test, callback, function(){}, max);
}

Wait._wait3 = function(test, callback, failed_callback ,max) {
    var func = function() {
        var interval = Wait.interval;
        var time_elapsed = 0;
        var intervalId;
        var check_and_callback = function () {
            if ( test() ) {
                callback();
                clearInterval(intervalId);
            }
            time_elapsed += interval;
            if ( typeof max == 'number' ) {
                if ( time_elapsed >= max ) {
                    if ( typeof failed_callback == 'function')
                        failed_callback();
                    clearInterval(intervalId);
                }
            }
        }
        intervalId = setInterval(check_and_callback, interval );
    }
    func();

}
//--------------------------------------------------------------------------
//
//--------------------------------------------------------------------------
/*
  var path = "/testing/path/file.ext";
  var file = new File.Basename(path);

  // basename = 'file.ext'
  var basename = file.basename();
  var dirname  = file.dirname();

  // tell user
  document.writeln("basename is '" + basename + "'");

  // dump platform
  document.writeln("Parsed " + file.path() + " as platform " + file.platform_str());
*/
// File.Basename - Lee Carmichael <lecar_red[at]yahoo[dot]com

// Set up namepace(s)
if (typeof(File) == "undefined") File = {};
if (typeof(File.Basename) == "undefined") File.Basename = {};

// constructor
File.Basename = function (path, platform) {
  // should we error here? or just return?
  if (!path)
    return;

  // setup the path
  this._path = path;

  // need to check this value
  // grab passed platform
  if (platform)
    this._platform = platform;

  // figure out client type
  if (typeof(this._platform) == "undefined") {
    // need to check for navigator and platform
    // just in case of not in browser env...
    if (navigator.platform.indexOf("Win") >= 0) {
      this._platform = File.Basename.WIN;
    } else if (navigator.platform.indexOf("Mac") >= 0) {
      this._platform = File.Basename.MAC;
    } else {
      this._platform = File.Basename.UNIX;
    }
  }

  // set path pattern (current for Win we leave the <Drive Letter>)
  if (this._platform == File.Basename.WIN)
    this._pattern = /^(.*\\)?(.*)/; // this will not match drive letter...
  else
    this._pattern = /^(.*\/)?(.*)/;

  // match string
  var rc = this._path.match(this._pattern);

  // should we check values here?
  // * skip rc[0] since it returns our string *

  // setup basename
  this._basename = rc[2];

  if (!this._basename) this._basename = "";

  // setup dirname
  // and remove trailing slash
  this._dirname  = _chop(rc[1]);

  return;
}

// setup version
File.Basename.VERSION = "0.02";

// constants
File.Basename.WIN  = 1;
File.Basename.MAC  = 2; // does this really apply anymore?
File.Basename.UNIX = 3;

// platform string mapping
File.Basename.platformStrs = new Array("N/A", "Windows", "Macintosh", "UNIX");

// it would be nice to turn this into a class
function _chop(str) {
  // if not defined return empty string
  if (!str)
    return "";

  // remove last character from string
  return str.substr(0, (str.length-1));
}

File.Basename.prototype.basename = function() {
  return this._basename;
}

File.Basename.prototype.dirname = function() {
  return this._dirname;
}

// not sure about this.
File.Basename.prototype.path = function() {
  return this._path;
}

File.Basename.prototype.platform = function() {
  return this._platform;
}

File.Basename.prototype.platform_str = function() {
  return File.Basename.platformStrs[this._platform];
}
//------------------------------------------------------------------------------
// inheritance
//------------------------------------------------------------------------------
/* use:
Ajax.Request.prototype = (new Ajax.Base()).extend({
      initialize: function( ... ) {
      }

      ...
  });
*/
if ( ! Function.prototype.bind ) {
    Function.prototype.bind = function( object ) {
        var __method = this;
        return function() {
            __method.apply( object, arguments );
        };
    };
}
if ( ! Object.extend ) {
    Object.extend = function(destination, source) {
        for (property in source) {
            destination[property] = source[property];
        }
        return destination;
    }
}

if ( ! Object.prototype.extend ) {
    Object.prototype.extend = function(object) {
        return Object.extend.apply(this, [this, object]);
    }
}

if ( ! Function.prototype.bindAsEventListener ) {
    Function.prototype.bindAsEventListener = function(object) {
        var __method = this;
        return function(event) {
            __method.call(object, event || window.event);
        };
    };
}

//--------------------------------------------------------------------------
//
//--------------------------------------------------------------------------
if (! this.Ajax) Ajax = function () {};
proto = Ajax.prototype;

Ajax.VERSION = '0.10';

// Allows one to override with something more drastic.
// Can even be done "on the fly" using a bookmarklet.
// As an example, the test suite overrides this to test error conditions.
proto.die = function(e) { throw(e) };

// The simple user interface function to GET. If no callback is used the
// function is synchronous.

Ajax.get = function(url, callback) {
    return (new Ajax()).get(
        { 'url': url, 'onComplete': callback }
    );
}

// The simple user interface function to POST. If no callback is used the
// function is synchronous.
Ajax.post = function(url, data, callback) {
    return (new Ajax()).post(
        { 'url': url, 'data': data, 'onComplete': callback }
    );
}

// Object interface
proto.get = function(params) {
    this._init_object(params);
    this.request.open('GET', this.url, Boolean(this.onComplete));
    return this._send();
}

proto.post = function(params) {
    this._init_object(params);
    this.request.open('POST', this.url, Boolean(this.onComplete));
    this.request.setRequestHeader(
        'Content-Type',
        'application/x-www-form-urlencoded'
    );
    return this._send();
}

// Set up the Ajax object with a working XHR object.
proto._init_object = function(params) {
    for (key in params) {
        if (! key.match(/^url|data|onComplete$/))
            throw("Invalid Ajax parameter: " + key);
        this[key] = params[key];
    }

    if (! this.url)
        throw("'url' required for Ajax get/post method");

    if (this.request)
        throw("Don't yet support multiple requests on the same Ajax object");

    this.request = new XMLHttpRequest();

    if (! this.request)
        return this.die("Your browser doesn't do Ajax");
    if (this.request.readyState != 0)
        return this.die("Ajax readyState should be 0");

    return this;
}

proto._send = function() {
    var self = this;
    if (this.onComplete) {
        this.request.onreadystatechange = function() {
            self._check_asynchronous();
        };
    }
    this.request.send(this.data);
    return Boolean(this.onComplete)
        ? this
        : this._check_synchronous();
}

// TODO Allow handlers for various readyStates and statusCodes.
// Make these be the default handlers.
proto._check_status = function() {
    if (this.request.status != 200) {
        return this.die(
            'Ajax request for "' + this.url +
            '" failed with status: ' + this.request.status
        );
    }
}

proto._check_synchronous = function() {
    this._check_status();
    return this.request.responseText;
}

proto._check_asynchronous = function() {
    if (this.request.readyState != 4) return;
    this._check_status();
    this.onComplete(this.request.responseText);
}

// IE support
if (window.ActiveXObject && !window.XMLHttpRequest) {
    window.XMLHttpRequest = function() {
        var name = (navigator.userAgent.toLowerCase().indexOf('msie 5') != -1)
            ? 'Microsoft.XMLHTTP' : 'Msxml2.XMLHTTP';
        return new ActiveXObject(name);
    }
}
//--------------------------------------------------------------------------
//  http_query manipulation
//--------------------------------------------------------------------------
// Set up namespace.
if (typeof HTTP == 'undefined') HTTP = {};
HTTP.Query = function (qry) {
    this.query = [];
    // Do nothing with empty query strings.
    // Use the current browser document location search if there is no query.
    if (!arguments.length && typeof window != 'undefined')
        qry = window.document.location.search;
    if (qry == null || qry == '') return;
    var pairs = qry.substring(1).split(/[;&]/);
    for (var i = 0; i < pairs.length; i++) {
        var parts = pairs[i].split('=');
        if (parts[0] == null) continue;
        var key = unescape(parts[0]), val = unescape(parts[1]);
        if (this.query[key] == null) {
            this.query[key] = unescape(val);
        } else {
            if (typeof this.query[key] == 'string') {
                this.query[key] = [this.query[key], unescape(val)];
            } else this.query[key].push(unescape(val));
        }
    }
};

HTTP.Query.VERSION = '0.03';

HTTP.Query.prototype = {
    get:   function (key)      { return this.query[key] },
    set:   function (key, val) { this.query[key] = val },
    unset: function (key)      { delete this.query[key] },
    clear: function ()         { this.query = [] },

    add:   function (key, val) {
        if (this.query[key] != null) {
            if (typeof this.query[key] != 'string') this.query[key].push(val);
            else this.query[key] = [this.query[key], val];
        } else {
            this.query[key] = val;
        }
    },
    act:    function (fn) {
        for (var k in this.query) {
            if (typeof this.query[k] == 'string') {
                if (!fn(k, this.query[k])) return;
            } else {
                // XXX What if someone has changed Array.prototype or
                // Object.prototype??
                for (var i in this.query[k])
                    if (!fn(k, this.query[k][i])) return;
            }
        }
    },
    toString: function (sep) {
        var ret = '';
        if (sep == null) sep = ';';
        this.act(function (k, v) {
             ret += sep + escape(k) + '=' + escape(v);
             return true;
        });
        return ret.replace(/^[;&]/, '?');
    }
};

//----------------------------------------------------------------------------------------------------------------------------------
//  bytefx
//----------------------------------------------------------------------------------------------------------------------------------
/*
 *
 * @author              Andrea Giammarchi
 * @site                www.devpro.it
*/
bytefx = {
  alpha:function(element, opacity){
    var	style = bytefx.$element(element).style;
    style.opacity = style.MozOpacity = style.KhtmlOpacity = opacity/100;
    style.filter = "alpha(opacity=" + opacity + ")"
  },
  clear:function(element){
    var	interval = ["size", "move", "fade", "color"],
      i = interval.length;
    while(i--)
      clearInterval(bytefx.$element(element).bytefx[interval[i]]);
  },
  color:function(element, style, start, end, speed, callback){
    end = bytefx.$color2rgb(end);
    clearInterval(bytefx.$element(element).bytefx.color);
    element.bytefx.color = setInterval(function(){
      var	color = bytefx.$color2rgb(start),
        i = 3;
      while(i--)
        color[i] = bytefx.$end(color[i], end[i], speed);
      element.style[style] = start = bytefx.$rgb2color(color);
      if("" + color == "" + end)
        bytefx.$callback(callback, element, "color");
    },1);
  },
  drag:function(element, start, end){
    function $drag(evt){
      var	x = evt.clientX,
        y = evt.clientY;
      if(tmp.start)
        bytefx.position(element, x - tmp.x, y - tmp.y);
      else{
        tmp.x = x - element.offsetLeft;
        tmp.y = y - element.offsetTop;
      }
    };
    function $start(evt){
      tmp.start = true;
      tmp[m.d] = document[m.d];
      tmp[m.u] = document[m.u];
      document[m.u] = element[m.u];
      document[m.d] = function(){return false};
      if(start)
        start.call(element, evt);
      return false;
    };
    function $end(evt){
      tmp.start = false;
      document[m.d] = tmp[m.d];
      document[m.u] = tmp[m.u];
      if(end)
        end.call(element, evt);
      return false;
    };
    var	tmp = bytefx.$element(element).bytefx.drag,
      m = {d:"onmousedown", u:"onmouseup", m:"onmousemove"};
    bytefx.$event(element, m.d, $start);
    bytefx.$event(element, m.u, $end);
    bytefx.$event(document, m.m, $drag);
  },
  fade:function(element, start, end, speed, callback){
    clearInterval(bytefx.$element(element).bytefx.fade);
    element.bytefx.fade = setInterval(function(){
      start = bytefx.$end(start, end, speed);
      bytefx.alpha(element, start);
      if(start == end)
        bytefx.$callback(callback, element, "fade");
    },1);
  },
  move:function(element, position, speed, callback){
    var	start = bytefx.$position(bytefx.$element(element));
    bytefx.$setInterval(element, "move", speed/100, start.x, start.y, position.x, position.y, "position", callback);
  },
  position:function(element, x, y){
    var	style = bytefx.$element(element).style;
    style.position = "absolute";
    style.left = x + "px";
    style.top = y + "px";
  },
  size:function(element, size, speed, callback){
    var	start = bytefx.$size(bytefx.$element(element)),
      tmp = window.opera;
    if(!/msie/i.test(navigator.userAgent) || (tmp && parseInt(tmp.version())>=9)){
      if(size.sw)
        start[0] -= size.sw;
      if(size.sh)
        start[1] -= size.sh;
      if(size.ew)
        size.w -= size.ew;
      if(size.eh)
        size.h -= size.eh;
    };
    element.style.overflow = "hidden";
    bytefx.$setInterval(element, "size", speed/100, start[0], start[1], size.w, size.h, "$size2", callback);
  },
  $callback:function(callback, element, interval){
    clearInterval(element.bytefx[interval]);
    if(callback)
      callback.call(element);
  },
  $color:function(color){
    return bytefx.$rgb2color(bytefx.$color2rgb(color));
  },
  $color2rgb:function(color){
    function c(n){
      return color.charAt(n)
    };
    color = color.substr(1, color.length);
    if(color.length == 3)
      color = c(0) + c(0) + c(1) + c(1) + c(2) + c(2);
    return [parseInt(c(0) + c(1), 16), parseInt(c(2) + c(3), 16), parseInt(c(4) + c(5), 16)];
  },
  $end:function(x, y, speed){
    return x < y ? Math.min(x + speed, y) : Math.max(x - speed, y);
  },
  $element:function(element){
    if(!element.bytefx)
      element.bytefx = {color:0, drag:{}, fade:0, move:0, size:0};
    return element;
  },
  $event:function(element,tmp,callback){
    element[tmp] = (function(value){
      return function(evt){
        if(!evt)
          evt=window.event;
        if(value)
          value.call(this, evt);
        return callback.call(this, evt);
      }
    })(element[tmp]);
  },
  $position:function(element){
    var	position = {x:element.offsetLeft, y:element.offsetTop};
    while(element = element.offsetParent){
      position.x += element.offsetLeft;
      position.y += element.offsetTop;
    };
    return position;
  },
  $rgb2color:function(color){
    function c(n){
      var	tmp = color[n].toString(16);
      return tmp.length == 1 ? "0" + tmp : tmp
    };
    return "#" + c(0) + c(1) + c(2);
  },
  $setInterval:function(element, interval, speed, x, y, w, h, tmp, callback){
    var	round = Math.round;
    clearInterval(element.bytefx[interval]);
    element.bytefx[interval] = setInterval(function(){
      x += (w - x) * speed;
      y += (h - y) * speed;
      bytefx[tmp](element, x, y);
      if(round(x) == w && round(y) == h){
        bytefx[tmp](element, w, h);
        bytefx.$callback(callback, element, interval);
      }
    }, 1);
  },
  $size:function(element){
    var	n = "number",
      size = [0,0];
    if(typeof(element.offsetWidth) == n)
      size = [element.offsetWidth, element.offsetHeight];
    else if(typeof(element.clientWidth) == n)
      size = [element.clientWidth, element.clientHeight];
    else if(typeof(element.innerWidth)==n)
      size = [element.innerWidth, element.innerHeight];
    return size;
  },
  $size2:function(element, w, h){
    var	style = element.style;
    style.width = w + "px";
    style.height = h + "px";
  }
};

//--------------------------------------------------------------------------
//
//--------------------------------------------------------------------------

// graft() function
// Originally by Sean M. Burke from interglacial.com
// Closure support added by Maciek Adwent
/*
crea elementi della pagina in modo dichiarativo, in alternativa a innerHTML

uso:
function getRow1(i,j)
{
    return ['td',['strong',i*j]];
}

var tbl = ['table',{border:1,cellpadding:0,cellspacing:0}];
var tbody = ['tbody'];
for(var i=0;i<25;i++)
{
    var tr = ['tr'];
    for(var j=0;j<25;j++)
    {
        tr[tr.length] = getRow1(i,j);
    }
    tbody[tbody.length]=tr;
}
tbl[tbl.length] = tbody;
graft(document.getElementById("mycontentdiv"),tbl);

*/
function graft (parent, t, doc) {

    // Usage: graft( somenode, [ "I like ", ['em',
    //               { 'class':"stuff" },"stuff"], " oboy!"] )

    doc = (doc || parent.ownerDocument || document);
    var e;

    if(t == undefined) {
        throw complaining( "Can't graft an undefined value");
    } else if(t.constructor == String) {
        e = doc.createTextNode( t );
    } else if(t.length == 0) {
        e = doc.createElement( "span" );
        e.setAttribute( "class", "fromEmptyLOL" );
    } else {
        for(var i = 0; i < t.length; i++) {
            if( i == 0 && t[i].constructor == String ) {
                var snared;
                snared = t[i].match( /^([a-z][a-z0-9]*)\.([^\s\.]+)$/i );
                if( snared ) {
                    e = doc.createElement(   snared[1] );
                    e.setAttribute( 'class', snared[2] );
                    continue;
                }
                snared = t[i].match( /^([a-z][a-z0-9]*)$/i );
                if( snared ) {
                    e = doc.createElement( snared[1] );  // but no class
                    continue;
                }

                // Otherwise:
                e = doc.createElement( "span" );
                e.setAttribute( "class", "namelessFromLOL" );
            }

            if( t[i] == undefined ) {
                throw complaining("Can't graft an undefined value in a list!");
            } else if(  t[i].constructor == String ||
                                    t[i].constructor == Array ) {
                graft( e, t[i], doc );
            } else if(  t[i].constructor == Number ) {
                graft( e, t[i].toString(), doc );
            } else if(  t[i].constructor == Object ) {
                // hash's properties => element's attributes
                for(var k in t[i]) {
                    // support for attaching closures to DOM objects
                    if(typeof(t[i][k])=='function'){
                        e[k] = t[i][k];
                    } else {
                        e.setAttribute( k, t[i][k] );
                    }
                }
            } else {
                throw complaining( "Object " + t[i] +
                    " is inscrutable as an graft arglet." );
            }
        }
    }

    parent.appendChild( e );
    return e; // return the topmost created node
}

function complaining (s) { alert(s); return new Error(s); }

//--------------------------------------------------------------------------
//
//--------------------------------------------------------------------------
function innerXHTML($source,$string) {
  // (v0.3) Written 2006 by Steve Tucker, http://www.stevetucker.co.uk
  if (!($source.nodeType == 1)) return false;
  var $children = $source.childNodes;
  var $xhtml = '';
  if (!$string) {
    for (var $i=0; $i<$children.length; $i++) {
      if ($children[$i].nodeType == 3) {
        var $text_content = $children[$i].nodeValue;
        $text_content = $text_content.replace(/</g,'&lt;');
        $text_content = $text_content.replace(/>/g,'&gt;');
        $xhtml += $text_content;
      }
      else if ($children[$i].nodeType == 8) {
        $xhtml += '<!--'+$children[$i].nodeValue+'-->';
      }
      else {
        $xhtml += '<'+$children[$i].nodeName.toLowerCase();
        var $attributes = $children[$i].attributes;
        for (var $j=0; $j<$attributes.length; $j++) {
          var $attName = $attributes[$j].nodeName.toLowerCase();
          var $attValue = $attributes[$j].nodeValue;
          if ($attName == 'style' && $children[$i].style.cssText) {
            $xhtml += ' style="'+$children[$i].style.cssText.toLowerCase()+'"';
          }
          else if ($attValue && $attName != 'contenteditable') {
            $xhtml += ' '+$attName+'="'+$attValue+'"';
          }
        }
        $xhtml += '>'+innerXHTML($children[$i]);
        $xhtml += '</'+$children[$i].nodeName.toLowerCase()+'>';
      }
    }
  }
  else {
    while ($children.length>0) {
      $source.removeChild($children[0]);
    }
    $xhtml = $string;
    while ($string) {
      var $returned = translateXHTML($string);
      var $elements = $returned[0];
      $string = $returned[1];
      if ($elements) $source.appendChild($elements);
    }
  }
  return $xhtml;
}

function translateXHTML($string) {
  var $match = /^<\/[a-z0-9]{1,}>/i.test($string);
  if ($match) {
    var $return = Array;
    $return[0] = false;
    $return[1] = $string.replace(/^<\/[a-z0-9]{1,}>/i,'');
    return $return;
  }
  $match = /^<[a-z]{1,}/i.test($string);
  if ($match) {
    $string = $string.replace(/^</,'');
    var $element = $string.match(/[a-z0-9]{1,}/i);
    if ($element) {
      var $new_element = document.createElement($element[0]);
      $string = $string.replace(/[a-z0-9]{1,}/i,'');
      var $attribute = true;
      while ($attribute) {
        $string = $string.replace(/^\s{1,}/,'');
        $attribute = $string.match(/^[a-z1-9_-]{1,}="[^"]{0,}"/i);
        if ($attribute) {
          $attribute = $attribute[0];
          $string = $string.replace(/^[a-z1-9_-]{1,}="[^"]{0,}"/i,'');
          var $attName = $attribute.match(/^[a-z1-9_-]{1,}/i);
          $attribute = $attribute.replace(/^[a-z1-9_-]{1,}="/i,'');
          $attribute = $attribute.replace(/;{0,1}"$/,'');
          if ($attribute) {
            var $attValue = $attribute;
            if ($attName == 'value') {
              $new_element.value = $attValue;
            }
            else if ($attName == 'class') {
              $new_element.className = $attValue;
            }
            else if ($attName == 'style') {
              var $style = $attValue.split(';');
              for (var $i=0; $i<$style.length; $i++) {
                var $this_style = $style[$i].split(':');
                $this_style[0] = $this_style[0].toLowerCase().replace(/(^\s{0,})|(\s{0,1}$)/,'');
                $this_style[1] = $this_style[1].toLowerCase().replace(/(^\s{0,})|(\s{0,1}$)/,'');
                if (/-{1,}/g.test($this_style[0])) {
                  var $this_style_words = $this_style[0].split(/-/g);
                  $this_style[0] = '';
                  for (var $j=0; $j<$this_style_words.length; $j++) {
                    if ($j==0) {
                      $this_style[0] = $this_style_words[0];
                      continue;
                    }
                    var $first_letter = $this_style_words[$j].toUpperCase().match(/^[a-z]{1,1}/i);
                    $this_style[0] += $first_letter+$this_style_words[$j].replace(/^[a-z]{1,1}/,'');
                  }
                }
                $new_element.style[$this_style[0]] = $this_style[1];
              }
            }
            else {
              $new_element.setAttribute($attName,$attValue);
            }
          }
          else $attribute = true;
        }
      }
      $match = /^>/.test($string);
      if ($match) {
        $string = $string.replace(/^>/,'');
        var $child = true;
        while ($child) {
          var $returned = translateXHTML($string,false);
          $child = $returned[0];
          if ($child) $new_element.appendChild($child);
          $string = $returned[1];
        }
      }
      $string = $string.replace(/^\/>/,'');
    }
  }
  $match = /^[^<>]{1,}/i.test($string);
  if ($match && !$new_element) {
    var $text_content = $string.match(/^[^<>]{1,}/i)[0];
    $text_content = $text_content.replace(/&lt;/g,'<');
    $text_content = $text_content.replace(/&gt;/g,'>');
    var $new_element = document.createTextNode($text_content);
    $string = $string.replace(/^[^<>]{1,}/i,'');
  }
  $match = /^<!--[^<>]{1,}-->/i.test($string);
  if ($match && !$new_element) {
    if (document.createComment) {
      $string = $string.replace(/^<!--/i,'');
      var $text_content = $string.match(/^[^<>]{0,}-->{1,}/i);
      $text_content = $text_content[0].replace(/-->{1,1}$/,'');
      var $new_element = document.createComment($text_content);
      $string = $string.replace(/^[^<>]{1,}-->/i,'');
    }
    else $string = $string.replace(/^<!--[^<>]{1,}-->/i,'');
  }
  var $return = Array;
  $return[0] = $new_element;
  $return[1] = $string;
  return $return;
}

/*--------------------------------------------------------------------------
Inner Dom 1.01 corrected Array issue,
released under Creative commons license ;)
http://creativecommons.org/licenses/by-nc-nd/2.0/
--------------------------------------------------------------------------*/
function rep(o,n){
  o.parentNode.replaceChild(n,o);
  return n;
}
function app(r,n){
  return r.appendChild(n);
}
function text(t){
  return document.createTextNode(t);
}
function ele(el){
  return document.createElement(el);
}
function set(n,an,av){
  n.setAttribute(an,av);
}

function doObject(obj){
  var nodo=ele(obj.TAG);
  for(var prop in obj){
    if(prop!="INNER" && prop !="TAG")
      set(nodo,prop,obj[prop]);
    else
    if(prop=="INNER"){
      var t=ele("span");
      app(document.getElementsByTagName("body")[0],t);
      app(nodo,innerDo(t,obj.INNER));
    }
  }
  return nodo;
}

function doArray(a){
  var max=a.length;
  var a2=new Array(max);
  for(var i=0;i<max;i++){
    switch(a[i].constructor){
      case Object:
        a2[i]=doObject(a[i]);
      break;
      case Array:
        a2[i]=doArray(a[i]);
      break
      default:
        a2[i]=text(""+a[i]);
      break;
    }
  }
  return a2;
}

function innerDom(domnode,obj){
  var max=domnode.childNodes.length;
  for(var i=0;i<max;i++)
    domnode.removeChild(domnode.childNodes[i]);

  innerDo(domnode,obj);
}

function innerDo(domnode,obj){

  switch (obj.constructor){
  case String:
    return rep(domnode,text(obj));
    break;
  case Number:
    return rep(domnode,text(""+obj));
    break;
  case Array:
    var a=doArray(obj);
    var max=a.length;
    for(var i=0;i<max;i++)
      app(domnode,a[i]);
    return domnode;
  break;
  case Object:
    return rep(domnode,doObject(obj));
    break;
  }
}
/*--------------------------------------------------------------------------
log function
--------------------------------------------------------------------------*/
function log(message) {
    if (!log.window_ || log.window_.closed) {
        var win = window.open("", null, "width=400,height=200," +
                              "scrollbars=yes,resizable=yes,status=no," +
                              "location=no,menubar=no,toolbar=no");
        if (!win) return;
        var doc = win.document;
        doc.write("<html><head><title>Debug Log</title></head>" +
                  "<body></body></html>");
        // approfondire la ragione dell'uso del metodo close(), workaround?
        doc.close();
        // public static !
        log.window_ = win;
    }
    var logLine = log.window_.document.createElement("div");
    logLine.appendChild(log.window_.document.createTextNode(message));
    log.window_.document.body.appendChild(logLine);
}




//--------------------------------------------------------------------------
//
//--------------------------------------------------------------------------
var FormatSpecifier=function(s){
  var s=s.match(/%(\(\w+\)){0,1}([ 0-]){0,1}(\+){0,1}(\d+){0,1}(\.\d+){0,1}(.)/);
  if(s[1]){
    this.key=s[1].slice(1,-1);
  }else{
    this.key=null;
  }
  this.paddingFlag=s[2];
  if(this.paddingFlag==""){
    this.paddingFlag=" ";
  }
  this.signed=(s[3]=="+");
  this.minLength=parseInt(s[4]);
  if(isNaN(this.minLength)){
    this.minLength=0;
  }
  if(s[5]){
    this.percision=parseInt(s[5].slice(1,s[5].length));
  }else{
    this.percision=-1;
  }
  this.type=s[6];
}

String.prototype.format=function(){
  var sf=this.match(/(%(\(\w+\)){0,1}[ 0-]{0,1}(\+){0,1}(\d+){0,1}(\.\d+){0,1}[dibouxXeEfFgGcrs%])|([^%]+)/g);
  var rslt="", s, obj, cnt=0, frmt, sign="";
  if(sf){
    if(sf.join("")!=this){
      throw new mod.Exception("Unsupported formating string.");
    }
  }else{
    throw new mod.Exception("Unsupported formating string.");
  }

  for(var i=0;i<sf.length;i++){
    s=sf[i];
    if(s=="%%"){
      s="%";
    }else if(s=="%s"){
      if(cnt>=arguments.length){
        throw new mod.Exception("Not enough arguments for format string.");
      }else{
        obj=arguments[cnt];
        cnt++;
      }
      if(obj===null){
        obj="null";
      }else if(obj===undefined){
        obj="undefined";
      }
      s=obj.toString();
    }else if(s.slice(0,1)=="%"){
      frmt=new FormatSpecifier(s);
      if(frmt.key){
        if((typeof arguments[0])=="object"&&arguments.length==1){
          obj=arguments[0][frmt.key];
        }else{
          throw new mod.Exception("Object or associative array expected as formating value.");
        }
      }else{
        if(cnt>=arguments.length){
          throw new mod.Exception("Not enough arguments for format string.");
        }else{
          obj=arguments[cnt];
          cnt++;
        }
      }
      if(frmt.type=="s"){
        if(obj===null){
          obj="null";
        }else if(obj===undefined){
          obj="undefined";
        }
        s=pad(obj.toString(),frmt.paddingFlag,frmt.minLength);
      }else if(frmt.type=="c"){
        if(frmt.paddingFlag=="0"){
          frmt.paddingFlag=" ";
        }
        if(typeof obj=="number"){
          s=pad(String.fromCharCode(obj),frmt.paddingFlag,frmt.minLength);
        }else if(typeof obj=="string"){
          if(obj.length==1){
            s=pad(obj,frmt.paddingFlag,frmt.minLength);
          }else{
            throw new mod.Exception("Character of length 1 required.");
          }
        }else{
          throw new mod.Exception("Character or Byte required.");
        }
      }else if(typeof obj=="number"){
        if(obj<0){
          obj=-obj;
          sign="-";
        }else if(frmt.signed){
          sign="+";
        }else{
          sign="";
        }
        switch(frmt.type){
          case "f":
          case "F":
          if(frmt.percision>-1){
            s=obj.toFixed(frmt.percision).toString();
          }else{
            s=obj.toString();
          }
          break;
          case "E":
          case "e":
          if(frmt.percision>-1){
            s=obj.toExponential(frmt.percision);
          }else{
            s=obj.toExponential();
          }
          s=s.replace("e",frmt.type);
          break;
          case "b":
            s=obj.toString(2);
            s=pad(s,"0",frmt.percision);
          break;
          case "o":
            s=obj.toString(8);
            s=pad(s,"0",frmt.percision);
          break;
          case "x":
            s=obj.toString(16).toLowerCase();
            s=pad(s,"0",frmt.percision);
          break;
          case "X":
            s=obj.toString(16).toUpperCase();
            s=pad(s,"0",frmt.percision);
          break;
          default:
            s=parseInt(obj).toString();
            s=pad(s,"0",frmt.percision);
          break;
        }
        if(frmt.paddingFlag=="0"){
          s=pad(s,"0",frmt.minLength-sign.length);
        }
        s=sign+s;
        s=pad(s,frmt.paddingFlag,frmt.minLength);
      }else{
        throw new mod.Exception("Number required.");
      }
    }
    rslt+=s;
  }
  return rslt;
}
/*--------------------------------------------------------------------------
div debug
---------------------------------------------------------------------------*/
    debug : function(txt) {
    msgLevel = arguments[1] || 10; 	// 1 = least importance, X = most important

    if(wFORMS.debugLevel > 0 && msgLevel >= wFORMS.debugLevel) {
      if(!wFORMS.debugOutput)
        wFORMS.initDebug();
      if(wFORMS.debugOutput)
        wFORMS.debugOutput.innerHTML += "<br />" + txt;
    }
    },

    initDebug : function() {
    var output = document.getElementById('debugOutput');
    if(!output) {
      output = document.createElement('div');
      output.id = 'debugOutput';
      output.style.position   = 'absolute';
      output.style.right      = '10px';
      output.style.top        = '10px';
      output.style.zIndex     = '300';
      output.style.fontSize   = 'x-small';
      output.style.fontFamily = 'courier';
      output.style.backgroundColor = '#DDD';
      output.style.padding    = '5px';
      if(document.body) // if page fully loaded
        wFORMS.debugOutput = document.body.appendChild(output);
    }
    if(wFORMS.debugOutput)
      wFORMS.debugOutput.ondblclick = function() { this.innerHTML = '' };
  }
  /* end div debug*/


/* method as event listener */
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
    <title>Ajax Cookbook Example - Object-Oriented JavaScript Callbacks</title>
    <script type="text/javascript">

function callback(instance, method) {
  return function() {
    method.apply(instance, arguments);
  }
}

function Adder() {
  this.value = 0;
}

Adder.prototype.addOne = function() {
  this.value++;
  document.getElementById("output").innerHTML = this.value;
}

function onLoad() {
  var adder = new Adder();
  var button = document.getElementById("button");
  button.onclick = callback(adder, adder.addOne);
  adder.addOne();
}

    </script>
  </head>
  <body onload="onLoad()">
    <div><input id="button" type="button" value="Add One"/>
    <div id="output"></div>
  </body>
</html>
//------------------------------------------------------------------------------
function dump_layer(l){
    alert( 'w-h:'+screen.width+' '+screen.height+"\n"+
           'x-y:'+l.x+' '+l.y+"\n"+
          'visibility:'+l.style.visibility+"\n"+
          'display:'+l.style.display+"\n"+
          'left:'+l.style.left+"\n"+
          'top:'+l.style.top+"\n"+
          'width:'+l.style.width+"\n"+
          'height:'+l.style.height);
}
//--------------------------------------------------------------------------------------------
/* parseUri JS v0.1, by Steven Levithan (http://badassery.blogspot.com)
Splits any well-formed URI into the following parts (all are optional):
----------------------
• source (since the exec() method returns backreference 0 [i.e., the entire match] as key 0, we might as well use it)
• protocol (scheme)
• authority (includes both the domain and port)
    • domain (part of the authority; can be an IP address)
    • port (part of the authority)
• path (includes both the directory path and filename)
    • directoryPath (part of the path; supports directories with periods, and without a trailing backslash)
    • fileName (part of the path)
• query (does not include the leading question mark)
• anchor (fragment)
*/
function parseUri(sourceUri){
    var uriPartNames = ["source","protocol","authority","domain","port","path","directoryPath","fileName","query","anchor"];
    var uriParts = new RegExp("^(?:([^:/?#.]+):)?(?://)?(([^:/?#]*)(?::(\\d*))?)?((/(?:[^?#](?![^?#/]*\\.[^?#/.]+(?:[\\?#]|$)))*/?)?([^?#/]*))?(?:\\?([^#]*))?(?:#(.*))?").exec(sourceUri);
    var uri = {};

    for(var i = 0; i < 10; i++){
        uri[uriPartNames[i]] = (uriParts[i] ? uriParts[i] : "");
    }

    // Always end directoryPath with a trailing backslash if a path was present in the source URI
    // Note that a trailing backslash is NOT automatically inserted within or appended to the "path" key
    if(uri.directoryPath.length > 0){
        uri.directoryPath = uri.directoryPath.replace(/\/?$/, "/");
    }

    return uri;
}

//--------------------------------------------------------------------------------------------------------------------------
// accessible popup
//-------------------------------------------------------------------------------------------------------------------------
var newWindow = null;

function closeWin(){
  if (newWindow != null){
    if(!newWindow.closed)
      newWindow.close();
  }
}

function popUpWin(url, type, strWidth, strHeight){

  closeWin();

  type = type.toLowerCase();

  if (type == "fullscreen"){
    strWidth = screen.availWidth;
    strHeight = screen.availHeight;
  }
  var tools="";
  if (type == "standard") tools = "resizable,toolbar=yes,location=yes,scrollbars=yes,menubar=yes,width="+strWidth+",height="+strHeight+",top=0,left=0";
  if (type == "console" || type == "fullscreen") tools = "resizable,toolbar=no,location=no,scrollbars=no,width="+strWidth+",height="+strHeight+",left=0,top=0";
  newWindow = window.open(url, 'newWin', tools);
  newWindow.focus();
}

function doPopUp(e)
{
//set defaults - if nothing in rel attrib, these will be used
var t = "standard";
var w = "780";
var h = "580";
//look for parameters
attribs = this.rel.split(" ");
if (attribs[1]!=null) {t = attribs[1];}
if (attribs[2]!=null) {w = attribs[2];}
if (attribs[3]!=null) {h = attribs[3];}
//call the popup script
popUpWin(this.href,t,w,h);
//cancel the default link action if pop-up activated
if (window.event)
  {
  window.event.returnValue = false;
  window.event.cancelBubble = true;
  }
else if (e)
  {
  e.stopPropagation();
  e.preventDefault();
  }
}

function findPopUps()
{
var popups = document.getElementsByTagName("a");
for (i=0;i<popups.length;i++)
  {
  if (popups[i].rel.indexOf("popup")!=-1)
    {
    // attach popup behaviour
    popups[i].onclick = popups[i].onkeypress = doPopUp;
    // add popup indicator
    if (popups[i].rel.indexOf("noicon")==-1)
      {
      popups[i].style.backgroundImage = "url(pop-up.gif)";
      popups[i].style.backgroundPosition = "0 center";
      popups[i].style.backgroundRepeat = "no-repeat";
      popups[i].style.paddingLeft = "15px";
      }
    // add info to title attribute to alert fact that it's a pop-up window
    popups[i].title = popups[i].title + " [Opens in pop-up window]";
    }
  }
}

addEvent(window, 'load', findPopUps, false);

//--------------------------------------------------------------------------
//
//---------------------------------------------------------------------------
var asyncRequest = function() {
    function handleReadyState(o, callback) {
        var poll = window.setInterval(function() {
            if(o && o.readyState == 4) {
                window.clearInterval(poll);
                if ( callback ){
                    callback(o);
                }
            }
        },
        50);
    }
  var http;
  try {
    http = new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) {
    try {
        http = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (e) {
      try {
        http = new XMLHttpRequest();
      } catch (e) {
        http = false;
        return false;
      }
    }
  }

    return function(method, uri, callback, postData) {
        http.open(method, uri, true);
        handleReadyState(http, callback);
        http.send(postData || null);
        return http;
    };
}();





