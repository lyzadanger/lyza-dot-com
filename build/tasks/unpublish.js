/* global Buffer */
'use strict';
var gulp        = require('gulp');
var config      = require('../config');

var data        = require('gulp-data');
var gulpIgnore  = require('gulp-ignore');

var del         = require('del');
var path        = require('path');
var vinylPaths  = require('vinyl-paths');

var moveFiles   = require('../utils/move-files');
var postData    = require('../publish-data').readPostData;
var prune       = require('../utils/prune-dirs');

var opts = {
  src  : config.srcs.posts,
  prune: config.dirs.posts,
  dest : config.dirs.drafts
};

gulp.task('unpublish', ['demote', 'prunePosts']);

gulp.task('prunePosts', ['demote'], function(done) {
  prune(opts.prune, done);
});

gulp.task('demote', function() {
  return gulp.src(opts.src)
  .pipe(data(postData))
  .pipe(gulpIgnore.include(function(file) {
    // Only carry on with posts that should NOT be published
    return (file.data && file.data.status !== 'published');
  }))
  .pipe(data(function(file) {
    return { oldPath: file.path };
  }))
  .pipe(gulp.dest(opts.dest))
  .pipe(data(function(file) {
    var movePromise = moveFiles(path.dirname(file.data.oldPath),
      path.dirname(file.path),
      { ignore: /index\.md/ });
    file.path = file.data.oldPath;
    delete file.data.oldPath;
    return movePromise;
  }))
  .pipe(vinylPaths(del));

});
