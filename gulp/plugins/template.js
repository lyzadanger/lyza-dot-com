/* global Buffer */
'use strict';
var config    = require('../config').template;

var fs         = require('fs');
var _          = require('lodash');
var through    = require('through2');
var gutil      = require('gulp-util');
var Handlebars = require('handlebars');

var defaults = {
  template: 'index'
};

module.exports = function wrapWithHandlebars() {

  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      cb(new gutil.PluginError('myPlugin', 'Streaming not supported'));
      return;
    }

    if (file.isBuffer()) {
      var data = _.extend({
        template : 'index'
      }, file.data || {});
      // @TODO Note there is no error handling here
      var template = Handlebars.compile(fs.readFileSync(config.templateDir + '/' + data.template + '.hbs', 'utf8'));
      // Execute template function
      data.content = file.contents.toString();
      var wrapped = template(data);
      // Replace file.contents with result of template call
      file.contents = new Buffer(wrapped);
    }

    // Do stuff
    this.push(file);
    cb();
  });
};
