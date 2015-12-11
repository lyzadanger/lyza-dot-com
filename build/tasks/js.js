'use strict';

var gulp = require('gulp');
var webpack = require('webpack');
var gutil = require('gulp-util');
var config = require('../config');

var randomWords = require('random-words');
var StringReplacePlugin = require('string-replace-webpack-plugin');

var opts = {
  entry: {
    site: config.dirs.js + '/site.js',
    serviceWorker: config.dirs.js + '/service-worker.js'
  },
  output: {
    path    : config.dest,
    filename: '[name].js'
  },
  plugins: [
    new StringReplacePlugin()
  ],
  module: {
    loaders: [
      {
        test: /.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /.js$/,
        loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: /(versionHash)/,
              replacement: function () {
                var sillyHash = randomWords({
                  exactly: 3,
                  join: '-'
                });
                return sillyHash + '-';

              }
            }
          ]
        })
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
