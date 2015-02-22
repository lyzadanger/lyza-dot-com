'use strict';

var gulp     = require('gulp');
var config   = require('../config');

gulp.task('watch', ['browserSync'], function(callback) {
  // This will change (task name)
  gulp.watch(config.protoHTML.src, ['proto-html']);
  gulp.watch(config.css.importDir + '/**/*', ['css']);
});
