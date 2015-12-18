/* global Buffer */
'use strict';
var gulp        = require('gulp');
var config      = require('../config');

var data        = require('gulp-data');
var gulpIgnore  = require('gulp-ignore');

var del         = require('del');
var path        = require('path');
var vinylPaths  = require('vinyl-paths');

var postData    = require('../publish-data').readPostData;
var publishData = require('../publish-data').writePublishData;
var moveFiles   = require('../utils/move-files');
var prune       = require('../utils/prune-dirs');

var opts = {
  dest  : config.dirs.posts,
  drafts: config.dirs.drafts,
  prune : config.dirs.drafts,
  src   : config.srcs.drafts
};

gulp.task('publish', ['promote', 'pruneDrafts']);

gulp.task('pruneDrafts', ['promote'], function(done) {
  prune(opts.prune, done);
});

gulp.task('promote', function() {
  return gulp.src(opts.src)
  .pipe(data(postData))
  .pipe(gulpIgnore.include(function(file) {
    // Only carry on with posts that should be published
    return (file.data && file.data.status === 'published');
  }))
  .pipe(data(publishData))
  .pipe(data(function(file) { // Mess with paths
    var oldPath = file.path;
    if (file.path.indexOf(file.data.publish.path) === -1) {
      file.path = path.resolve(opts.drafts) + '/' + file.data.publish.path;
    }
    // Hang on to the original path
    return { oldPath: oldPath };
  }))
  .pipe(gulp.dest(opts.dest))
  .pipe(data(function(file) { // Move the other files that may be in the post dir
    var movePromise = moveFiles(path.dirname(file.data.oldPath),
      path.dirname(file.path),
      { ignore: /index\.md/ });
    // Put back the old path for deletion reasons
    file.path = file.data.oldPath;
    delete file.data.oldPath; // This is kinda gross
    return movePromise;
  }))
  .pipe(vinylPaths(del));
});
