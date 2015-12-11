'use strict';
var gulp = require('gulp');
var changed = require('gulp-changed');
var imagemin = require('gulp-imagemin');
var config = require('../config');

var opts = {
  // Everything in pages/* and posts/*
  // but NOT markdown files
  src: [ config.dirs.pages + '/**/*',
         '!' + config.srcs.pages,
         config.dirs.posts + '/**/*.*',
         '!' + config.srcs.posts
       ]
};

gulp.task('assets', function() {
  return gulp.src(opts.src)
    .pipe(changed(config.dest))
    .pipe(imagemin())
    .pipe(gulp.dest(config.dest));
});
