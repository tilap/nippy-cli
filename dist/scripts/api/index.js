'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

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

process.on('unhandledRejection', function (reason) {
  console.error('Unhandle promise rejection: ' + reason); // eslint-disable-line no-console
  console.error(reason); // eslint-disable-line no-console
});

var sourceUrl = 'https://github.com/tilap/nippy-scaff-bare/tarball/v1.0.0';

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

function outputTemplate(template, data, filename) {
  return new _promise2.default(function (resolve, reject) {
    var tpl = getTemplate(template);
    var content = _ejs2.default.render(tpl, data);
    var fileToSaveTo = _path2.default.resolve('./', filename);
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

function getRemoteApiData(url) {
  return (0, _nodeFetch2.default)(url, {
    mode: 'cors',
    cache: 'default',
    method: 'get',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).catch(function (err) {
    console.error(_chalk2.default.red('Error while fetching the main api infos (' + (err.message || err) + ')'));
    process.exit(100);
  }).then(function (res) {
    if (!res) {
      console.error(_chalk2.default.red('Error while fetching the api (bad response)'));
      return {};
    }
    return res.json();
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

  defaultUrl = '' + config.urls.root + config.urls.root_path;
} catch (e) {
  defaultUrl = 'http://localhost:3000/api/v1';
}

console.info(_chalk2.default.grey('  api will be generated with running api server documentation'));
console.info(_chalk2.default.grey('  please make sure your server is running and api doc is reachable'));

var exportData = {};
_inquirer2.default.prompt({
  type: 'text',
  name: 'url',
  message: 'Remote api documentation',
  default: defaultUrl
}).then(function (answers) {
  (0, _assign2.default)(exportData, answers);
  return getRemoteApiData(exportData.url + '/documentation');
}).catch(function (err) {
  console.error(_chalk2.default.red('Error while fetching the main api infos (' + (err.message || err) + ')'));
  process.exit();
}).then(function (answers) {
  if (answers.constructor !== Object) {
    console.error(_chalk2.default.red('Error while fetching the main api infos: not a valid object'));
    process.exit(100);
  }
  if (!answers.hasOwnProperty('success') || !answers.success.hasOwnProperty('dataset')) {
    console.error(_chalk2.default.red('Error while fetching the main api infos: missing data'));
    process.exit(100);
  }

  (0, _assign2.default)(exportData, { api: answers.success.dataset[0] });
  return getRemoteApiData(exportData.url + exportData.api.links.methods);
}).catch(function (err) {
  console.error(_chalk2.default.red('Error while fetching methods api infos (' + (err.message || err) + ')'));
  process.exit(100);
}).then(function (json) {
  var templateData = { methods: [], api: exportData.api };
  var k = 1;
  json.success.dataset.forEach(function (methodConfig) {
    if (methodConfig.args) {
      (function () {
        var name = methodConfig.name;
        var _methodConfig$method = methodConfig.method;
        var method = _methodConfig$method === undefined ? 'get' : _methodConfig$method;
        var path = methodConfig.path;
        var _methodConfig$descrip = methodConfig.description;
        var description = _methodConfig$descrip === undefined ? '@todo: add description' : _methodConfig$descrip;
        var _methodConfig$args = methodConfig.args;
        var params = _methodConfig$args.params;
        var get = _methodConfig$args.get;
        var data = _methodConfig$args.data;
        var single = methodConfig.results.single;


        console.info(_chalk2.default.grey(k + '/' + json.success.dataset.length + ' ' + name));
        k++;

        var methodData = {
          name: name,
          description: description,
          verb: method,
          path: path,
          options: [],
          singleResult: single,
          args: []
        };

        if (params) {
          params.forEach(function (param) {
            methodData.description += '\n   * @param ' + param;
          });

          params.forEach(function (param) {
            methodData.options.push(param);
          });

          params.forEach(function (param) {
            methodData.path = methodData.path.replace(':' + param, '${' + param + '}'); // eslint-disable-line prefer-template
          });
          methodData.path = '`' + methodData.path + '`'; // eslint-disable-line prefer-template
        } else {
            methodData.path = "'" + methodData.path + "'";
          }

        methodData.args.push(methodData.path);

        if (get) {
          methodData.options.push('options = {}');
          methodData.args.push('options');
          var v = methodData.verb === 'patch' ? 'update' : methodData.verb;
          methodData.description += '\n   * @param options filtering items to ' + v;
        } else if (data) {
          methodData.args.push('{}');
        }

        if (data) {
          methodData.options.push('data = {}');
          methodData.args.push('data');
          methodData.description += '\n   * @param data';
        }

        templateData.methods.push(methodData);
      })();
    }
  });

  outputTemplate('api-client', templateData, exportData.api.name + '-client-' + exportData.api.version + '.js');
});