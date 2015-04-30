/* global Buffer */
'use strict';
var gulp = require('gulp');
var config = require('../config').publish;
var data = require('gulp-data');
var frontMatter = require('front-matter');
var gulpIgnore  = require('gulp-ignore');

gulp.task('publish', function() {
  // First, look at all drafts
  gulp.src(config.drafts)
  .pipe(data(function(file) {
      var content = frontMatter(String(file.contents));
      return content.attributes;
    }))
  .pipe(gulpIgnore.include(function(file) {
    // Only carry on with posts that should be published
    return (file.data && file.data.status === 'published');
  }))
  .pipe(gulp.dest(config.dest));

});
