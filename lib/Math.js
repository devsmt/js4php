//int rand ( [int min, int max] )

function rand(min, max) {
    //function usefloor(min,max) {
    //  return Math.floor(Math.random()*(max-min+1)+min);
    //}
    //function useceil(min,max) {
    //  return Math.ceil(Math.random()*(max-min+1)+min-1);
    //}

    function useround(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    }
    return useround(min, max);
}
// float round ( float $val [, int $precision ] )

function round(f, ndec) {
    var i = Math.pow(10, ndec);
    var flt = Math.round(f * i) / i;
    return parseFloat(flt);
}

function int(s) {
    return parseInt(s, 10);
}


function RGB2Hex (
  a, // red, as a number from 0 to 255
  b, // green, as a number from 0 to 255
  c  // blue, as a number from 0 to 255
){
  return "#" +   // return a number sign, and
  (              // combine the octets into a 32-bit integer as: [1][a][b][c]
    (            // operator precedence is (+) > (<<) > (|)
      256  // [1][0]
      + a  // [1][a]
      << 8 // [1][a][0]
      | b  // [1][a][b]
    )
    << 8   // [1][a][b][0]
    | c    // [1][a][b][c]
  )
  .toString(16)  // then serialize to a hex string, and
  .slice(1);     // remove the 1 to get the number with 0s intact.
}