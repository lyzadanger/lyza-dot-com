'use strict';

var gulp     = require('gulp');
var config   = require('../config');

gulp.task('watch', ['watchify', 'browserSync'], function(callback) {
  // This will change (task name)
  gulp.watch(config.drafts.src, ['drafts']);
  gulp.watch(config.template.src, ['drafts']);
  gulp.watch(config.css.importDir + '/**/*', ['css']);
});
