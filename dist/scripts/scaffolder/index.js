'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _replace = require('replace');

var _replace2 = _interopRequireDefault(_replace);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _child_process = require('child_process');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.info('');
console.info(_chalk2.default.green.bold('❯ Scaffolding sources'));

var data = { name: '', scaff: {} };
var choices = [];

// Config data from package.json and user local config
var config = require('../../../package.json').scaffolding;
var userConfig = {};
var customFileConfig = _path2.default.resolve(process.env.HOME || process.env.USERPROFILE, '.nippyrc');
try {
  _fs2.default.accessSync(customFileConfig, _fs2.default.F_OK);
  userConfig = _fsExtra2.default.readJsonSync(customFileConfig, 'utf8');
} catch (e) {
  console.info(_chalk2.default.grey('  No user config'));
}
(0, _assign2.default)(config, userConfig);

// Make choices list
(0, _keys2.default)(config).forEach(function (id) {
  var _config$id = config[id];
  var name = _config$id.name;
  var _config$id$path = _config$id.path;
  var path = _config$id$path === undefined ? null : _config$id$path;
  var _config$id$url = _config$id.url;
  var url = _config$id$url === undefined ? null : _config$id$url;

  if (path === null && url === null) {
    console.error(_chalk2.default.red('✘ Error in scaffold configuration: entry ' + config + ' has neither url nor path'));
  } else {
    var prefix = path === null ? '[remote] ' : '[local]  ';
    choices.push({ name: prefix + ' ' + name, value: id });
  }
});
choices.sort(function (a, b) {
  return a.name > b.name;
});
choices.push(new _inquirer2.default.Separator());
choices.push({ name: 'None (end)', value: 'exit' });

// Start prompting
_inquirer2.default.prompt({
  type: 'list',
  name: 'scaff',
  message: 'What type of source do you want?',
  choices: choices
}).then(function (answer) {
  if (answer.scaff === 'exit') {
    console.info(_chalk2.default.grey('✌ Bye!'));
    process.exit(100);
  }
  data.scaff = config[answer.scaff];
  return _inquirer2.default.prompt({
    type: 'text',
    name: 'name',
    message: 'Name of the package',
    default: 'my-app',
    validate: function validate(name) {
      return name.match(/^[a-z][a-z0-9\-]*$/) ? true : 'Must start with a letter and contains number, alpha chars and -';
    }
  });
}).then(function (answers) {
  return new _promise2.default(function (resolve, reject) {
    data.name = answers.name;
    if (data.scaff.path) {
      var sources = data.scaff.path.substr(0, 1) === '/' ? data.scaff.path : _path2.default.resolve(__dirname, '../..', data.scaff.path);
      console.info(_chalk2.default.gray('  Copy files from ' + sources + '...'));
      _fsExtra2.default.copy(sources, '.', { clobber: answers.overwrite || false }, function (err) {
        if (err) {
          console.error(_chalk2.default.red('✘ Error during file copy: ' + (err.message || err)));
          return reject();
        }
        console.info(_chalk2.default.green('✓ done'));
        return resolve();
      });
    } else if (data.scaff.url) {
      console.info(_chalk2.default.gray('  Importing from remote tarball ' + data.scaff.url));

      var tmpName = 'nippy-tarball-download.tar.gz';
      (0, _child_process.exec)('curl -L -o ' + tmpName + ' ' + data.scaff.url + ' && tar --strip-components=1 -xvf ' + tmpName + ' && rm -f ' + tmpName, function (err, stdout, stderr) {
        if (err) return reject(err);
        console.info(_chalk2.default.green('✓ done'));
        resolve();
      });
    } else {
      throw new Error('Unknown scaff type...');
    }
  });
}).then(function () {
  console.info(_chalk2.default.gray('  Applying your settings to the sources...'));
  (0, _replace2.default)({
    regex: 'NIPPY_PROJECT_NAME',
    replacement: data.name,
    paths: ['package.json', 'README.md'],
    recursive: false,
    silent: true
  });
  console.info(_chalk2.default.green('✓ done'));
}).catch(function (err) {
  console.error(_chalk2.default.red('✘ Error during scaffolding'));
  console.error(_chalk2.default.red(err.message) || err);
  process.exit(100);
});