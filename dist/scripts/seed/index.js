'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.info('');
console.info(_chalk2.default.green.bold('❯ Seeding database'));

var scriptRoot = process.cwd(); // Current root, expected to be at the root of the app
var modelFactoryPath = _path2.default.resolve(scriptRoot, './dist/core/factory/model.js');

try {
  _fs2.default.accessSync(modelFactoryPath, _fs2.default.F_OK);
} catch (e) {
  console.error(_chalk2.default.red('  You need to scalfold the project first and build it'));
  console.error(_chalk2.default.grey('  The file ' + modelFactoryPath + ' are required'));
  process.exit();
}

try {
  _dotenv2.default.config();
} catch (err) {
  console.info(_chalk2.default.grey('  .env file not found. Use global environment'));
}
if (!process.env.PORT) process.env.PORT = 1234; // port is useless but is required to work

function seed(folder) {
  if (folder.substr(0, 1) !== '/') {
    folder = _path2.default.resolve(scriptRoot, folder);
  }

  return new _promise2.default(function (resolve, reject) {
    try {
      _fs2.default.accessSync(folder, _fs2.default.F_OK);
    } catch (err) {
      return reject('Seeding folder "' + folder + '" not found');
    }

    var modelFactory = require(modelFactoryPath); // eslint-disable-line global-require

    var promises = { insert: [], drop: [] };
    var databaseSeeds = [];

    _fs2.default.readdirSync(folder).forEach(function (file) {
      var seedFile = folder + '/' + file;
      if (_fs2.default.statSync(seedFile).isFile()) {
        (function () {
          databaseSeeds.push(file);
          var datas = require(seedFile); // eslint-disable-line global-require
          var modelSlug = file.replace('.json', '');
          console.info(_chalk2.default.grey('  found ' + modelSlug + ' to seed'));

          var model = modelFactory(modelSlug);
          promises.drop.push(model.remove());
          datas.forEach(function (data) {
            promises.insert.push(model(data).save());
          });
        })();
      }
    });

    console.info('  ' + databaseSeeds.length + ' databases to seed');

    return _promise2.default.all(promises.drop).catch(function (err) {
      return reject('Error while dropping collection: ' + (err.message || err));
    }).then(function (res) {
      return _promise2.default.all(promises.insert);
    }).catch(function (err) {
      return reject('Error while inserting document: ' + (err.message || err));
    }).then(function (res) {
      return resolve('Seeding done');
    });
  });
}

new _promise2.default(function (resolve, reject) {
  if (process.argv[2] && process.argv[2].constructor === String) {
    return resolve(process.argv[2]);
  } else {
    return _inquirer2.default.prompt({
      type: 'text',
      name: 'folder',
      message: 'Seed data folder',
      default: 'seed'
    }).then(function (answers) {
      return resolve(answers.folder);
    });
  }
}).then(function (folder) {
  return seed(folder);
}).then(function (res) {
  console.info(_chalk2.default.green('✓ ' + res));
  console.log('');
  process.exit(0);
}).catch(function (err) {
  console.error(_chalk2.default.red('✘ Error during seeding'));
  console.error(_chalk2.default.red(err.message || err));
  process.exit(0);
});