/* global Buffer */
'use strict';
var gulp     = require('gulp');
var config   = require('../config').drafts;

var data        = require('gulp-data');
var frontMatter = require('front-matter');
var markdown    = require('gulp-markdown');
var rename      = require('gulp-rename');
var template    = require('../plugins/template');

gulp.task('drafts', function() {
  return gulp.src(config.src)
  .pipe(data(function(file) {
      var content = frontMatter(String(file.contents));
      // Replace file's contents with just the body
      // of the current contents (sans front matter)
      file.contents = new Buffer(content.body);
      return content.attributes;
    }))
    .pipe(markdown({
      gfm: true,
      smartypants: true
    }))
    .pipe(template())
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(gulp.dest(config.dest));
});
