'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (rootPath) {
  return function (scriptPath) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
    return new _promise2.default(function (resolve, reject) {
      scriptPath = rootPath + '/' + scriptPath;

      try {
        _fs2.default.accessSync(scriptPath);
      } catch (err) {
        return reject(new Error('Unable to access the script ' + scriptPath + ': ' + (err.message || err)));
      }

      var invoked = false;
      var process = _child_process2.default.fork(scriptPath, options);

      process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        return reject(err);
      });

      process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
        if (code === 0) {
          return resolve();
        }
        reject(new Error('exit code ' + code));
      });
    });
  };
};