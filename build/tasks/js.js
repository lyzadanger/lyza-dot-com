'use strict';

var gulp = require('gulp');
var webpack = require('webpack');
var gutil = require('gulp-util');
var config = require('../config');

var opts = {
  entry: {
    site: config.dirs.js + '/site.js',
    serviceWorker: config.dirs.js + '/service-worker.js'
  },
  output: {
    path    : config.dest,
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
};

gulp.task('js', function (callback) {
  webpack(opts, function (err) {
    if (err) {
      throw new gutil.PluginError('js', err);
    }
    callback();
  });
});
