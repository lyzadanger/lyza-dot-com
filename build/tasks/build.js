'use strict';
var gulp = require('gulp');
var runSequence = require('run-sequence');

gulp.task('build', ['clean', 'publish', 'unpublish'], function (done) {
  var tasks = [
    'assets',
    'content',
    'css',
    'rss',
    'browserify'
  ];

  runSequence(tasks, function() {
    done();
  });
});