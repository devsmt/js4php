<?php
/**
 * http://code.google.com/p/jsmin-php/source/browse/trunk/jsmin.php
 * jsmin.php - PHP implementation of Douglas Crockford's JSMin.
 *
 * This is pretty much a direct port of jsmin.c to PHP with just a few
 * PHP-specific performance tweaks. Also, whereas jsmin.c reads from stdin and
 * outputs to stdout, this library accepts a string as input and returns another
 * string as output.
 *
 * PHP 5 or higher is required.
 *
 * Permission is hereby granted to use this version of the library under the
 * same terms as jsmin.c, which has the following license:
 *
 * --
 * Copyright (c) 2002 Douglas Crockford  (www.crockford.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * The Software shall be used for Good, not Evil.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * --
 *
 * @package JSMin
 * @author Ryan Grove <ryan@wonko.com>
 * @copyright 2002 Douglas Crockford <douglas@crockford.com> (jsmin.c)
 * @copyright 2008 Ryan Grove <ryan@wonko.com> (PHP port)
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @version 1.1.1 (2008-03-02)
 * @link http://code.google.com/p/jsmin-php/
 */

class JSMin {
    const ORD_LF    = 10;
    const ORD_SPACE = 32;

    protected $a           = '';
    protected $b           = '';
    protected $input       = '';
    protected $inputIndex  = 0;
    protected $inputLength = 0;
    protected $lookAhead   = null;
    protected $output      = '';

    // -- Public Static Methods --------------------------------------------------

    public static function minify($js) {
        $jsmin = new JSMin($js);
        return $jsmin->min();
    }

    // -- Public Instance Methods ------------------------------------------------

    public function __construct($input) {
        $this->input       = str_replace("\r\n", "\n", $input);
        $this->inputLength = strlen($this->input);
    }

    // -- Protected Instance Methods ---------------------------------------------

    protected function action($d) {
        switch($d) {
            case 1:
                $this->output .= $this->a;

            case 2:
                $this->a = $this->b;

                if ($this->a === "'" || $this->a === '"') {
                    for (;;) {
                        $this->output .= $this->a;
                        $this->a       = $this->get();

                        if ($this->a === $this->b) {
                            break;
                        }

                        if (ord($this->a) <= self::ORD_LF) {
                            throw new JSMinException('Unterminated string literal.');
                        }

                        if ($this->a === '\\') {
                            $this->output .= $this->a;
                            $this->a       = $this->get();
                        }
                    }
                }

            case 3:
                $this->b = $this->next();

                if ($this->b === '/' && (
                    $this->a === '(' || $this->a === ',' || $this->a === '=' ||
                    $this->a === ':' || $this->a === '[' || $this->a === '!' ||
                    $this->a === '&' || $this->a === '|' || $this->a === '?')) {

                    $this->output .= $this->a . $this->b;

                    for (;;) {
                        $this->a = $this->get();

                        if ($this->a === '/') {
                            break;
                        } elseif ($this->a === '\\') {
                            $this->output .= $this->a;
                            $this->a       = $this->get();
                        } elseif (ord($this->a) <= self::ORD_LF) {
                            throw new JSMinException('Unterminated regular expression '.
                                'literal.');
                        }

                        $this->output .= $this->a;
                    }

                    $this->b = $this->next();
                }
        }
    }

    protected function get() {
        $c = $this->lookAhead;
        $this->lookAhead = null;

        if ($c === null) {
            if ($this->inputIndex < $this->inputLength) {
                $c = $this->input[$this->inputIndex];
                $this->inputIndex += 1;
            } else {
                $c = null;
            }
        }

        if ($c === "\r") {
            return "\n";
        }

        if ($c === null || $c === "\n" || ord($c) >= self::ORD_SPACE) {
            return $c;
        }

        return ' ';
    }

    protected function isAlphaNum($c) {
        return ord($c) > 126 || $c === '\\' || preg_match('/^[\w\$]$/', $c) === 1;
    }

