'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _ejs = require('ejs');

var _ejs2 = _interopRequireDefault(_ejs);

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _saveInFile = require('../../library/saveInFile');

var _saveInFile2 = _interopRequireDefault(_saveInFile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.info('');
console.info(_chalk2.default.green.bold('❯ Api client generator'));

var defaultUrl = '';

var scriptRoot = process.cwd(); // Current root, expected to be at the root of the app
var envFile = _path2.default.resolve(scriptRoot, '.env');
var configFile = _path2.default.resolve(scriptRoot, './dist/app/config/server.js');
var parametersFile = _path2.default.resolve(scriptRoot, './dist/app/config/parameters.js');

function getTemplate(tpl) {
  var filepath = _path2.default.resolve(__dirname, '../../../templates', tpl + '.ejs');
  return _fs2.default.readFileSync(filepath, { encoding: 'utf8' });
}

function outputTemplate(template, data, folder, filename) {
  return new _promise2.default(function (resolve, reject) {
    var tpl = getTemplate(template);
    var content = _ejs2.default.render(tpl, data);
    var fileToSaveTo = _path2.default.resolve('./', folder, filename);
    try {
      _fs2.default.accessSync(fileToSaveTo, _fs2.default.F_OK);
      _inquirer2.default.prompt({
        type: 'confirm',
        name: 'confirm',
        message: 'The file "' + fileToSaveTo + '" already exists. Overwrite?'
      }).then(function (answers) {
        if (answers.confirm) {
          return resolve((0, _saveInFile2.default)(fileToSaveTo, content));
        } else {
          console.info('skipped');
          return false;
        }
      });
    } catch (e) {
      return resolve((0, _saveInFile2.default)(fileToSaveTo, content));
    }
  });
}

try {
  _fs2.default.accessSync(envFile, _fs2.default.F_OK);
  _fs2.default.accessSync(configFile, _fs2.default.F_OK);
  _fs2.default.accessSync(parametersFile, _fs2.default.F_OK);

  _dotenv2.default.config();

  process.chdir(_path2.default.resolve(scriptRoot, 'src/app'));
  var config = require(configFile);
  var parameters = require(parametersFile);
  process.chdir(scriptRoot);

  defaultUrl = '' + config.urls.root + config.urls.root_path + '/documentation/methods';
} catch (e) {
  defaultUrl = 'http://localhost:3000/api/v1/documentation/methods';
}

console.info(_chalk2.default.grey('  api will be generated with running api server documentation'));
console.info(_chalk2.default.grey('  please make sure your server is running and api doc is reachable'));

_inquirer2.default.prompt({
  type: 'text',
  name: 'url',
  message: 'Remote api documentation',
  default: defaultUrl
}).then(function (answer) {
  console.info(_chalk2.default.grey('  fetching api documentation from ' + answer.url));
  return (0, _nodeFetch2.default)(answer.url, {
    mode: 'cors',
    cache: 'default',
    method: 'get',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
}).catch(function (err) {
  console.error(_chalk2.default.red('Error while fetching the api (' + (err.message || err) + ')'));
  process.exit();
}).then(function (res) {
  if (!res) {
    console.error(_chalk2.default.red('Error while fetching the api (bad response)'));
    process.exit();
  }
  return res.json();
}).then(function (json) {
  var methodTemplate = getTemplate('api/method');
  var methods = [];
  var k = 1;
  json.success.dataset.forEach(function (cfg) {
    console.info(_chalk2.default.grey(k + '/' + json.success.dataset.length + ' ' + cfg.name));
    k++;
    if (cfg.args) {
      (function () {
        var data = {
          methodName: cfg.name,
          methodArgs: [],
          options: [],
          method: cfg.method || 'get',
          description: cfg.description || '@todo: add description',
          results: cfg.results
        };

        var args = cfg.args;

        var methodPath = cfg.path;
        if (args.params) {
          args.params.forEach(function (param) {
            data.options.push(param);
            methodPath = methodPath.replace(':' + param, '${' + param + '}'); // eslint-disable-line prefer-template
            data.description += '\n   * @param ' + param;
          });
          methodPath = '`' + methodPath + '`'; // eslint-disable-line prefer-template
        } else {
            methodPath = '\'' + methodPath + '\'';
          }

        data.methodArgs.push(methodPath);

        if (args.get) {
          data.options.push('options = {}');
          data.methodArgs.push('options');
          data.description += '\n   * @param options filter items to ' + data.method;
        } else {
          if (args.data) {
            data.methodArgs.push('{}');
          }
        }
        if (args.data) {
          data.options.push('data = {}');
          data.methodArgs.push('data');
          data.description += '\n   * @param data new data to ' + data.method;
        }
        methods.push(_ejs2.default.render(methodTemplate, data));
      })();
    }
  });

  _inquirer2.default.prompt({
    type: 'text',
    name: 'path',
    default: './',
    message: 'Where to store the file?'
  }).then(function (answers) {
    outputTemplate('api/main', { methods: methods.join('') }, answers.path, 'api-client.js');
  });
}).catch(function (err) {
  return console.log(err);
});