'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _cliSpinner = require('cli-spinner');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var runScript = require('../../library/runScript')(_path2.default.resolve(__dirname, '../..', 'scripts'));

var spinner = new _cliSpinner.Spinner('  %s processing... please wait');
spinner.setSpinnerString('|/-\\');

runScript('setup/index.js').then(function () {
  return new _promise2.default(function (resolve, reject) {
    console.info('');
    console.info(_chalk2.default.green.bold('❯ Installing node dependancies...'));
    console.info(_chalk2.default.grey('  Could take a few minutes depending on your connection... Coffee time ;)'));
    spinner.start();
    _child_process2.default.exec('npm install', function (err, stdout, stderr) {
      spinner.stop();
      return resolve();
    });
  });
}).then(function () {
  return new _promise2.default(function (resolve, reject) {
    console.info('');
    console.info(_chalk2.default.green.bold('❯ Building the app for first time...'));
    spinner.start();
    _child_process2.default.execSync('npm run build');
    spinner.stop();

    spinner.start();
    _child_process2.default.exec('npm run build', function (err, stdout, stderr) {
      spinner.stop();
      return resolve();
    });
  });
}).then(function () {
  console.info('');
  console.info(_chalk2.default.green('✓ The api is installed'));
  console.info(_chalk2.default.grey('  If you don\'t already have a running mongodb, you can start "npm run db", then "npm run watch" to start the app.'));
  console.log('');
});