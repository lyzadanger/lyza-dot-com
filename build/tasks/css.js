'use strict';

var gulp = require('gulp');
var config = require('../config').css;
var postcss = require('gulp-postcss');
var cssnext = require('cssnext');

gulp.task('css', function() {
  var processors = [
    cssnext({
      features: {
        import: {
          path: [config.importDir]
        }
      }
    })
  ];
  return gulp.src(config.src)
    .pipe(postcss(processors))
    .pipe(gulp.dest(config.dest));
});
