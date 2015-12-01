'use strict';

var gulp        = require('gulp');

var blogConfig  = require('../config').blog;
var contentConfig = require('../config').content;
var helpers     = require('../utils/helpers');

var Promise     = require('bluebird');
var frontMatter = require('front-matter');

var data        = require('gulp-data');
var markdown    = require('gulp-markdown');

var template    = require('../plugins/handlebars');

var localContext = require('../utils/context').local;

var templateData     = require('../utils/template-data');

gulp.task('templates', function (done) {
  var prepDone = Promise.all([
    templateData.data(blogConfig),
    templateData.posts(blogConfig),
    templateData.pages(blogConfig)]);
  prepDone.then(function (values) {
    let context = {
      data: values[0],
      posts: values[1],
      pages: values[2]
    };

    return gulp.src(contentConfig.src)
      .pipe(data(function(file) {
        var content = frontMatter(String(file.contents));
        // Replace file's contents with just the body
        // of the current contents (sans front matter)
        file.contents = new Buffer(content.body);
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
        partialDir: 'src/templates/partials',
        templateDir: 'src/templates',
        helpers: helpers,
        context: context,
        localContextFn: localContext
      }))
      .pipe(gulp.dest('dist'))
      .on('finish', function () {
        console.log('all through');
        done();
      });
  });
});
