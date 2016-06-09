import chalk from 'chalk';
import dotenv from 'dotenv';
import ejs from 'ejs';
import fetch from 'node-fetch';
import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import saveInFile from '../../library/saveInFile';

console.info('');
console.info(chalk.green.bold('❯ Api client generator'));

let defaultUrl = '';

const scriptRoot = process.cwd(); // Current root, expected to be at the root of the app
const envFile = path.resolve(scriptRoot, '.env');
const configFile = path.resolve(scriptRoot, './dist/app/config/server.js');
const parametersFile = path.resolve(scriptRoot, './dist/app/config/parameters.js');

function getTemplate(tpl) {
  const filepath = path.resolve(__dirname, '../../../templates', `${tpl}.ejs`);
  return fs.readFileSync(filepath, { encoding: 'utf8' });
}

function outputTemplate(template, data, folder, filename) {
  return new Promise((resolve, reject) => {
    const tpl = getTemplate(template);
    const content = ejs.render(tpl, data);
    const fileToSaveTo = path.resolve('./', folder, filename);
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

try {
  fs.accessSync(envFile, fs.F_OK);
  fs.accessSync(configFile, fs.F_OK);
  fs.accessSync(parametersFile, fs.F_OK);

  dotenv.config();

  process.chdir(path.resolve(scriptRoot, 'src/app'));
  const config = require(configFile);
  const parameters = require(parametersFile);
  process.chdir(scriptRoot);

  defaultUrl = `${config.urls.root}${config.urls.root_path}/documentation/methods`;
} catch (e) {
  defaultUrl = 'http://localhost:3000/api/v1/documentation/methods';
}

console.info(chalk.grey('  api will be generated with running api server documentation'));
console.info(chalk.grey('  please make sure your server is running and api doc is reachable'));

inquirer.prompt({
  type: 'text',
  name: 'url',
  message: 'Remote api documentation',
  default: defaultUrl
}).then((answer) => {
  console.info(chalk.grey(`  fetching api documentation from ${answer.url}`));
  return fetch(answer.url, {
    mode: 'cors',
    cache: 'default',
    method: 'get',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  })
})
.catch((err) => {
  console.error(chalk.red(`Error while fetching the api (${err.message || err})`));
  process.exit();
})
.then((res) => {
  if (!res) {
    console.error(chalk.red(`Error while fetching the api (bad response)`));
    process.exit();
  }
  return res.json();
})
.then((json) => {
  const methodTemplate = getTemplate('api/method');
  let methods = [];
  let k = 1;
  json.success.dataset.forEach((cfg) => {
    console.info(chalk.grey(`${k}/${json.success.dataset.length} ${cfg.name}`));
    k++;
    if (cfg.args) {
      let data = {
        methodName: cfg.name,
        methodArgs: [],
        options: [],
        method: cfg.method || 'get',
        description: cfg.description || '@todo: add description',
        results: cfg.results,
      };

      const args = cfg.args;

      let methodPath = cfg.path;
      if (args.params) {
        args.params.forEach((param) => {
          data.options.push(param);
          methodPath = methodPath.replace(`:${param}`, '${' + param + '}'); // eslint-disable-line prefer-template
          data.description += `\n   * @param ${param}`;
        });
        methodPath = '`' + methodPath + '`'; // eslint-disable-line prefer-template
      } else {
        methodPath = `'${methodPath}'`;
      }

      data.methodArgs.push(methodPath);

      if (args.get) {
        data.options.push('options = {}');
        data.methodArgs.push('options');
        data.description += `\n   * @param options filter items to ${data.method}`;
      } else {
        if (args.data) {
          data.methodArgs.push('{}');
        }
      }
      if (args.data) {
        data.options.push('data = {}');
        data.methodArgs.push('data');
        data.description += `\n   * @param data new data to ${data.method}`;
      }
      methods.push(ejs.render(methodTemplate, data));
    }
  });

  inquirer.prompt({
    type: 'text',
    name: 'path',
    default: './',
    message: 'Where to store the file?',
  })
  .then((answers) => {
    outputTemplate('api/main', { methods: methods.join('') }, answers.path, `api-client.js`);
  });
})
.catch((err) => console.log(err));
