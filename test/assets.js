/* global before, describe, it */
/*eslint no-console: 0 */
'use strict';

var expect = require('chai').expect;
var exec   = require('child_process').exec;
var path   = require('path');

var utils  = require('./utils');

describe('assets task', function () {

  var assetsOut = path.resolve(path.join(__dirname, 'temp/dist/asset-directory/') + 'lyza-2.gif');
  this.timeout(5000);

  before(function (done) {
    exec('gulp assets', { cwd: path.join(__dirname, 'temp') }, function (err, stdout, stderr) {
      if (err) {
        return console.error(stdout, stderr, err);
      }
      done();
    });
  });

  it('should output an image file to dist', function (done) {
    expect(utils.fileExists(assetsOut)).to.be.true;
    done();
  });

});
