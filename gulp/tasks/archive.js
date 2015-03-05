/* global Buffer */
'use strict';

var gulp    = require('gulp');
var config  = require('../config').archive;
var data    = require('gulp-data');
var fakeSrc = require('vinyl-fs-fake');
var template = require('../plugins/template');

gulp.task('archive', ['drafts'], function() {
  return fakeSrc.src([{
    contents: new Buffer(''),
    cwd: '',
    base: '',
    path: 'index.html'
  }])
    .pipe(data(function(file) {
      return {
        template: 'archive'
      };
    }))
    .pipe(template())
    .pipe(gulp.dest(config.drafts.dest));
});
