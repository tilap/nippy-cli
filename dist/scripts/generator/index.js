'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _ejs = require('ejs');

var _ejs2 = _interopRequireDefault(_ejs);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _saveInFile = require('../../library/saveInFile');

var _saveInFile2 = _interopRequireDefault(_saveInFile);

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var scriptRoot = process.cwd(); // Current root, expected to be at the root of the app
var envFile = _path2.default.resolve(scriptRoot, '.env');
var configFile = _path2.default.resolve(scriptRoot, './dist/app/config/server.js');
var parametersFile = _path2.default.resolve(scriptRoot, './dist/app/config/parameters.js');

console.info('');
console.info(_chalk2.default.green.bold('❯ Code generator'));

try {
  _fs2.default.accessSync(envFile, _fs2.default.F_OK);
  _fs2.default.accessSync(configFile, _fs2.default.F_OK);
  _fs2.default.accessSync(parametersFile, _fs2.default.F_OK);
} catch (e) {
  console.error(_chalk2.default.red('You need to scalfold the project first and build it'));
  console.error(_chalk2.default.grey('The file ' + envFile + ', ' + configFile + ' and ' + parametersFile + ' are required'));
  process.exit(100);
}

_dotenv2.default.config();

process.chdir(_path2.default.resolve(scriptRoot, 'src/app'));
var config = require(configFile);
var parameters = require(parametersFile);
process.chdir(scriptRoot);

function getModelsNames() {
  return _fs2.default.readdirSync(_path2.default.resolve('./src/app', parameters.paths.models)).map(function (k) {
    return k.replace('.js', '');
  });
}

function getControllerNames() {
  return _fs2.default.readdirSync(_path2.default.resolve('./src/app', parameters.paths.controllers)).map(function (k) {
    return k.replace('.js', '');
  });
}

function getTemplate(tpl) {
  var filepath = _path2.default.resolve(__dirname, '../../../templates', tpl + '.ejs');
  return _fs2.default.readFileSync(filepath, { encoding: 'utf8' });
}

