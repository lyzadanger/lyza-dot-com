'use strict';

var gulp = require('gulp');
var webpack = require('webpack');
var gutil = require('gulp-util');

gulp.task('js', function (callback) {
  webpack({}, function (err, stats) {
    if (err) {
      throw new gutil.PluginError('js', err);
    }
    gutil.log('[js]', stats.toString());
    callback();
  });
});
