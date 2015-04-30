'use strict';
var gulp = require('gulp');
var runSequence = require('run-sequence');

gulp.task('build', ['clean'], function (done) {
  var tasks = [
    'content',
    'archive',
    'css',
    'browserify'
  ];

  runSequence(tasks, function() {
    done();
  });
});
