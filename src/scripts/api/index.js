import chalk from 'chalk';
import dotenv from 'dotenv';
import ejs from 'ejs';
import fetch from 'node-fetch';
import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import saveInFile from '../../library/saveInFile';

process.on('unhandledRejection', (reason) => {
  console.error(`Unhandle promise rejection: ${reason}`); // eslint-disable-line no-console
  console.error(reason); // eslint-disable-line no-console
});

const sourceUrl = 'https://github.com/tilap/nippy-scaff-bare/tarball/v1.0.0';

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

function outputTemplate(template, data, filename) {
  return new Promise((resolve, reject) => {
    const tpl = getTemplate(template);
    const content = ejs.render(tpl, data);
    const fileToSaveTo = path.resolve('./', filename);
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


function getRemoteApiData(url) {
  return fetch(url, {
    mode: 'cors',
    cache: 'default',
    method: 'get',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  })
  .catch((err) => {
    console.error(chalk.red(`Error while fetching the main api infos (${err.message || err})`));
    process.exit();
  })
  .then((res) => {
    if (!res) {
      console.error(chalk.red(`Error while fetching the api (bad response)`));
      return {};
    }
    return res.json();
  })
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

  defaultUrl = `${config.urls.root}${config.urls.root_path}`;
} catch (e) {
  defaultUrl = 'http://localhost:3000/api/v1';
}

console.info(chalk.grey('  api will be generated with running api server documentation'));
console.info(chalk.grey('  please make sure your server is running and api doc is reachable'));

let exportData = {};
inquirer.prompt({
  type: 'text',
  name: 'url',
  message: 'Remote api documentation',
  default: defaultUrl
})
.then((answers) => {
  Object.assign(exportData, answers);
  return getRemoteApiData(exportData.url + '/documentation');
})
.catch((err) => {
  console.error(chalk.red(`Error while fetching the main api infos (${err.message || err})`));
  process.exit();
})
.then((answers) => {
  if(answers.constructor !== Object) {
    console.error(chalk.red('Error while fetching the main api infos: not a valid object'));
    process.exit();
  }
  if (!answers.hasOwnProperty('success') || !answers.success.hasOwnProperty('dataset')) {
    console.error(chalk.red('Error while fetching the main api infos: missing data'));
    process.exit();
  }

  Object.assign(exportData, { api : answers.success.dataset[0] });
  return getRemoteApiData(exportData.url + exportData.api.links.methods);
})
.catch((err) => {
  console.error(chalk.red(`Error while fetching methods api infos (${err.message || err})`));
  process.exit();
})
.then((json) => {
  let templateData = { methods: [], api: exportData.api };
  let k = 1;
  json.success.dataset.forEach((methodConfig) => {
    if (methodConfig.args) {
      const { name, method = 'get', path, description = '@todo: add description' } = methodConfig;
      const { params, get, data } = methodConfig.args;
      const { single } = methodConfig.results;

      console.info(chalk.grey(`${k}/${json.success.dataset.length} ${name}`));
      k++;

      let methodData = {
        name,
        description,
        verb: method,
        path,
        options: [],
        singleResult: single,
        args: [],
      };

      if (params) {
        params.forEach((param) => {
          methodData.description += `\n   * @param ${param}`;
        });

        params.forEach((param) => {
          methodData.options.push(param);
        });

        params.forEach((param) => {
          methodData.path = methodData.path.replace(`:${param}`, '${' + param + '}'); // eslint-disable-line prefer-template
        });
        methodData.path = '`' + methodData.path + '`'; // eslint-disable-line prefer-template
      } else {
        methodData.path = "'" + methodData.path + "'";
      }

      methodData.args.push(methodData.path);

      if (get) {
        methodData.options.push('options = {}');
        methodData.args.push('options');
        const v = methodData.verb === 'patch' ? 'update' : methodData.verb;
        methodData.description += `\n   * @param options filtering items to ${v}`;
      } else if (data) {
        methodData.args.push('{}');
      }

      if (data) {
        methodData.options.push('data = {}');
        methodData.args.push('data');
        methodData.description += `\n   * @param data`;
      }

      templateData.methods.push(methodData);
    }
  });

  const template = getTemplate('api/main');
  outputTemplate('api/main', templateData, `${exportData.api.name}-client-${exportData.api.version}.js`);
});
