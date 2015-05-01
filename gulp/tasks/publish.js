/* global Buffer */
'use strict';
var gulp        = require('gulp');
var config      = require('../config').publish;
var data        = require('gulp-data');
var del         = require('del');
var frontMatter = require('front-matter');
var gulpIgnore  = require('gulp-ignore');
var moment      = require('moment');
var Path        = require('path');
var vinylPaths  = require('vinyl-paths');

var buildPostPath = function buildPostPath(file, pattern) {
  var date = moment();
  var path = [];
  pattern.split('/').forEach(function(chunk) {
    path.push(date.format(chunk));
  });
  path.push(Path.basename(file.path));
  path = path.join('/');
  return path;
};

gulp.task('publish', function() {
  gulp.src(config.drafts)
  .pipe(data(function(file) {
      var content = frontMatter(String(file.contents));
      return content.attributes;
    }))
  .pipe(gulpIgnore.include(function(file) {
    // Only carry on with posts that should be published
    return (file.data && file.data.status === 'published');
  }))
  .pipe(data(function(file) {
    var oldPath = file.path;
    // Need to re-path this file in ways `gulp-rename` doesn't support
    file.path = Path.join(file.base, buildPostPath(file, config.permalinkPattern));
    // Hang on to the original path
    return { oldPath: oldPath };
  }))
  .pipe(gulp.dest(config.dest))
  .pipe(data(function(file) {
    // Put back the old path for deletion reasons
    file.path = file.data.oldPath;
  }))
  .pipe(vinylPaths(del));

});
