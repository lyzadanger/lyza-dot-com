'use strict';

var requireDir  = require('require-dir');
var gulp        = require('gulp');
var runSequence = require('run-sequence');

// Require all tasks in build/tasks, including subfolders
requireDir('./build/tasks', { recurse: true });

gulp.task('default', ['build', 'watch']);

gulp.task('build', ['clean', 'publish', 'unpublish'], function (done) {
  var tasks = [
    'assets',
    'content',
    'css',
    'rss',
    'js'
  ];

  runSequence(tasks, function() {
    done();
  });
});
