/* global Buffer */
'use strict';
var config    = require('../config').template;

var fs         = require('fs');
var through    = require('through2');
var gutil      = require('gulp-util');
var Handlebars = require('handlebars');

var count = 0;
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

      // Determine what, if any, template we should wrap with
      // For now, just one template
      var templateName = 'index.hbs';
      //  Compile that template if needed
      // For now, super basic, let's just compile here
      // Note there is no error handling here
      var template = Handlebars.compile(fs.readFileSync(config.templateDir + '/index.hbs', 'utf8'));
      //  Stringify file contents
      var content = file.contents.toString();
      // Create context for template (with file contents)
      var data    = { content: content };
      // Execute template function
      var wrapped = template(data);
      // Replace file.contents with result of template call
      file.contents = new Buffer(wrapped);
    }

    // Do stuff
    this.push(file);
    cb();
  });
};
