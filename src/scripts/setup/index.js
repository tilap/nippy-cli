import chalk from 'chalk';
import crypto from 'crypto';
import inquirer from 'inquirer';
import fs from 'fs';
import fse from 'fs-extra';
import path from 'path';
import replace from 'replace';

const templateFile = '.env-example';
const distFile = '.env';
const configPath = path.resolve(process.cwd(), './src/app/config/');

console.info('');
console.info(chalk.green.bold('❯ Setting .env file'));

try {
  fs.accessSync(templateFile, fs.F_OK);
} catch (e) {
  console.error(chalk.red('You need to scalfold the project first'));
  console.error(chalk.grey(`The template file ${templateFile} was not found`));
  process.exit();
}

let data = {};

inquirer.prompt({
  type: 'list',
  name: 'NODE_ENV',
  message: 'Node environement',
  choices: [
    { name: 'Production', value: 'production', short: 'production' },
    { name: 'Testing', value: 'test', short: 'test' },
    { name: 'Development', value: 'development', short: 'development' },
  ],
  default: 'development',
})
.then((answers) => {
  Object.assign(data, answers);
  return inquirer.prompt({
    type: 'text',
    name: 'PORT',
    message: 'Port',
    default: 3000,
    validate: (v) => /^\d+/.test(v) && v > 0 && v < 65556,
  });
})
.then((answers) => {
  Object.assign(data, answers);
  return inquirer.prompt({
    type: 'text',
    name: 'WEB_URL',
    message: 'Web url',
    default: `http://localhost:${answers.PORT}`,
  });
})
.then((answers) => {
  Object.assign(data, answers);
  return inquirer.prompt({
    type: 'text',
    name: 'LOG_PATH',
    message: 'Path to store logs',
    default: './tmp',
  });
})
.then((answers) => {
  Object.assign(data, answers);
  return inquirer.prompt({
    type: 'text',
    name: 'DATABASES_MAIN',
    message: 'Main mongo database',
    default: 'mongodb://localhost:27299/myapp-dev',
  });
})
.then((answers) => {
  Object.assign(data, answers);
  return new Promise((resolve, reject) => {
    crypto.randomBytes(16, (ex, buf) => resolve(buf.toString('hex')));
  });
})
.then((randomToken) => inquirer.prompt({
  type: 'text',
  name: 'TOKEN_SECRET',
  message: 'Secret token',
  default: randomToken,
})
)
.then((answers) => {
  Object.assign(data, answers);
  // Copy files
  fse.copy(templateFile, distFile, { clobber: true }, (err) => {
    // Replace in .env files
    Object.keys(data).forEach((key) => {
      replace({
        regex: `\{\{\{\{${key}\}\}\}\}`,
        replacement: data[key],
        paths: ['.env'],
        recursive: false,
        silent: true,
      });
    });
  });

  // Copy config files if not exists
  fse.walk(`${configPath}/base`)
    .on('data', (item) => {
      if (fs.lstatSync(item.path).isFile()) {
        const newFilePath = item.path.replace(`${configPath}/base`, configPath);
        let fileExists = true;
        try {
          fs.accessSync(newFilePath, fs.F_OK);
        } catch (e) {
          fileExists = false;
        }
        if (!fileExists) {
          fse.copySync(item.path, newFilePath);
          console.info(chalk.green(`  ${newFilePath} config file created`));
        } else {
          console.info(chalk.grey(`  Config file ${newFilePath} already exists (skip copy)`));
        }
      }
    });
});
