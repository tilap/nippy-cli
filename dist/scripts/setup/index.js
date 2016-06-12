'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var templateFile = '.env-example';
var distFile = '.env';
var configPath = _path2.default.resolve(process.cwd(), './src/app/config/');

console.info('');
console.info(_chalk2.default.green.bold('❯ Setting .env file'));

try {
  _fs2.default.accessSync(templateFile, _fs2.default.F_OK);
} catch (e) {
  console.error(_chalk2.default.red('You need to scalfold the project first'));
  console.error(_chalk2.default.grey('The template file ' + templateFile + ' was not found'));
  process.exit();
}

var data = {};

_inquirer2.default.prompt({
  type: 'list',
  name: 'NODE_ENV',
  message: 'Node environement',
  choices: [{ name: 'Production', value: 'production', short: 'production' }, { name: 'Testing', value: 'test', short: 'test' }, { name: 'Development', value: 'development', short: 'development' }],
  default: 'development'
}).then(function (answers) {
  (0, _assign2.default)(data, answers);
  return _inquirer2.default.prompt({
    type: 'text',
    name: 'PORT',
    message: 'Port',
    default: 3000,
    validate: function validate(v) {
      return (/^\d+/.test(v) && v > 0 && v < 65556
      );
    }
  });
}).then(function (answers) {
  (0, _assign2.default)(data, answers);
  return _inquirer2.default.prompt({
    type: 'text',
    name: 'WEB_URL',
    message: 'Web url',
    default: 'http://localhost:' + answers.PORT
  });
}).then(function (answers) {
  (0, _assign2.default)(data, answers);
  return _inquirer2.default.prompt({
    type: 'text',
    name: 'LOG_PATH',
    message: 'Path to store logs',
    default: './tmp'
  });
}).then(function (answers) {
  (0, _assign2.default)(data, answers);
  return _inquirer2.default.prompt({
    type: 'text',
    name: 'DATABASES_MAIN',
    message: 'Main mongo database',
    default: 'mongodb://localhost:27299/myapp-dev'
  });
}).then(function (answers) {
  (0, _assign2.default)(data, answers);
  return new _promise2.default(function (resolve, reject) {
    _crypto2.default.randomBytes(16, function (ex, buf) {
      return resolve(buf.toString('hex'));
    });
  });
}).then(function (randomToken) {
  return _inquirer2.default.prompt({
    type: 'text',
    name: 'TOKEN_SECRET',
    message: 'Secret token',
    default: randomToken
  });
}).then(function (answers) {
  (0, _assign2.default)(data, answers);
  // Copy files
  _fsExtra2.default.copy(templateFile, distFile, { clobber: true }, function (err) {
    // Replace in .env files
    (0, _keys2.default)(data).forEach(function (key) {
      (0, _replace2.default)({
        regex: '{{{{' + key + '}}}}',
        replacement: data[key],
        paths: ['.env'],
        recursive: false,
        silent: true
      });
    });
  });

  // Copy config files if not exists
  _fsExtra2.default.walk(configPath + '/base').on('data', function (item) {
    if (_fs2.default.lstatSync(item.path).isFile()) {
      var newFilePath = item.path.replace(configPath + '/base', configPath);
      var fileExists = true;
      try {
        _fs2.default.accessSync(newFilePath, _fs2.default.F_OK);
      } catch (e) {
        fileExists = false;
      }
      if (!fileExists) {
        _fsExtra2.default.copySync(item.path, newFilePath);
        console.info(_chalk2.default.green('  ' + newFilePath + ' config file created'));
      } else {
        console.info(_chalk2.default.grey('  Config file ' + newFilePath + ' already exists (skip copy)'));
      }
    }
  });
});