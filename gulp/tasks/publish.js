/* global Buffer */
'use strict';
var gulp        = require('gulp');
var config      = require('../config').publish;
var fs          = require('fs');

var data        = require('gulp-data');
var gulpIgnore  = require('gulp-ignore');

var del         = require('del');
var path        = require('path');
var vinylPaths  = require('vinyl-paths');

var postData    = require('../utils/blog').postData;
var publishData = require('../utils/blog').buildPublishData;
var moveFiles   = require('../utils/move-files');
var prune       = require('../utils/prune-dirs');

gulp.task('publish', ['promote', 'pruneDrafts']);

gulp.task('pruneDrafts', ['promote'], function(done) {
  prune(config.prune, done);
});

gulp.task('promote', function() {
  return gulp.src(config.src)
  .pipe(data(postData))
  .pipe(gulpIgnore.include(function(file) {
    // Only carry on with posts that should be published
    return (file.data && file.data.status === 'published');
  }))
  .pipe(data(publishData))
  .pipe(data(function(file) {
    var oldPath = file.path;
    if (file.path.indexOf(file.data.publish.path) === -1) {
      file.path = path.resolve(config.drafts) + '/' + file.data.publish.path;
    }
    // Hang on to the original path
    return { oldPath: oldPath };
  }))
  .pipe(gulp.dest(config.dest))
  .pipe(data(function(file) {
    var movePromise = moveFiles(path.dirname(file.data.oldPath),
      path.dirname(file.path),
      ['index.md']);
    // Put back the old path for deletion reasons
    file.path = file.data.oldPath;
    delete file.data.oldPath; // This is kinda gross
    return movePromise;
  }))
  .pipe(vinylPaths(del));
});
