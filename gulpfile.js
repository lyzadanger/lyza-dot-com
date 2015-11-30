'use strict';

var requireDir = require('require-dir');
var gulp       = require('gulp');

// Require all tasks in build/tasks, including subfolders
requireDir('./build/tasks', { recurse: true });

gulp.task('default', ['build', 'watch']);
