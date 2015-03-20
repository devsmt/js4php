<html>
<head>
<!--
<script type="text/javascript" src="../lib/utils.js" ></script>
<script type="text/javascript" src="../lib/test.js" ></script>
<script type="text/javascript" src="../lib/Array.js" ></script>
<script type="text/javascript" src="../lib/String.js" ></script>
<script type="text/javascript" src="../lib/regexp.js" ></script>
<script type="text/javascript" src="../lib/serialize.js" ></script>
<script type="text/javascript" src="../lib/url.js" ></script>
<script type="text/javascript" src="../lib/Cookie.js" ></script>
<script type="text/javascript" src="../lib/date.js" ></script>
-->

<?php

if( !isset($_GET['test']) ) { ?>
    <script type="text/javascript"  >
    location.href = "?<?php echo http_build_query(array('test'=>1))?>";
    </script>
    <?php
}
?>

<script type="text/javascript" src="../lib/?cache=0&uses=test,utils,String,serialize,Math,regexp,Array,url,oo,Cookie,md5,Session" ></script>
<!-- untested -->
<script type="text/javascript" src="../lib/?cache=0&uses=date,strftime" ></script>
<!--
<script type='text/javascript' src='firebug-lite-compressed.js'></script>
-->

</head>
<body>
<script type="text/javascript">

function clean(v){
    if(v.replace){// se è una stringa non un int
        v = v.replace("s+", '', "gi");
        v = v.replace(RegExp( "\\n", "g" ), '');//"\n","gi"
        v = v.replace(/\\/, '', "gi");
        v = v.split(' ').join('');// toglie " " //v =v.replace(' ','',"gi");
    }
    return v;
};

