'use strict';

var gulp = require('gulp');
var webpack = require('webpack');
var gutil = require('gulp-util');
var config = require('../config').js;

gulp.task('js', function (callback) {
  webpack(config, function (err, stats) {
    if (err) {
      throw new gutil.PluginError('js', err);
    }
    // Debug if I need it
    // gutil.log('[js]', stats.toString());
    callback();
  });
});
