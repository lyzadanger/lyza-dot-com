/* global Buffer */
'use strict';
var gulp        = require('gulp');
var config      = require('../config').publish;

var data        = require('gulp-data');
var gulpIgnore  = require('gulp-ignore');

var del         = require('del');
var frontMatter = require('front-matter');
var moment      = require('moment');
var path        = require('path');
var slug        = require('slug');
var vinylPaths  = require('vinyl-paths');

var postData    = require('../utils/blog').postData;

var buildPostPath = function buildPostPath(file, pattern) {
  var date = moment();
  var postPath = [];
  //var postTitle = file.data.title;
  var postName = file.data.title || path.basename(file.path, path.extname(file.path));
  var postFilename = 'index.md';
  var postSlug = slug(postName.toLowerCase());
  pattern.split('/').forEach(function(chunk) {
    postPath.push(date.format(chunk));
  });
  postPath.push(postSlug);
  postPath.push(postFilename);
  postPath = postPath.join('/');
  return postPath;
};

gulp.task('publish', function() {
  gulp.src(config.drafts)
  .pipe(data(postData))
  .pipe(gulpIgnore.include(function(file) {
    // Only carry on with posts that should be published
    return (file.data && file.data.status === 'published');
  }))
  .pipe(data(function(file) {
    var oldPath = file.path;
    // Need to re-path this file in ways `gulp-rename` doesn't support
    file.path = path.join(file.base, buildPostPath(file, config.permalinkPattern));
    console.log(file.data);
    // Hang on to the original path
    return { oldPath: oldPath };
  }));
  // .pipe(gulp.dest(config.dest))
  // .pipe(data(function(file) {
  //   // Put back the old path for deletion reasons
  //   file.path = file.data.oldPath;
  // }))
  // .pipe(vinylPaths(del));

});
