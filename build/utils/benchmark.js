'use strict';

var microtime = require('microtime');
var _         = require('lodash');

var Benchmark = function () {
  this.bms = [];
};

Benchmark.prototype.add = function (msg) {
  this.bms.push({
    msg: msg,
    time: microtime.now()
  });
};

Benchmark.prototype.diffs = function () {
  var sorted = _.sortBy(this.bms, 'time'),
    prev,
    diffs = [];
  for (var index in sorted) {
    var diff = sorted[index];
    if (prev) {
      diff.elapsed = diff.time - prev.time;
      diffs.push(prev.msg + ' - ' + diff.msg + ' : ' + diff.elapsed);
    }
    prev = diff;
  }
  return diffs;
};

Benchmark.prototype.total = function () {
  var times = _.pluck(this.bms, 'time');
  times.sort();
  if (times.length && times.length >= 2) {
    return times.pop() - times.shift();
  }
  return 0;
};

module.exports = Benchmark;
