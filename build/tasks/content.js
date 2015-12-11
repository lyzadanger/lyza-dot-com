'use strict';

var gulp         = require('gulp');
var data         = require('gulp-data');
var markdown     = require('gulp-markdown');

var Promise      = require('bluebird');
var frontMatter  = require('front-matter');

var config       = require('../config');
var helpers      = require('../utils/helpers');
var template     = require('../plugins/handlebars');
var localContext = require('../utils/context').local;
var templateData = require('../utils/template-data');

var opts = {
  src           : config.srcs.content,
  dest          : config.dest,
  partialDir    : config.dirs.partials,
  templateDir   : config.dirs.templates,
  localContextFn: localContext
};

gulp.task('content', function (done) {
  var prepDone = Promise.all([
    templateData.data(config.blog),
    templateData.posts(config.blog),
    templateData.pages(config.blog)]);
  prepDone.then(function (values) {
    var context = {
      data: values[0],
      posts: values[1],
      pages: values[2]
    };

    return gulp.src(opts.src)
      .pipe(data(function(file) {
        var content = frontMatter(String(file.contents));
        // Replace file's contents with just the body
        // of the current contents (sans front matter)
        file.contents = new Buffer(content.body);
        // This gets added to file.data
        return content.attributes;
      }))
      .pipe(markdown({
        highlight: function(code) {
          return require('highlight.js').highlightAuto(code).value;
        },
        gfm: true,
        smartypants: true
      }))
      .pipe(template({
        partialDir    : opts.partialDir,
        templateDir   : opts.templateDir,
        helpers       : helpers,
        context       : context,
        localContextFn: opts.localContextFn
      }))
      .pipe(gulp.dest(opts.dest))
      .on('finish', function () {
        done();
      });
  });
});
