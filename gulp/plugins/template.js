'use strict';
var through = require('through2');
var gutil   = require('gulp-util');

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
      /**
       * Determine what, if any, template we should wrap with
       * Compile that template if needed
       * Stringify file contents
       * Create context for template (with file contents)
       * Execute template function
       * Replace file.contents with result of template call
       */
      // file.contents = new Buffer('something to replace my file contents with');
    }

    // Do stuff
    this.push(file);
    cb();
  });
};
