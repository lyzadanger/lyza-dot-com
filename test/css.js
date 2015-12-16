/* global before, describe, it */
/*eslint no-console: 0 */
'use strict';

var expect = require('chai').expect;
var exec   = require('child_process').exec;
var path   = require('path');
var fs     = require('fs-extra');

describe('css task', function () {

  var cssOut = path.resolve(path.join(__dirname, 'dist/css') + 'styles.css');
  this.timeout(5000);

  before(function (done) {
    exec('gulp css', { cwd: path.join(__dirname, 'temp') }, function (err, stdout, stderr) {
      if (err) {
        return console.error(stdout, stderr, err);
      }
      done();
    });
  });

  it('should output a css file to dist', function (done) {
    fs.ensureFile(cssOut, function (err) {
      expect(err).to.be.undefined;
      done();
    });
  });

});
