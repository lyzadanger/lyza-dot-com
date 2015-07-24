'use strict';
var gulp = require('gulp');
var changed = require('gulp-changed');
var config = require('../config').assets;
var imagemin = require('gulp-imagemin');

gulp.task('assets', function() {
  return gulp.src(config.src)
    .pipe(changed(config.dest))
    .pipe(imagemin())
    .pipe(gulp.dest(config.dest));
});
