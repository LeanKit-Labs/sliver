require( 'should' );
var path = require( 'path' ),
	_ = require( 'lodash' );

describe( 'when starting up without a seed', function() {
	var sliver;
	before( function( done ) {
		sliver = require( '../src/sliver.js' )( done );
	} );

	it( 'should seed from MAC Address', function() {
		sliver.seed.length.should.equal( 6 );
	} );

	it( 'should start with instance count of 1', function() {
		sliver.index.should.equal( 1 );
	} );

	describe( 'if requiring a new instance', function() {
		before( function( done ) {
			sliver = require( '../src/sliver.js' )( done );
		} );

		it( 'should not create an additional instance', function() {
			sliver.index.should.equal( 1 );
		} );
	} );

	describe( 'when getting an id', function() {
		var id;
		before( function() {
			id = sliver.getId();
		} );

		it( 'should get a valid id', function() {
			id.length.should.equal( 22 );
		} );
	} );

	describe( 'when getting 10,000 ids', function() {
		var diff;
		var list = [];
		var idCount = 10000;
		this.timeout( 10000 );
		before( function( done ) {
			var start = process.hrtime();
			for (i = 0; i < idCount; i++) {
				list.push( sliver.getId() );
				if ( list.length == idCount ) {
					diff = process.hrtime( start );
					diff = ( diff[ 0 ] * 1e9 + diff[ 1 ] ) / 1000000;
					done();
				}
			}
		} );

		it( 'should produce only unique ids', function() {
			_.unique( list ).length.should.equal( idCount );
		} );

		it( 'should average 10 ids/ms', function() {
			( idCount / diff ).should.be.greaterThan( 10 );
		} );
	} );
} );

describe( 'when starting with a seed', function() {
	var sliver;
	before( function( done ) {
		var sliverPath = path.resolve( './src/sliver.js' );
		delete require.cache[ sliverPath ];
		sliver = require( '../src/sliver.js' )( 'burple', done );
	} );

	it( 'should seed from seed value', function() {
		sliver.seed.length.should.equal( 6 );
	} );

	it( 'should start with instance count of 1', function() {
		sliver.index.should.equal( 1 );
	} );
} );
