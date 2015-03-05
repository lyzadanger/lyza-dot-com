'use strict';

var gulp    = require('gulp');
var config  = require('../config').archive;
var data    = require('gulp-data');
var fakeSrc = require('gulp-file');
var template = require('../plugins/template');

gulp.task('archive', ['drafts'], function() {
  return fakeSrc('index.html', '', { src: true })
    .pipe(data(function(file) {
      return {
        template: 'archive'
      };
    }))
    .pipe(template())
    .pipe(gulp.dest(config.drafts.dest));
});