function outputTemplate(template, data, folder, filename) {
  return new _promise2.default(function (resolve, reject) {
    var tpl = getTemplate(template);
    var content = _ejs2.default.render(tpl, data);
    var fileToSaveTo = _path2.default.resolve('./src/app', folder, filename);
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

_inquirer2.default.prompt({
  type: 'list',
  name: 'generator',
  message: 'What do you want to generate?',
  choices: [{ name: 'a db model', value: 'model', short: 'a model' }, { name: 'a service', value: 'service', short: 'a service' }, { name: 'a controller', value: 'controller', short: 'a controller' }, { name: 'a router', value: 'router', short: 'a router' }, { name: 'a full model-service-controller-router', value: 'full-model', short: 'a full set' }]
}).then(function (typeAnswers) {
  switch (typeAnswers.generator) {

    // =========================================================================
    case 'full-model':
      {
        var _ret = function () {
          var data = {};
          _inquirer2.default.prompt({
            type: 'input',
            name: 'name',
            message: 'What the name of the object? (plural form)',
            validate: function validate(res) {
              return res.match(/^\w/i) ? true : 'Must be a lowacase alpha string';
            }
          }).then(function (answers) {
            data.name = answers.name.toLowerCase();
            data.kName = data.name.substr(0, 1).toUpperCase() + data.name.substr(1, 1000);
            data.example = true;
            data.model = data.name;
            data.controller = data.name;
            data.ressource = data.name;
            return outputTemplate('model', data, parameters.paths.models, data.name + '.js');
          }).then(function () {
            return outputTemplate('service', data, parameters.paths.services, data.name + '.js');
          }).then(function () {
            return outputTemplate('controller-service', data, parameters.paths.controllers, data.name + '.js');
          }).then(function () {
            return outputTemplate('router', data, parameters.paths.routers, data.ressource + '.js');
          }).then(function () {
            return console.info('Done! Edit the controller file ${data.name}.js to enable the routes you need!');
          });
          return 'break';
        }();

        if (_ret === 'break') break;
      }

    // =========================================================================
    case 'model':
      {
        var _ret2 = function () {
          var data = {};
          _inquirer2.default.prompt({
            type: 'input',
            name: 'name',
            message: 'What is the name of the model?',
            validate: function validate(res) {
              return res.match(/^\w/i) ? true : 'Must be a lowacase alpha string';
            }
          }).then(function (answers) {
            data.name = answers.name.toLowerCase();
            data.kName = data.name.substr(0, 1).toUpperCase() + data.name.substr(1, 1000);
            return _inquirer2.default.prompt({
              type: 'list',
              name: 'example',
              message: 'Do you want code sample (in comment)?',
              choices: [{ name: 'Yes', value: true, short: 'with examples' }, { name: 'No', value: false, short: 'without examples' }]
            });
          }).then(function (answers) {
            data.example = answers.example;
            outputTemplate('model', data, parameters.paths.models, data.name + '.js');
          });
          return 'break';
        }();

        if (_ret2 === 'break') break;
      }

    // =========================================================================
    case 'service':
      {
        var _ret3 = function () {
          var data = {};
          var modelsOptions = getModelsNames();
          modelsOptions.push('no model');
          _inquirer2.default.prompt({
            type: 'input',
            name: 'name',
            message: 'What is the name of your service?',
            validate: function validate(res) {
              return res.match(/^\w/i) ? true : 'Must be a lowacase alpha string';
            }
          }).then(function (answers) {
            data.name = answers.name.toLowerCase();
            data.kName = data.name.substr(0, 1).toUpperCase() + data.name.substr(1, 1000);
            _inquirer2.default.prompt({
              type: 'list',
              name: 'model',
              message: 'Model to use in the service?',
              choices: modelsOptions
            }).then(function (answers) {
              if (answers.model === 'no model') {
                outputTemplate('service', data, parameters.paths.services, data.name + '.js');
              } else {
                data.model = answers.model;
                outputTemplate('service-model', data, parameters.paths.services, data.name + '.js');
              }
            });
          });
          return 'break';
        }();

        if (_ret3 === 'break') break;
      }

    // =========================================================================
    case 'controller':
      {
        var _ret4 = function () {
          var data = {};
          var template = 'controller';
          _inquirer2.default.prompt({
            type: 'input',
            name: 'name',
            message: 'What is the name of the controller?',
            validate: function validate(res) {
              return res.match(/^\w/i) ? true : 'Must be a lowacase alpha string';
            }
          }).then(function (answers) {
            data.name = answers.name.toLowerCase();
            data.kName = data.name.substr(0, 1).toUpperCase() + data.name.substr(1, 1000);
            return data;
          }).then(function () {
            return _inquirer2.default.prompt({
              type: 'list',
              name: 'type',
              message: 'What kind of controller to generate?',
              choices: [{ name: 'A basic controller', value: '', short: 'basic' }, { name: 'A controller bound to a model', value: 'model', short: 'model bound' }]
            });
          }).then(function (answers) {
            if (answers.type === 'model') {
              template = 'controller-model';
              return _inquirer2.default.prompt({
                type: 'list',
                name: 'model',
                message: 'Which model to bind to?',
                choices: getModelsNames()
              }).then(function (answers) {
                data.model = answers.model;
              });
            } else {
              return null;
            }
          }).then(function () {
            outputTemplate(template, data, parameters.paths.controllers, data.name + '.js');
          });
          return 'break';
        }();

        if (_ret4 === 'break') break;
      }

    // =========================================================================
    case 'router':
      {
        var _ret5 = function () {
          var data = {};
          _inquirer2.default.prompt({
            type: 'text',
            name: 'ressource',
            message: 'What ressource will the router deal with?'
          }).then(function (answers) {
            data.ressource = answers.ressource;
            data.kRessource = data.ressource.substr(0, 1).toUpperCase() + data.ressource.substr(1, 1000);
            _inquirer2.default.prompt({
              type: 'list',
              name: 'controller',
              message: 'Which controller to bind to?',
              choices: getControllerNames()
            }).then(function (answers) {
              data.controller = answers.controller;
              outputTemplate('router', data, parameters.paths.routers, data.ressource + '.js');
            });
          });
          return 'break';
        }();

        if (_ret5 === 'break') break;
      }

    default:
      console.log('Bye bye!');
  }
});