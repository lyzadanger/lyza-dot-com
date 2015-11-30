/* global Buffer */
'use strict';
var gulp     = require('gulp');
var config   = require('../config').content;

var data        = require('gulp-data');
var frontMatter = require('front-matter');
var helpers     = require('../utils/helpers');
var markdown    = require('gulp-markdown');
var rename      = require('gulp-rename');
var template    = require('../plugins/template');

gulp.task('content', function() {
  return gulp.src(config.src)
    .pipe(data(function(file) {
      var content = frontMatter(String(file.contents));
      // Replace file's contents with just the body
      // of the current contents (sans front matter)
      file.contents = new Buffer(content.body);
      return content.attributes;
    }))
    .pipe(markdown({
      highlight: function(code) {
        return require('highlight.js').highlightAuto(code).value;
      },
      gfm: true,
      smartypants: true
    }))
    .pipe(template({ helpers: helpers }))
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(gulp.dest(config.dest));
});
