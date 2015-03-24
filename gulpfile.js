var gulp = require( 'gulp' );
var bg = require( 'biggulp' )( gulp );

gulp.task( 'test', bg.withCoverage() );

gulp.task( 'watch', function() {
	bg.watch( [ 'test' ] );
} );

gulp.task( 'show-coverage', bg.showCoverage() );
gulp.task( 'default', [ 'test', 'watch' ], function() {} );
