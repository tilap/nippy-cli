import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import ejs from 'ejs';
import chalk from 'chalk';
import dotenv from 'dotenv';
import saveInFile from '../../library/saveInFile';
import fetch from 'node-fetch';

const scriptRoot = process.cwd(); // Current root, expected to be at the root of the app
const envFile = path.resolve(scriptRoot, '.env');
const configFile = path.resolve(scriptRoot, './dist/app/config/server.js');
const parametersFile = path.resolve(scriptRoot, './dist/app/config/parameters.js');

console.info('');
console.info(chalk.green.bold('❯ Code generator'));

try {
  fs.accessSync(envFile, fs.F_OK);
  fs.accessSync(configFile, fs.F_OK);
  fs.accessSync(parametersFile, fs.F_OK);
} catch (e) {
  console.error(chalk.red('You need to scalfold the project first and build it'));
  console.error(chalk.grey(`The file ${envFile}, ${configFile} and ${parametersFile} are required`));
  process.exit();
}

dotenv.config();

process.chdir(path.resolve(scriptRoot, 'src/app'));
const config = require(configFile);
const parameters = require(parametersFile);
process.chdir(scriptRoot);

function getModelsNames() {
  return fs.readdirSync(path.resolve('./src/app', parameters.paths.models)).map((k) => k.replace('.js', ''));
}

function getControllerNames() {
  return fs.readdirSync(path.resolve('./src/app', parameters.paths.controllers)).map((k) => k.replace('.js', ''));
}

function getTemplate(tpl) {
  const filepath = path.resolve(__dirname, '../../../templates', `${tpl}.ejs`);
  return fs.readFileSync(filepath, { encoding: 'utf8' });
}

function outputTemplate(template, data, folder, filename) {
  return new Promise((resolve, reject) => {
    const tpl = getTemplate(template);
    const content = ejs.render(tpl, data);
    const fileToSaveTo = path.resolve('./src/app', folder, filename);
    try {
      fs.accessSync(fileToSaveTo, fs.F_OK);
      inquirer.prompt({
        type: 'confirm',
        name: 'confirm',
        message: `The file "${fileToSaveTo}" already exists. Overwrite?`,
      }).then((answers) => {
        if (answers.confirm) {
          return resolve(saveInFile(fileToSaveTo, content));
        } else {
          console.info('skipped');
          return false;
        }
      });
    } catch (e) {
      return resolve(saveInFile(fileToSaveTo, content));
    }
  });
}

inquirer.prompt({
  type: 'list',
  name: 'generator',
  message: 'What do you want to generate?',
  choices: [
    { name: 'a db model', value: 'model', short: 'a model' },
    { name: 'a service', value: 'service', short: 'a service' },
    { name: 'a controller', value: 'controller', short: 'a controller' },
    { name: 'a router', value: 'router', short: 'a router' },
    { name: 'a full model-service-controller-router', value: 'full-model', short: 'a full set' },
  ],
}).then((typeAnswers) => {
  switch (typeAnswers.generator) {

    // =========================================================================
    case 'full-model': {
      let data = {};
      inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'What the name of the object? (plural form)',
        validate: (res) => (res.match(/^\w/i) ? true : 'Must be a lowacase alpha string'),
      })
      .then((answers) => {
        data.name = answers.name.toLowerCase();
        data.kName = data.name.substr(0, 1).toUpperCase() + data.name.substr(1, 1000);
        data.example = true;
        data.model = data.name;
        data.controller = data.name;
        data.ressource = data.name;
        return outputTemplate('model', data, parameters.paths.models, `${data.name}.js`);
      })
      .then(() => outputTemplate('service', data, parameters.paths.services, `${data.name}.js`))
      .then(() => outputTemplate('controller-service', data, parameters.paths.controllers, `${data.name}.js`))
      .then(() => outputTemplate('router', data, parameters.paths.routers, `${data.ressource}.js`))
      .then(() => console.info('Done! Edit the controller file ${data.name}.js to enable the routes you need!'));
      break;
    }

    // =========================================================================
    case 'model': {
      let data = {};
      inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'What is the name of the model?',
        validate: (res) => (res.match(/^\w/i) ? true : 'Must be a lowacase alpha string'),
      }).then((answers) => {
        data.name = answers.name.toLowerCase();
        data.kName = data.name.substr(0, 1).toUpperCase() + data.name.substr(1, 1000);
        return inquirer.prompt({
          type: 'list',
          name: 'example',
          message: 'Do you want code sample (in comment)?',
          choices: [
            { name: 'Yes', value: true, short: 'with examples' },
            { name: 'No', value: false, short: 'without examples' },
          ],
        });
      }).then((answers) => {
        data.example = answers.example;
        outputTemplate('model', data, parameters.paths.models, `${data.name}.js`);
      });
      break;
    }

    // =========================================================================
    case 'service': {
      let data = {};
      let modelsOptions = getModelsNames();
      modelsOptions.push('no model');
      inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'What is the name of your service?',
        validate: (res) => (res.match(/^\w/i) ? true : 'Must be a lowacase alpha string'),
      }).then((answers) => {
        data.name = answers.name.toLowerCase();
        data.kName = data.name.substr(0, 1).toUpperCase() + data.name.substr(1, 1000);
        inquirer.prompt({
          type: 'list',
          name: 'model',
          message: 'Model to use in the service?',
          choices: modelsOptions,
        }).then((answers) => {
          if (answers.model === 'no model') {
            outputTemplate('service', data, parameters.paths.services, `${data.name}.js`);
          } else {
            data.model = answers.model;
            outputTemplate('service-model', data, parameters.paths.services, `${data.name}.js`);
          }
        });
      });
      break;
    }

    // =========================================================================
    case 'controller': {
      let data = {};
      let template = 'controller';
      inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'What is the name of the controller?',
        validate: (res) => (res.match(/^\w/i) ? true : 'Must be a lowacase alpha string'),
      })
      .then((answers) => {
        data.name = answers.name.toLowerCase();
        data.kName = data.name.substr(0, 1).toUpperCase() + data.name.substr(1, 1000);
        return data;
      })
      .then(() =>
        inquirer.prompt({
          type: 'list',
          name: 'type',
          message: 'What kind of controller to generate?',
          choices: [
            { name: 'A basic controller', value: '', short: 'basic' },
            { name: 'A controller bound to a model', value: 'model', short: 'model bound' },
          ],
        })
      )
      .then((answers) => {
        if (answers.type === 'model') {
          template = 'controller-model';
          return inquirer.prompt({
            type: 'list',
            name: 'model',
            message: 'Which model to bind to?',
            choices: getModelsNames(),
          }).then((answers) => {
            data.model = answers.model;
          });
        } else {
          return null;
        }
      })
      .then(() => {
        outputTemplate(template, data, parameters.paths.controllers, `${data.name}.js`);
      });
      break;
    }

    // =========================================================================
    case 'router': {
      let data = {};
      inquirer.prompt({
        type: 'text',
        name: 'ressource',
        message: 'What ressource will the router deal with?',
      })
      .then((answers) => {
        data.ressource = answers.ressource;
        data.kRessource = data.ressource.substr(0, 1).toUpperCase() + data.ressource.substr(1, 1000);
        inquirer.prompt({
          type: 'list',
          name: 'controller',
          message: 'Which controller to bind to?',
          choices: getControllerNames(),
        })
        .then((answers) => {
          data.controller = answers.controller;
          outputTemplate('router', data, parameters.paths.routers, `${data.ressource}.js`);
        });
      });
      break;
    }

    default:
      console.log('Bye bye!');
  }
});
