// permette di salvare contenuti remoti per riusarli velocemente
// implemente un timetolive dei dati
var Cache = {
    hostHasStorage: function() {
        if( typeof localStorage == 'undefined' || localStorage === null) {
            return false;
        }
        // cahce del test
        if( typeof Cache._hasStorage != 'undefined' ){
            return Cache._hasStorage;
        }
        try {
            var randk = '__'+(new Date().getTime().toString())+'__';
            var v = 'test_val';
            localStorage.setItem(randk, v);
            localStorage.removeItem(randk);
            Cache._hasStorage = true;
            return true;
        } catch (exception) {
            Cache._hasStorage = false;
            return false;
        }
    },
    get: function(k, def){
        if (Cache.hostHasStorage()) {
            if( Cache.has(k) ) {
                var object = JSON.parse(localStorage.getItem(k));
                var value = object.value;
                return value;
            } else {
                if( typeof def != 'undefined' ) {
                    return def;
                } else {
                    return null;
                }
            }
        } else {
            return null;
        }
    },
    has: function(k){
        if (Cache.hostHasStorage()) {
            var jsonval = localStorage.getItem(k);
            if( jsonval ){
                // controllo di validità
                var object = JSON.parse(jsonval);
                var value = object.value;
                var timestamp = object.timestamp || 0;
                var ttl = object.timetolive;

                var date = new Date();
                var current_s = Math.round(date.getTime()/1000);
                var expires_at_s = (timestamp+ttl);

                console.log('Cache: expiration of '+k+' : '+(expires_at_s) +'>'+ current_s);
                if ( expires_at_s >= current_s ) {
                    // valido
                    return true;
                } else {
                    // vecchio
                    Cache.unset(k);
                    console.log('Cache: '+k+' expired: '+(expires_at_s) +'>'+ current_s);
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    },
    set: function(k,v, ttl){

        if (Cache.hostHasStorage()) {
            if( typeof ttl == 'undefined' ) {
                ttl = 1*60*60;//1h
            }

            var date = new Date();
            var current_s = Math.round(date.getTime()/1000);

            localStorage.setItem(k, JSON.stringify({
                value: v, timestamp: current_s, timetolive: ttl}
            ));
            return true;
        } else {
            return false;
        }
    },
    unset: function(k){
        if (Cache.hostHasStorage()) {
            localStorage.removeItem(k);
        } else {
            return false;
        }
    },
    clear: function(){
        if (Cache.hostHasStorage()) {
            localStorage.clear();
        } else {
            return false;
        }
    }
};