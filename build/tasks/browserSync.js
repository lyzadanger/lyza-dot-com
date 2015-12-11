'use strict';
var browserSync = require('browser-sync');
var gulp        = require('gulp');
var config      = require('../config');

var opts = {
  open     : false,
  server   : {
    baseDir: config.dest
  }
};

gulp.task('browserSync', function() {
  browserSync(opts);
});
