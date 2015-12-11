'use strict';

var gulp   = require('gulp');
var rimraf = require('rimraf');
var config = require('../config');

var opts = {
  out: config.dest
};

gulp.task('clean', function(cb) {
  rimraf(opts.out, cb);
});