window.onload = function(){
    if( ! window.console ){ // typeof window.console != 'undefined'
        include("firebug-lite-compressed.js");
        include("firebug-lite.css");
    }
    test({
            //-- Utils ---------------------------------------------------------------------------
            'print_r': function(){
                var o = {'a':1, 'b':2 };
                var control_val = "{'a': 1,'b': 2 }";
                var val = print_r(o);
                val = clean(val);
                control_val = clean(control_val);
                return test.ok( val == control_val, test.print_expected(val, control_val ) );
            },
            'print_r_string': function(){
                var val = clean(print_r('abcdef')),
                control_val = clean("'abcdef'");
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'print_r_int': function(){
                var val = clean(print_r(1)),
                control_val = '1';
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'print_r_array_empty': function(){
                var val = print_r([]),
                control_val = '[]';
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'print_r_array_int': function(){
                var val = clean(print_r([1,2])),
                control_val = clean('[1,2]');
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'print_r_object_empty': function(){
                var val = clean(print_r({})),
                control_val = clean('{}');
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'print_r_object': function(){
                var val = clean(print_r({'k': 1})),
                control_val = clean("{'k': 1}");
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },

            //---- json ------------------------------------------------------------------------------
            'json_encode_string': function(){
                var val = clean(json_encode('abcdef')),
                control_val = '"abcdef"';
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'json_encode_int': function(){
                var val = clean(json_encode(1)),
                control_val = '1';
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'json_encode_array': function(){
                var val = clean(json_encode([])),
                control_val = '[]';
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'json_encode_array_1': function(){
                var val = clean(json_encode([1,2])),
                control_val = '[1,2]';
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'json_encode_object': function(){
                var val = clean(json_encode({})),
                control_val = '{}';
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'json_encode_object': function(){
                var val = clean(json_encode({k: 1})),
                control_val = clean('{"k": 1}');
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            //-- args ----------------------------------------------------------
            'arg_init_test': function(){
                var arg = [];
                return test.ok( arg_init(arg, 0, 'test') === 'test', 'arg_init default test')
            },
            'arg_init_0': function(){
                var i = 0;
                var val = function(i){ return arg_init(arguments, 0, 'test') };
                return test.ok( val != 'test', 'arg_init 0 != test')
            },
            'obj_var_init': function(){
                var obj = {};
                var a = obj_var_init(obj, 'k', 'test');
                return test.ok( a['k'] === 'test', 'obj_var_init 0 == test');
            },
            'obj_vars_init': function(){
                var opt = obj_vars_init({count: 1}, {});
                return test.ok(opt['count'] === 1, 'obj_vars_init count=1');
            },
            'obj_vars_init_1': function(){
                var opt = obj_vars_init({count: 1}, {count: 2});
                return test.ok(opt['count'] === 2, 'obj_vars_init count=2');
            },
            'obj_vars_init_"': function(){
                var val = obj_vars_init({a: 1}, {b: 2});
                var control_val = {a: 1, b: 2 };
                return test.ok( array_equals(val, control_val) , test.print_expected(val, control_val ) );
            },

            /*-- lang utils ------------------------------------------------*/
            'isset': function(){
                var v = 'a';
                var control_val = true;
                var val = isset(v);
                return test.ok( val == control_val, 'isset');
            },
            'isset_null': function(){
                var val = isset(null);
                return test.ok( val == false, 'isset');
            },
            'isset_property': function(){
                var a = {'a':1};
                var val = isset(a.a);
                return test.ok( val == true, 'isset');
            },
            'is_null': function(){
                var v = 'str';
                var control_val = false;
                var val = is_null(v);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'empty': function(){
                var v = '';
                test.ok( empty(v), 'empty str len:'+v.length);
                //alert(  ' of type: '+typeof(v.length) +"''.length is "+ v.length  );
                test.ok( empty(0), 'empty 0');
                test.ok( empty(null), 'empty null');

                test.ok( empty({}), 'empty {}');
                test.ok( empty([]), 'empty []');
                test.ok( empty(undefined), 'empty undfined');
                test.ok( empty({'aFunc' : function () { } }) == false, 'empty Object litteral');

                test.ok( empty(false), '*false*');
                return true;
            },
            'is_array': function(){
                test.ok( is_array({}) , '{} is array');
                test.ok(  is_array([]), '[] is array');
                test.ok( !is_array(''), 'str !array');
                return true;
            },
            'is_string': function(){
                return test.ok( is_string(''), '');
            },
            'is_numeric': function(){
                return test.ok(
                    is_numeric(1) &&
                    is_numeric(0.1) &&
                    !is_numeric(false) &&
                    !is_numeric(true) &&
                    !is_numeric(null), '');
            },
            'is_float': function(){
                return test.ok( is_float(0.1), '');
            },
            'is_int': function(){
                return test.ok( is_int(1), '');
            },
            'is_integer': function(){
                return test.ok(is_integer(1), '');
            },
            'is_object': function(){
                //One of the quirks of JavaScript is that typeof null returns "object". But it’s not an object. So let’s check for that, too
                return
                test.ok( is_object({}), 'is_object({})') &&
                test.ok( !is_object(null), '!is_object null') &&
                test.ok( !is_object(0), '!is_object null') &&
                test.ok( !is_object([]), '!is_object null')
                ;
            },
            'is_function': function(){
                return test.ok( is_function(function(){}) , '');
            },
            'function_exists': function(){
                return test.ok( function_exists(function_exists), 'function exixsts with a function');
            },
            'function_exists_by_name': function(){
                return test.ok( function_exists('function_exists'), 'function exixsts with a function name');
            },

            'assert': function(){
                var v = 'str';
                var control_val = true;
                var val = assert( is_string(v), 'v must be string');
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'assert2': function(){
                var v = 'str';
                try {
                    v = assert( is_array(v), 'v must be array' );
                }  catch (e) {
                    if (e instanceof AssertException) {
                        return test.ok( true, 'we have an assertion' );
                    }
                }
                return test.ok( false, "we are expecting an assertion");
            },
            'ord': function(){
                var c = 'a';
                var control_val = <?php echo ord('a');?>;
                var val = ord(c);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'chr': function(){
                var i = 65;
                var control_val = '<?php echo chr(65);?>';
                var val = chr(i);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'addslashes': function(){
                var s="'";
                var control_val = "\\'";
                var val = addslashes(s);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'nl2br': function(){
                var s = "a\nb";
                var control_val = "a<br />\nb";
                var val = nl2br(s);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'htmlentities': function(){
                var s='';
                var control_val = '';
                var val = htmlentities(s);
                return test.ok( val == control_val, test.print_expected(val, control_val ) );
            },
            'round': function(){
                var f = 0.111111111, ndec = 2;
                var control_val = 0.11;
                var val = round(f, ndec);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'sprintf_k': function(){
                var control_val = 'ok!';
                var val = sprintf('{test}!',{'test':'ok'});
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'sprintf_i': function(){
                var control_val = 'ok!';
                var val = sprintf('{0}!',['ok']);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'sprintf_i2': function(){
                var control_val = 'ok!';
                var val = sprintf('{1}!',['false','ok']);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'sprintf_args': function(){
                var control_val = 'Format error';
                var val = sprintf('{1}!','string');
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'log_error': function(){

                set_error_handler();

                var m='test log';
                var control_val = 0;
                var val = log_error(m) ;
                log_error('log 2');
                log_error('log 3');
                return test.ok( true, test.print_expected(val, control_val ));
            },
            'rand': function(){
                var min = 0, max = 5 ;
                var val = rand(min,max );
                return test.ok( val >= 0 && val<=5, val+" is not between 0 and 5");
            },
            'include_css': function(){
                include_once( 'include_test.css', function(){
                        // come verificaer se il css è ssettato?
                        return test.ok( true ,'incluso background #ccc');
                });
            },
            'include_js': function(){
                include('include_test.js', function(){
                        var val =  typeof(window.include_test),
                        control_val = "function";
                        return test.ok(  val == control_val , test.print_expected(val, control_val ));
                } );
            },
            'include_once': function(){
                include_once(  'include_test.js', function(){
                        return test.ok( typeof(window.include_test)=="function" ,'include_once ');
                });
            }
    });



    //-- String -------------------------------------------------------------------------------------------------------------------
    test({
            'reg_match': function(){
                var p='[a-z]', s='javascript';
                var control_val = true;
                var val = reg_match(p, s);
                val = val.length > 0;
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'substr_0':function(){
                var val = substr('abcdef', 0, -1),
                control_val = 'abcde';
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'substr_1':function(){
                var val = substr(2, 0, -6),
                control_val = '';
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'explode': function(){
                var sep=',', str = 'a,b';
                var val = explode(sep, str);
                return test.ok( in_array('a',val) && in_array('b',val), 'explode');
            },
            'implode': function(){
                var sep = ',', a = ['a','b'];
                var control_val = 'a,b';
                var val = implode(sep, a);
                return test.ok( val == control_val, 'implode');
            },
            'str_replace': function(){
                var s_s = 'a', s_r = 'b', s = 'aa_A';
                var control_val = 'bb_A';
                var val = str_replace(s_s, s_r, s);
                return test.ok( val == control_val, 'str_replace');
            },
            'str_ireplace': function(){
                var s_s = 'a', s_r = 'b', s = 'aA';
                var control_val = 'bb';
                var val = str_ireplace(s_s, s_r, s);
                return test.ok( val == control_val, 'str_ireplace '+ val );
            },
            // STR_PAD_RIGHT = 1
            // STR_PAD_LEFT = 2
            // STR_PAD_BOTH. = 3
            // pad_type default: STR_PAD_RIGHT.
            'str_pad_r': function(){
                var str = 'a', len = '3', ps = '_', t = STR_PAD_RIGHT;
                var control_val = 'a__';
                var val = str_pad(str, len, ps, t);
                return test.ok( val == control_val, 'str_pad right');
            },
            'str_pad_l': function(){
                var str = 'a', len = '3', ps = '_', t = STR_PAD_LEFT;
                var control_val = '__a';
                var val = str_pad(str, len, ps, t);
                return test.ok( val == control_val, 'str_pad left');
            },
            'str_pad_both': function(){
                var str = 'a', len = '3', ps = '_', t = STR_PAD_BOTH;
                var control_val = '_a_';
                var val = str_pad(str, len, ps, t);
                return test.ok( val == control_val, 'str_pad both');
            },
            'stripslashes': function(){
                var s = '_\'_';
                var control_val = "_'_";
                var val = stripslashes(s);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'strlen': function(){
                var s = 'abc';
                var control_val = 3;
                var val = strlen(s);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'strpos': function(){
                var s = 'abcd', sub='b';
                var control_val = 1;
                var val = strpos(s, sub);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'strtolower': function(){
                var s = 'A1';
                var control_val = 'a1';
                var val = strtolower(s);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'strtoupper': function(){
                var s ='a1';
                var control_val = 'A1';
                var val = strtoupper(s);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'substr_count': function(){
                var s ='ababab', subs='a';
                var control_val = 3;
                var val = substr_count(s, subs);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'trim': function(){
                var s = ' a ';
                var control_val = 'a';
                var val = trim(s);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'ucfirst': function(){
                var s = 'abc';
                var control_val = 'Abc';
                var val = ucfirst(s);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'ucwords': function(){
                var s = 'abc abc';
                var control_val = 'Abc Abc';
                var val = ucwords(s);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'str_repeat': function(){
                var s = 'abc';
                var control_val = 'abcabc';
                var val = str_repeat(s,2);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'str_reminder': function(){
                var str = str_repeat('a', 100);
                var control_val = str_repeat('a', 20-3) + '...';
                var val = str_reminder(str, 20, '...');
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'str_left': function(){
                var s ='aabb', ln=2;
                var control_val = 'aa';
                var val = str_left(s, ln);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'str_right': function(){
                var s = 'aabb', i=2;
                var control_val = 'bb';
                var val = str_right(s, i);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'str_match': function(){
                var s='aabb', sub='aa';
                var control_val = true;
                var val = str_match(s, sub);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'reg_replace': function(){
                var p='[aeiou]', replacement='*', s="javascript";
                var control_val = 'j*v*scr*pt';
                var val = reg_replace(p, replacement, s);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'reg_test': function(){
                var p='[aeiou]', s='javascript';
                var control_val = true;
                var val = reg_test(p, s);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            }
    });

    //-- array -------------------------------------------------
    test({
            'count': function(){
                var ar = [0,1,2];
                var control_val = 3;
                var val = count(ar);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'count_ea': function(){
                var ar = [];
                var control_val = 0;
                var val = count(ar);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'count_obj': function(){
                var ar = {'a':0};
                var control_val = 1;
                var val = count(ar);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'count_empty_obj': function(){
                var ar = {};
                var control_val = 0;
                var val = count(ar);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'in_array': function(){
                var needle = 'a', a = ['a','b'];
                var control_val = true;
                var val = in_array(needle, a)  ;
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'array_search': function(){
                var needle = 'a', a = ['b','a'];
                var control_val = 1;
                var val = array_search(needle, a)  ;
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'array_key_exists': function(){
                var needle = 'a', a = {'a':0, 'b':1};
                var control_val = true;
                var val = array_key_exists(needle, a);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'array_values': function(){
                var a = {'a':0, 'b':1};
                var control_val = [0,1];
                var val = array_values(a);
                return test.ok( array_equals(val, control_val), test.print_expected(val, control_val ));
            },
            'array_keys': function(){
                var a = {'a':0, 'b':1};
                var control_val = ['a','b'];
                var val = array_keys(a);
                return test.ok( array_equals(val, control_val), test.print_expected(val, control_val ));
            },
            'array_unique': function(){
                var a = ['a', 'b', 'a'];
                var control_val = ['a','b'];
                var val = array_unique(a);
                return test.ok( array_equals(val, control_val), test.print_expected(val, control_val ));
            },
            'array_pop': function(){
                var a =[1,2];
                var control_val = 2;
                var val = array_pop(a);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'array_push': function(){
                var val=[1];
                var control_val = [1,2];
                array_push(val, 2);
                return test.ok( array_equals(val,control_val), test.print_expected(val, control_val ));
            },
            'array_slice': function(){
                var  a = [1,2,3,4,5], offset=1, len=2 ;
                var control_val = [2,3];
                var val = array_slice( a, offset, len );
                return test.ok( array_equals(val, control_val), test.print_expected(val, control_val ));
            },
            'array_merge': function(){
                var r =[1,2];
                var control_val = [1,2,3];
                var val = array_merge(r, [3]);
                return test.ok( array_equals(val, control_val), test.print_expected(val, control_val ));
            },
            'array_merge_obj': function(){
                var r = {a:1, b:2};
                var control_val = {a:1, b:2, c:3};
                var val = array_merge(r, {c: 3});
                return test.ok( array_equals(val, control_val), test.print_expected(val, control_val ));
            },
            'array_merge_subobj': function(){
                var r = {a:1, b:2};
                var control_val = {a:1, b:2, c: { d: 3}};
                var val = array_merge(r, {c: { d: 3}});
                return test.ok( array_equals(val, control_val), test.print_expected(val, control_val ));
            },
            'array_merge_subobj': function(){
                var r = {a:1, b:2, c:{} };
                var control_val = {a:1, b:2, c: { d: 3} };
                var val = array_merge(r, {c: { d: 3} });
                var_dump( control_val );
                return test.ok( array_equals(val, control_val), test.print_expected(val, control_val ));
            },

            'array_map': function(){
                var a = [1,2,3];
                var control_val = [1,4,9];
                var val = array_map(function(v, i){ return v*v; }, a);
                return test.ok( array_equals(val , control_val), test.print_expected(val, control_val ));
            },
            'array_reduce': function(){
                var a = [1,2,3];
                var control_val = <?php
                function rsum($v, $w) { $v += $w; return $v; }
                echo array_reduce(array(1, 2, 3), "rsum");
                ?>;
                var val = array_reduce(a, function(acc, v){ return acc+v; });

                return test.ok( array_equals(val , control_val), test.print_expected(val, control_val ));
            },
            'array_filter': function(){
                var a=[1,2,3]
                var control_val = [1,2,3];
                var val = array_filter(a, function(v){ return true; } );
                return test.ok( array_equals(val , control_val) , test.print_expected(val, control_val ));
            },
            'array_reverse': function(){
                var a = [1,2,3];
                var control_val = [3,2,1];
                var val = array_reverse(a);
                return test.ok( array_equals(val , control_val), test.print_expected(val, control_val ));
            },
            'array_search': function(){
                var v = 1, a=[1,2,3];
                var control_val = 0;
                var val = array_search(v, a);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'array_last_index_of': function(){
                var v = 1, a=[1,2,3,1];
                var control_val = 3;
                var val = array_last_index_of(v, a);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'array_get_first': function(){
                var a = [0,1,2,3];
                var control_val = 0;
                var val = array_get_first(a);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'array_get_last': function(){
                var a = [0,1,2,3];
                var control_val = 3;
                var val = array_get_last(a);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'array_prepend': function(){
                var a=[1,2], elem=0;
                var control_val = [0,1,2];
                var val = array_prepend(a, elem);
                return test.ok( array_equals(val,control_val), test.print_expected(val, control_val ));
            },
            'array_append': function(){
                var a=[0,1], elem =2;
                var control_val = [0,1,2];
                var val = array_append(a, elem);
                return test.ok( array_equals(val,control_val), test.print_expected(val, control_val ));
            },
            'range': function(){

                var control_val = range( 0, 12 );
                var val = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
                test.ok( array_equals(val,control_val), test.print_expected(val, control_val ));

                var control_val = range( 0, 100, 10 );
                var val = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
                test.ok( array_equals(val,control_val), test.print_expected(val, control_val ));

                var control_val =  range( 'a', 'i' );
                var val = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
                test.ok( array_equals(val,control_val), test.print_expected(val, control_val ));


                var control_val = range( 'c', 'a' );
                var val = ['c', 'b', 'a'] ;
                test.ok( array_equals(val,control_val), test.print_expected(val, control_val ));
            },
            'array_pad': function(){

                var control_val = array_pad([ 7, 8, 9 ], 2, 'a');
                var val = [ 7, 8, 9];
                test.ok( array_equals(val,control_val), test.print_expected(val, control_val ));

                var control_val = array_pad([ 7, 8, 9 ], 5, 'a');
                var val = [ 7, 8, 9, 'a', 'a'];
                test.ok( array_equals(val,control_val), test.print_expected(val, control_val ));

                var control_val = array_pad([ 7, 8, 9 ], 5, 2);
                var val = [ 7, 8, 9, 2, 2];
                test.ok( array_equals(val,control_val), test.print_expected(val, control_val ));

                var control_val = array_pad([ 7, 8, 9 ], -5, 'a');
                var val = [ 'a', 'a', 7, 8, 9 ];
                test.ok( array_equals(val,control_val), test.print_expected(val, control_val ));
            },
            'sort': function(){
                var control_val = {d: 'lemon', a: 'orange', b: 'banana', c: 'apple'}
                sort(control_val);
                var val = {0: 'apple', 1: 'banana', 2: 'lemon', 3: 'orange'};
                test.ok( array_equals(val,control_val), test.print_expected(val, control_val ));
            },
            'rsort': function(){
                var control_val = {d: 'lemon', a: 'orange', b: 'banana', c: 'apple'};
                rsort(control_val);
                var val = {0: 'orange', 1: 'lemon', 2: 'banana', 3: 'apple'};
                test.ok( array_equals(val,control_val), test.print_expected(val, control_val ));
            },
            'ksort': function(){
                var control_val = {2: 'a', 3: 'b', 1: 'c'} ;
                ksort( control_val );
                var val = {1: 'c', 2: 'a', 3: 'b'};
                test.ok( array_equals(val,control_val), test.print_expected(val, control_val ));
            },
            'krsort': function(){
                var control_val = {2: 'a', 3: 'b', 1: 'c'} ;
                krsort(control_val);
                var val = { 3: 'b', 2: 'a', 1: 'c'};
                test.ok( array_equals(val,control_val), test.print_expected(val, control_val ));
            }
    });



    //-- Url --------------------------------------------------
    test({
            'urldecode': function(){
                var s="<?php echo urldecode(',/?:@&=+$# '); ?>";
                var control_val = urldecode(',/?:@&=+$# ');
                var val = urldecode(s);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'urlencode': function(){
                var control_val = "<?php echo urlencode(',/?:@&=+$# ');?>";
                var val = urlencode(',/?:@&=+$# ');
                return test.ok(  val == control_val, test.print_expected(val, control_val ));
            },
            'http_build_query': function(){
                var a = {'a':0,'b':1};
                var control_val = "<?php echo http_build_query(array('a'=>0,'b'=>1))?>";
                var val = http_build_query(a);
                return test.ok(  val == control_val, test.print_expected(val, control_val ));
            },
            'basename': function(){
                var control_val = "<?php echo basename($_SERVER['PHP_SELF'])?>";
                var val = basename();
                return test.ok(  val == control_val, test.print_expected(val, control_val ));
            },
            'dirname': function(){
                var control_val = "<?php echo dirname($_SERVER['PHP_SELF'])?>";
                var val = dirname();
                return test.ok(  val == control_val, test.print_expected(val, control_val ));
            },
            'self_uri': function(){
                var control_val = "<?php echo $_SERVER['REQUEST_URI']?>";
                var val = self_uri();
                return test.ok(  val == control_val, test.print_expected(val, control_val ));
            },
            'parse_url': function(){
                var control_val = <?php echo json_encode(parse_url($_SERVER['REQUEST_URI']))?>;
                var val = parse_url("<?=$_SERVER['REQUEST_URI']?>");
                return test.ok( array_equals( val , control_val), test.print_expected(val, control_val ));
            },

            'parse_url_path': function(){
                var url = "http://tazio.copiaincolla.ufficio/uploads/portfolioimage/image/tmb/700x700-6b94e266243bf47c933361ea45bb3e257c9ff407.jpg";
                var control_val = "/uploads/portfolioimage/image/tmb/700x700-6b94e266243bf47c933361ea45bb3e257c9ff407.jpg";
                var o = parse_url(url);

                val = o['path'];
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },

            '_GET': function(){
                var control_val = 1;
                var val = _GET['test'];
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            },
            'get_init': function(){
                var control_val = 1;
                var val = get_init('test', null);
                return test.ok( val == control_val, test.print_expected(val, control_val ));
            }
    });


    //-- OO ----------------------------------------------------



    test({

            'class_exists': function(){
                var aclass = function(){ aclass.id = 1; };
                aclass.prototype.id = 0;
                var val = class_exists( aclass );
                var control_val = true;
                return test.ok( val == control_val, test.print_expected(val, control_val ) );
            },

            'extend': function(){
                var Person = function(){}
                Person.prototype.getName = function(){ return 'name'; }

                var Author = function(){  };
                Author.prototype.id = 0;

                extend(Author, Person, {
                        getVal: function(){
                            return 'ok';
                        }
                });

                // test inheritance
                var a = new Author();
                var val = a.getName();
                var control_val = 'name';


                // test ovverridden
                var overridden_val = a.getVal();
                var overridden_control_val = 'ok';


                return
                test.ok( val == control_val, test.print_expected(val, control_val ) ) &&
                test.ok( overridden_val == overridden_control_val, test.print_expected(overridden_val, overridden_control_val ) )
                ;
            },
            'mixin': function(){
                var Author = function(){};

                var Serializable = function() {};
                Serializable.prototype = {
                    serialize: function() {
                        return 'ok';
                    }
                };
                mixin(Author, Serializable);

                var author = new Author();

                var val = author.serialize();
                var control_val = 'ok';
                return test.ok( val == control_val, test.print_expected(val, control_val ) );
            },
            'Interface': function(){
                var Composite = new Interface('Composite', ['add', 'remove']);

                var CompositeClass = function() {
                    this.add = function(){}
                    this.remove = function(){}

                    try{
                        Interface.ensureImplements(Composite);
                        return test.ok(true, "Class implements Interface");
                    } catch( e ){
                        return test.fail();
                    }
                };
            },
            'Interface_unimplemented': function(){
                var Composite = new Interface('Composite', ['add', 'remove']);

                var CompositeClass = function() {
                    try {
                        Interface.ensureImplements(this, Composite);

                        return test.fail();
                    } catch( e ){
                        // we got the correct error, the check works
                        return test.ok( true );
                    }
                };

            },
            'class_implements': function(){
                var Composite = new Interface('Composite', ['add', 'remove']);
                var c = new Class({
                        Implements: Composite
                });
                try {
                    Interface.ensureImplements(c, Composite);
                    return test.fail();
                } catch( e ){
                    // we got the correct error, the check works
                    return test.ok( true );
                }
            }
    });

    var INamed = new Interface('INamed', ['hasName', 'getName', 'setName']);
    var Person = Class.extend({
            init: function(isDancing){
                this.dancing = isDancing;
                Interface.ensureImplements(this, INamed);
            },
            hasName: function(){
                return true;
            },
            getName: function(){
                return true;
            },
            setName: function(){
                return true;
            }
    });
    var Ninja = Person.extend({
            init: function(){
                this.__construct( false );
            }
    });

    var p = new Person(true);

    var n = new Ninja();

    test({
            'p_has_prop': function(){
                return test.ok(
                    p.dancing == true, ''
                    );
            },
            'n_has_prop': function(){
                return test.ok(
                    n.dancing == false, ''
                    );
            },
            'n_has_method': function(){
                return test.ok(
                    n.hasName() == true, ''
                    );
            },
            'n_implements_INamed': function(){
                return test.ok(
                    Interface.ensureImplements(n, INamed), ''
                    );
            },
            'instance_of': function(){
                return test.ok(
                    p instanceof Person &&
                    p instanceof Class &&
                    n instanceof Ninja &&
                    n instanceof Person &&
                    n instanceof Class == true, ''
                    );
            }
    });
    /*
    test({
        'p_has_prop': function(){
            return test.ok(
                p.dancing == true, ''
                );
        },
        'str_to_ms': function(){
            var val = str_to_ms('2d');
            var control_val = 172800000;
            test.ok( val == control_val, test.print_expected(val, control_val ) );

            var val = str_to_ms('1.5h');
            var control_val = 5400000;
            test.ok( val == control_val, test.print_expected(val, control_val ) );

            var val = str_to_ms('1h');
            var control_val = 3600000;
            test.ok( val == control_val, test.print_expected(val, control_val ) );

            var val = str_to_ms('1m');
            var control_val = 60000;
            test.ok( val == control_val, test.print_expected(val, control_val ) );

            var val = str_to_ms('5s');
            var control_val = 5000;
            test.ok( val == control_val, test.print_expected(val, control_val ) );

            var val = str_to_ms('500ms');
            var control_val = 500;
            test.ok( val == control_val, test.print_expected(val, control_val ) );

            var val = str_to_ms('100');
            var control_val = 100;
            test.ok( val == control_val, test.print_expected(val, control_val ) );

            var val = str_to_ms(100);
            var control_val = 100;
            test.ok( val == control_val, test.print_expected(val, control_val ) );

            var val = str_to_ms('1.5h');
            var control_val = 5400000;
            test.ok( val == control_val, test.print_expected(val, control_val ) );

            var val = str_to_ms('1h');
            var control_val = 3600000;
            test.ok( val == control_val, test.print_expected(val, control_val ) );

            var val = str_to_ms('1m');
            var control_val = 60000;
            test.ok( val == control_val, test.print_expected(val, control_val ) );

            var val = str_to_ms('5s');
            var control_val = 5000;
            test.ok( val == control_val, test.print_expected(val, control_val ) );

            var val = str_to_ms('500ms');
            var control_val = 500;
            test.ok( val == control_val, test.print_expected(val, control_val ) );

            var val = str_to_ms('100');
            var control_val = 100;
            test.ok( val == control_val, test.print_expected(val, control_val ) );

            var val = str_to_ms(100);
            var control_val = 100;
            test.ok( val == control_val, test.print_expected(val, control_val ) );
        }

    });
    */
    //-- casts -------------------------------------------------------------
    test({
            'setType': function(){
                var val = setType('1', 'int');
                var control_val = 1;
                return test.ok( val == control_val, test.print_expected(val, control_val ) );
            },

            'int': function(){
                var val = int('1');
                var control_val = 1;
                return test.ok( val == control_val, test.print_expected(val, control_val ) );
            },

            'bool': function(){
                var val = as_bool('1');
                var control_val = true;
                return test.ok( val == control_val, test.print_expected(val, control_val ) );
            },

            'float': function(){
                var val = as_float('1.11');
                var control_val = 1.11;
                return test.ok( val == control_val, test.print_expected(val, control_val ) );
            },

            'string': function(){
                var val = as_string(11);
                var control_val = '11';
                return test.ok( val == control_val, test.print_expected(val, control_val ) );
            },

            // 'array': function(){
            //     var val = as_array('1');
            //     var control_val = [1];
            //     return test.ok( val == control_val, test.print_expected(val, control_val ) );
            // },


    });





    /*
    //-- casts -------------------------------------------------------------
    test({
            'setType': function(){
                var val = setType('1', 'int');
                var control_val = 1;
                return test.ok( val == control_val, test.print_expected(val, control_val ) );
            },

            'int': function(){
                var val = int('1');
                var control_val = 1;
                return test.ok( val == control_val, test.print_expected(val, control_val ) );
            },

            'bool': function(){
                var val = bool('1');
                var control_val = true;
                return test.ok( val == control_val, test.print_expected(val, control_val ) );
            },

            'float': function(){
                var val = float('1.11');
                var control_val = 1.11;
                return test.ok( val == control_val, test.print_expected(val, control_val ) );
            },

            'string': function(){
                var val = string(11);
                var control_val = '11';
                return test.ok( val == control_val, test.print_expected(val, control_val ) );
            },

            'array': function(){
                var val = setType('1');
                var control_val = [1];
                return test.ok( val == control_val, test.print_expected(val, control_val ) );
            },

            'unset': function(){
                var val = 1;
                unset(val);
                var control_val = null;
                return test.ok( val == control_val, test.print_expected(val, control_val ) );
            }
    });
    */








    /*
    //-- strftime -------------------------------------------------------------
    test({
    'strftime': function(){
    var val = strftime("%Y-%m-%d", <?=( time() )?>);
    var control_val = <?=strftime("%Y-%m-%d", strtotime( time() ))?>;
    return test.ok( val == control_val, test.print_expected(val, control_val ) );
    }
    });

    /*
    TODO:
    'unset': function(){
    var v = {'k': 1};
    unset( v['k'] );
    return test.ok( count(v)==0, 'we should have an empty array '+count(v));
    },
    'array_match_every': function(){
    var func, context;
    var control_val = 0;
    var val = array_match_every(func, context) ;
    return test.ok( val == control_val, test.print_expected(val, control_val ));
    },
    'array_match_some': function(){
    var func, context;
    var control_val = 0;
    var val = array_match_some(func, context) ;
    return test.ok( val == control_val, test.print_expected(val, control_val ));   },

    // TODO: move away from utils
    // var control_val = 0;    var val = move away from utils
    // return test.ok( val == control_val, test.print_expected(val, control_val ));   },
    'serialize': function(){
    var obj;
    var control_val = 0;
    var val = serialize(obj);
    return test.ok( val == control_val, test.print_expected(val, control_val ));
    },
    'unserialize': function(){ var v;
    var control_val = 0;    var val = unserialize(v);
    return test.ok( val == control_val, test.print_expected(val, control_val ));
    },
    'wait': function(){ var test, callback, failed_callback, max;
    var control_val = 0;    var val = wait(test, callback, failed_callback, max) ;
    return test.ok( val == control_val, test.print_expected(val, control_val ));
    },
    'check_and_callback': function(){
    var control_val = 0;    var val = check_and_callback() ;
    return test.ok( val == control_val, test.print_expected(val, control_val ));   },
    'queue': function(){ var a;
    var control_val = 0;    var val = queue(a);
    return test.ok( val == control_val, test.print_expected(val, control_val ));   },
    'stack': function(){ var a;
    var control_val = 0;    var val = stack(a);
    return test.ok( val == control_val, test.print_expected(val, control_val ));   }
    'getimagesize': function(){
    var url = 'mozilla-logo.png';
    var control_val = [96,102];
    var val = getimagesize(url);
    return test.ok( val == control_val, test.print_expected(val, control_val ));
    },
    'echo': function(){
    var control_val = 0;
    var val = echo('test echo');
    return test.ok( true, test.print_expected(val, control_val ));
    },

    //-- serialize ----------------------------------------
    test({
    'serialize_unserialize': function(){
    var control_val=[0,1];
    var val = unserialize(serialize(control_val));
    return test.ok( array_equals(val,control_val), test.print_expected(val, control_val ));
    },
    'unserialize': function(){
    var s="<?php echo serialize(array(0,1))?>";
    var control_val = [0,1];
    var val = unserialize(s);
    return test.ok( array_equals(val,control_val), test.print_expected(val, control_val ));
    }
    });
    */
} // end onload

</script>
</body>
</html>
