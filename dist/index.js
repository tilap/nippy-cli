#!/usr/bin/env node
'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

global.fetch = require('node-fetch');

var pckg = require('../package.json');

var runScript = require('./library/runScript')(_path2.default.resolve(__dirname, 'scripts'));

process.on('unhandledRejection', function (reason) {
  console.error('Unhandle promise rejection: ' + reason); // eslint-disable-line no-console
  console.error(reason); // eslint-disable-line no-console
  try {
    loggerFactory('core', { message_prefix: 'unhandle promise' }).error(reason);
  } catch (err) {} // eslint-disable-line no-empty
});

var config = {
  install: {
    name: 'start a new project (scaffold and setup)',
    short: 'i'
  },
  generator: {
    name: 'generate some code',
    short: 'g'
  },
  seed: {
    name: 'seed database',
    short: 's',
    option: 'path'
  },
  scaffolder: {
    name: 'project scaffolding',
    short: 'S'
  },
  setup: {
    name: 'setup project .env file',
    short: 'c'
  }
};

console.info('');
console.info(_chalk2.default.green(' ============================================'));
console.info(_chalk2.default.green.bold('  ' + pckg.name + ' v' + pckg.version));
console.info(_chalk2.default.green('  ' + pckg.description));
console.info(_chalk2.default.green(' ============================================'));
console.info('');

_commander2.default.version(pckg.version);

(0, _keys2.default)(config).forEach(function (id) {
  var cmd = '-' + config[id].short;
  if (config[id].option) {
    _commander2.default.option(cmd + ' --' + id + ' [' + config[id].option + ']', config.name);
  } else {
    _commander2.default.option(cmd + ', --' + id, config.name);
  }
});
_commander2.default.parse(process.argv);

var commandAsk = null;
(0, _keys2.default)(config).forEach(function (id) {
  if (_commander2.default[id] && id != 'exit') {
    commandAsk = id;
  }
});

if (commandAsk) {
  var script = commandAsk + '/index.js';
  var args = [];
  if (config[commandAsk].option && _commander2.default[commandAsk] !== null && _commander2.default[commandAsk] !== true) {
    args.push(_commander2.default[commandAsk]);
  }
  runScript(script, args);
} else {
  (function () {
    var help = ' You can call "nippy -h" to get all shortcuts and directly call following methods\n';
    console.info(_chalk2.default.grey(help));

    var choices = [];
    (0, _keys2.default)(config).forEach(function (id) {
      choices.push({ name: config[id].name, value: id, short: id });
    });
    choices.push({ name: 'nothing (exit)', value: 'exit', short: 'nothing' });

    _inquirer2.default.prompt({
      type: 'list',
      name: 'script',
      message: 'What do you need?',
      choices: choices
    }).then(function (answer) {
      switch (answer.script) {
        case 'exit':
          console.info(_chalk2.default.grey('✌ Bye!'));
          process.exit();
          break;
        default:
          {
            return runScript(answer.script + '/index.js');
          }
      }
    }).catch(function (err) {
      return console.error(_chalk2.default.red('✘ Error while running command: ' + (err.message || err)));
    });
  })();
}