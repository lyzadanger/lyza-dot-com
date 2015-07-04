/* global Buffer */
'use strict';
var gulp        = require('gulp');
var config      = require('../config').unpublish;

var data        = require('gulp-data');
var gulpIgnore  = require('gulp-ignore');

var del         = require('del');
var path        = require('path');
var vinylPaths  = require('vinyl-paths');

var moveFiles   = require('../utils/move-files');
var postData    = require('../utils/blog').readPostData;
var prune       = require('../utils/prune-dirs');

gulp.task('unpublish', ['demote', 'prunePosts']);

gulp.task('prunePosts', ['demote'], function(done) {
  prune(config.prune, done);
});

gulp.task('demote', function() {
  return gulp.src(config.src)
  .pipe(data(postData))
  .pipe(gulpIgnore.include(function(file) {
    // Only carry on with posts that should NOT be published
    return (file.data && file.data.status !== 'published');
  }))
  .pipe(data(function(file) {
    return { oldPath: file.path };
  }))
  .pipe(gulp.dest(config.dest))
  .pipe(data(function(file) {
    var movePromise = moveFiles(path.dirname(file.data.oldPath),
      path.dirname(file.path),
      ['index.md']);
    file.path = file.data.oldPath;
    delete file.data.oldPath;
    return movePromise;
  }))
  .pipe(vinylPaths(del));

});
