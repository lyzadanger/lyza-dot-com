'use strict';

var gulp = require('gulp');
var webpack = require('webpack');
var gutil = require('gulp-util');
var config = require('../config');

var opts = {
  staticSrc: [ config.dirs.js + '/serviceWorker.js',
               config.dirs.js + '/serviceWorker.config.js'],
  webpack: {
    entry: {
      site: config.dirs.js + '/site.js'
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
  }
};

gulp.task('webpack', function (callback) {
  webpack(opts.webpack, function (err) {
    if (err) {
      throw new gutil.PluginError('js', err);
    }
    callback();
  });
});

gulp.task('js', ['webpack'], function () {
  return gulp.src(opts.staticSrc)
    .pipe(gulp.dest(config.dest));
});
