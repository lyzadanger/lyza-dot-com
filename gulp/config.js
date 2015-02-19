'use strict';
var dest = './build';
var src  = './src';

module.exports = {
  browserSync: {
    server: {
      baseDir: dest
    }
  },
  protoHTML: {
    src: src + '/proto/**/*.md',
    dest: dest
  },
  template: {
    templateDir: src + '/templates'
  }
};
