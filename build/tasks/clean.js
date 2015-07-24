'use strict';

var gulp   = require('gulp');
var rimraf = require('rimraf');
var config = require('../config').clean;

gulp.task('clean', function(cb) {
  rimraf(config.out, cb);
});
