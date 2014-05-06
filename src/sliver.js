var _ = require( 'lodash' ),
	getMac = require( 'getmac' ).getMac,
	jump = require( 'basejump' ),
	murmur = require( 'murmurhash3' );

// 128 bit ids can generate up to
//          1    1    2    2    3    3   3
//     5    0    5    0    5    0    5   9
// 340282366920938463463374607431768211456
// unique ids.
// By base-62 encoding them, we can shorten the length of id to 22 places

// via http://stackoverflow.com/questions/10253601/converting-large-integer-to-8-byte-array-in-javascript
function bytesFromHex(str,pad){
  if (str.length%2) str="0"+str;
  var bytes = str.match(/../g).map(function(s){
    return parseInt(s,16);
  });
  if (pad) for (var i=bytes.length;i<pad;++i) bytes.unshift(0);
  return bytes;
};

// via http://stackoverflow.com/questions/8482309/converting-javascript-integer-to-byte-array-and-back
function longToBytes(long) {
    // we want to represent the input as a 8-bytes array
    var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
    for ( var index = 0; index < byteArray.length; index ++ ) {
        var byte = long & 0xff;
        byteArray [ index ] = byte;
        long = ( (long - byte) / 256 );
    }
    return byteArray.reverse();
};

function getNodeBytesFromMac( done ) {
	getMac( function( err, address ) {
		if( err ) {
			var bytes = getNodeBytesFromSeed( OS.hostname() );
			done( bytes );
		} else {
			var bytes = bytesFromHex( address.split( /[:-]/ ).join( '' ) );
			done( bytes );
		}
	} );
};

function getNodeBytesFromSeed( seed ) {
	var murm = murmur.murmur32Sync( seed.toString() );
	bytes = longToBytes( murm ).splice( 2 );
	return bytes;
};

var instanceCount = 0;

var Sliver = function( seed, ready ) {
	ready = ready || function() {};
	this.lastMs = Date.now();
	this.msCounter = 0;
	this.seed = seed;
	this.msBytes = [ 0, 0 ];
	this.index = ++instanceCount;
	if( !seed ) {
		getMac( function( err, mac ) {
			getNodeBytesFromMac( function( bytes ) {
				this.seed = bytes;
				ready();
			}.bind( this ) );
		}.bind( this ) );
	} else {
		this.seed = getNodeBytesFromSeed( seed );
		ready();
	}
};

Sliver.prototype.getId = function() {
	this.updateTime();
	var bytes = this.timestamp.concat( this.seed, this.msBytes ).reverse();
	return jump.toBase62( bytes );
};

Sliver.prototype.updateTime = function() {
	var now = Date.now();
	var change = false;
	if( now < this.lastMs ) {
		throw 'Everything you know is a lie; NTP just jumped in space-time!';
	}
	else if( now > this.lastMs ) {
		change = true;
		this.msCounter = 0;
		this.msBytes = [ 0, 0 ];
		this.lastMs = now;
		this.timestamp = longToBytes( now );
	} else {
		this.msCounter++;
		this.msBytes = [ 0, 0 ].concat( longToBytes( this.msCounter ) ).splice( -2, 2 );
	}
	return change;
};

var generator;

module.exports = function( seed, ready ) {
	if( _.isFunction( seed ) ) {
		ready = seed;
		seed = undefined;
	}
	if( generator && ready ) {
		ready();
	} else {
		generator = new Sliver( seed, ready );
	}
	return generator;
};