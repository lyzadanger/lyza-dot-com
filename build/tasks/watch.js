'use strict';

var gulp     = require('gulp');
var config   = require('../config');

gulp.task('watch', ['browserSync'], function() {
  // This will change (task name)
  gulp.watch(config.content.src, ['content']);
  gulp.watch(config.template.src, ['content']);
  gulp.watch(config.css.importDir + '/**/*', ['css']);
  gulp.watch(config.js.src, ['js']);
});
