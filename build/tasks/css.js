'use strict';

var gulp = require('gulp');
var config = require('../config');
var postcss = require('gulp-postcss');
var cssnext = require('cssnext');

var opts = {
  importDir: config.dirs.styles,
  src      : config.srcs.styles,
  dest     : config.dest + '/css'
};

gulp.task('css', function() {
  var processors = [
    cssnext({
      compress: true,
      features: {
        import: {
          path: [opts.importDir]
        }
      }
    })
  ];
  return gulp.src(opts.src)
    .pipe(postcss(processors))
    .pipe(gulp.dest(opts.dest));
});
