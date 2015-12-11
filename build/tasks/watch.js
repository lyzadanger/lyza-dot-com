'use strict';

var gulp     = require('gulp');
var config   = require('../config');

gulp.task('watch', ['browserSync'], function() {
  // This will change (task name)
  gulp.watch(config.srcs.content, ['content']);
  gulp.watch(config.srcs.templates, ['content']);
  gulp.watch(config.srcs.css + '/**/*', ['css']);
  gulp.watch(config.srcs.js, ['js']);
});
