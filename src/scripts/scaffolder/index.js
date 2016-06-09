import inquirer from 'inquirer';
import fs from 'fs';
import fse from 'fs-extra';
import path from 'path';
import replace from 'replace';
import chalk from 'chalk';
import { exec } from 'child_process';

console.info('');
console.info(chalk.green.bold('❯ Scaffolding sources'));

let data = { name: '', scaff: {} };
let choices = [];

// Config data from package.json and user local config
let config = require('../../../package.json').scaffolding;
let userConfig = {};
const customFileConfig = path.resolve(process.env.HOME || process.env.USERPROFILE, '.nippyrc');
try {
  fs.accessSync(customFileConfig, fs.F_OK);
  userConfig = fse.readJsonSync(customFileConfig, 'utf8');
} catch (e) {
  console.info(chalk.grey('  No user config'));
}
Object.assign(config, userConfig);

// Make choices list
Object.keys(config).forEach((id) => {
  const { name, path = null, url = null } = config[id];
  if (path === null && url === null) {
    console.error(chalk.red(`✘ Error in scaffold configuration: entry ${config} has neither url nor path`));
  } else {
    const prefix = path === null ? '[remote] ' : '[local]  ';
    choices.push({ name: `${prefix} ${name}`, value: id });
  }
});
choices.sort((a, b) => a.name > b.name);
choices.push(new inquirer.Separator());
choices.push({ name: 'None (end)', value: 'exit' });

// Start prompting
inquirer.prompt({
  type: 'list',
  name: 'scaff',
  message: 'What type of source do you want?',
  choices,
})
.then((answer) => {
  if (answer.scaff === 'exit') {
    console.info(chalk.grey('✌ Bye!'));
    process.exit(100);
  }
  data.scaff = config[answer.scaff];
  return inquirer.prompt({
    type: 'text',
    name: 'name',
    message: 'Name of the package',
    default: 'my-app',
    validate: (name) => (name.match(/^[a-z][a-z0-9\-]*$/) ? true : 'Must start with a letter and contains number, alpha chars and -'),
  });
})
.then((answers) => new Promise((resolve, reject) => {
  data.name = answers.name;
  if (data.scaff.path) {
    const sources = data.scaff.path.substr(0, 1) === '/' ? data.scaff.path : path.resolve(__dirname, '../..', data.scaff.path);
    console.info(chalk.gray(`  Copy files from ${sources}...`));
    fse.copy(sources, '.', { clobber: answers.overwrite || false }, (err) => {
      if (err) {
        console.error(chalk.red(`✘ Error during file copy: ${err.message || err}`));
        return reject();
      }
      console.info(chalk.green('✓ done'));
      return resolve();
    });
  } else if (data.scaff.url) {
    console.info(chalk.gray(`  Importing from remote tarball ${data.scaff.url}`));

    const tmpName = 'nippy-tarball-download.tar.gz';
    exec(`curl -L -o ${tmpName} ${data.scaff.url} && tar --strip-components=1 -xvf ${tmpName} && rm -f ${tmpName}`, (err, stdout, stderr) => {
      if (err) return reject(err);
      console.info(chalk.green('✓ done'));
      resolve();
    });
  } else {
    throw new Error('Unknown scaff type...');
  }
}))
.then(() => {
  console.info(chalk.gray('  Applying your settings to the sources...'));
  replace({
    regex: 'NIPPY_PROJECT_NAME',
    replacement: data.name,
    paths: ['package.json', 'README.md'],
    recursive: false,
    silent: true,
  });
  console.info(chalk.green('✓ done'));
})
.catch((err) => {
  console.error(chalk.red('✘ Error during scaffolding'));
  console.error(chalk.red(err.message) || err);
  process.exit(100);
});