    protected function min() {
        $this->a = "\n";
        $this->action(3);

        while ($this->a !== null) {
            switch ($this->a) {
                case ' ':
                    if ($this->isAlphaNum($this->b)) {
                        $this->action(1);
                    } else {
                        $this->action(2);
                    }
                    break;

                case "\n":
                    switch ($this->b) {
                        case '{':
                        case '[':
                        case '(':
                        case '+':
                        case '-':
                            $this->action(1);
                            break;

                        case ' ':
                            $this->action(3);
                            break;

                        default:
                            if ($this->isAlphaNum($this->b)) {
                                $this->action(1);
                            }
                            else {
                                $this->action(2);
                            }
                    }
                    break;

                default:
                    switch ($this->b) {
                        case ' ':
                            if ($this->isAlphaNum($this->a)) {
                                $this->action(1);
                                break;
                            }


                            $this->action(3);
                            break;

                        case "\n":
                            switch ($this->a) {
                                case '}':
                                case ']':
                                case ')':
                                case '+':
                                case '-':
                                case '"':
                                case "'":
                                    $this->action(1);
                                    break;

                                default:
                                    if ($this->isAlphaNum($this->a)) {
                                        $this->action(1);
                                    }
                                    else {
                                        $this->action(3);
                                    }
                            }
                            break;

                        default:
                            $this->action(1);
                            break;
                    }
            }
        }

        return $this->output;
    }

    protected function next() {
        $c = $this->get();

        if ($c === '/') {
            switch($this->peek()) {
                case '/':
                    for (;;) {
                        $c = $this->get();

                        if (ord($c) <= self::ORD_LF) {
                            return $c;
                        }
                    }

                case '*':
                    $this->get();

                    for (;;) {
                        switch($this->get()) {
                            case '*':
                                if ($this->peek() === '/') {
                                    $this->get();
                                    return ' ';
                                }
                                break;

                            case null:
                                throw new JSMinException('Unterminated comment.');
                        }
                    }

                default:
                    return $c;
            }
        }

        return $c;
    }

    protected function peek() {
        $this->lookAhead = $this->get();
        return $this->lookAhead;
    }
}

// -- Exceptions ---------------------------------------------------------------
class JSMinException extends Exception {}

function cache_filename() { return "../cache/_".implode('-',$GLOBALS['uses']).".js"; }
function has_cache() {

    $cachefile = cache_filename();
    // 5 minutes
    $cachetime = 5 * 60;

    return file_exists($cachefile) &&
        (time() - $cachetime < filemtime($cachefile));
}
function cache_get() {
    echo "/*reading cache*/",
    file_get_contents(cache_filename());

}
function cache_save() {
    $cachefile = cache_filename();

    // assicura che esista la dir cache
    $cache_folder = dirname(__FILE__).'/../cache';
    if( !is_dir($cache_folder) ) {
        mkdir_recursive($cache_folder, 0777);
    }

    // open the cache file "cache/home.html" for writing
    $fp = fopen($cachefile, 'w');
    if( $fp ) {
    // save the contents of output buffer to the file
        fwrite($fp, ob_get_contents() );
        // close the file
        fclose($fp);
    }
    // Send the output to the browser
    ob_end_flush();
}
function mkdir_recursive($pathname, $mode) {
    is_dir(dirname($pathname)) || mkdir_recursive(dirname($pathname), $mode);
    return is_dir($pathname) || @mkdir($pathname, $mode);
}
// -- Controller ---------------------------------------------------------------

// passare $_GET['cache']=0 forza il salto della cache, serve per lo sviluppo

$uses = isset($_GET['uses']) ? $_GET['uses'] : '';
$uses = explode(',', $uses );
/// var_dump( $uses );

// get dir listing as a whitelist
$whitelist = array();
$d = dir( dirname(__FILE__) );
while (false !== ($f = $d->read())) {
    if( $f != '.' && $f != '..' && ( substr($f,-3)=='.js') )
        $whitelist[] = substr($f,0,-3);
}
$d->close();

/// var_dump( $whitelist );

// compression
if (substr_count($_SERVER['HTTP_ACCEPT_ENCODING'], 'gzip') && extension_loaded('zlib') ) {
    ob_start("ob_gzhandler");
} else {
    ob_start();
}

// send the requisite header information and character set
header ("content-type: text/javascript; charset: UTF-8");
// check cached credentials and reprocess accordingly
header ("cache-control: must-revalidate");
// set variable for duration of cached content
$offset = 60 * 60;
// set variable specifying format of expiration header
$expire = "expires: " . gmdate ("D, d M Y H:i:s", time() + $offset) . " GMT";
// send cache expiration header to the client broswer
header ($expire);

$bypass_cache = ( isset($_GET['cache']) && $_GET['cache']==0 );
if( !has_cache() || $bypass_cache) {

    foreach( $whitelist as $f ) {
        if( in_array($f, $uses) ) {
        //echo $f;
        // TODO: more compression here
        //include_once("$f.js");
            echo JSMin::minify(file_get_contents("$f.js"));
        } else {
        //echo "//not in whitelist $f\n ";
        }
    }
    cache_save();
} else {
    cache_get();
}



