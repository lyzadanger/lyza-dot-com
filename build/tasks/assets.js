'use strict';
var gulp = require('gulp');
var changed = require('gulp-changed');
var imagemin = require('gulp-imagemin');
var config = require('../config').assets;

gulp.task('assets', function() {
  return gulp.src(config.src)
    .pipe(changed(config.dest))
    .pipe(imagemin())
    .pipe(gulp.dest(config.dest));
});
