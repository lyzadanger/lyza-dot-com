'use strict';

var gulp = require('gulp');
var webpack = require('webpack');
var gutil = require('gulp-util');
var config = require('../config').js.webpack;

gulp.task('js', function (callback) {
  webpack(config, function (err) {
    if (err) {
      throw new gutil.PluginError('js', err);
    }
    callback();
  });
});
