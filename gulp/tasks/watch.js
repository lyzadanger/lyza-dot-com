'use strict';

var gulp     = require('gulp');
var config   = require('../config');

gulp.task('watch', ['watchify', 'browserSync'], function(callback) {
  // This will change (task name)
  gulp.watch(config.content.src, ['content', 'archive']);
  gulp.watch(config.template.src, ['content', 'archive']);
  gulp.watch(config.css.importDir + '/**/*', ['css']);
});
