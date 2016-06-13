#!/usr/bin/env node

import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import program from 'commander';
const pckg = require('../package.json');

const runScript = require('./library/runScript')(path.resolve(__dirname, 'scripts'));

process.on('unhandledRejection', (reason) => {
  console.error(`Unhandle promise rejection: ${reason}`); // eslint-disable-line no-console
  console.error(reason); // eslint-disable-line no-console
  try {
    loggerFactory('core', { message_prefix: 'unhandle promise' }).error(reason);
  } catch (err) {} // eslint-disable-line no-empty
});

const config = {
  install: {
    name: 'start a new project (scaffold and setup)',
    short: 'i',
  },
  generator: {
    name: 'generate some code',
    short: 'g',
  },
  seed: {
    name: 'seed database',
    short: 's',
    option: 'path',
  },
  scaffolder: {
    name: 'project scaffolding',
    short: 'S',
  },
  setup: {
    name: 'setup project .env file',
    short: 'c',
  },
  api: {
    name: 'generate api client',
    short: 'a',
  },
};

console.info('');
console.info(chalk.green(' ============================================'));
console.info(chalk.green.bold(`  ${pckg.name} v${pckg.version}`));
console.info(chalk.green(`  ${pckg.description}`));
console.info(chalk.green(' ============================================'));
console.info('');

program.version(pckg.version);

Object.keys(config).forEach((id) => {
  const cmd = `-${config[id].short}`;
  if (config[id].option) {
    program.option(`${cmd} --${id} [${config[id].option}]`, config.name);
  } else {
    program.option(`${cmd}, --${id}`, config.name);
  }
});
program.parse(process.argv);

let commandAsk = null;
Object.keys(config).forEach((id) => {
  if (program[id] && id != 'exit') {
    commandAsk = id;
  }
});

if (commandAsk) {
  const script = `${commandAsk}/index.js`;
  let args = [];
  if (config[commandAsk].option && program[commandAsk] !== null && program[commandAsk] !== true) {
    args.push(program[commandAsk]);
  }
  runScript(script, args);
} else {
  let help = ' You can call "nippy -h" to get all shortcuts and directly call following methods\n';
  console.info(chalk.grey(help));

  let choices = [];
  Object.keys(config).forEach((id) => {
    choices.push({ name: config[id].name, value: id, short: id });
  });
  choices.push({ name: 'nothing (exit)', value: 'exit', short: 'nothing' });

  inquirer.prompt({
    type: 'list',
    name: 'script',
    message: 'What do you need?',
    choices,
  })
  .then((answer) => {
    switch (answer.script) {
      case 'exit':
        console.info(chalk.grey('✌ Bye!'));
        process.exit(100);
        break;
      default: {
        return runScript(`${answer.script}/index.js`);
      }
    }
  })
  .catch((err) => console.error(chalk.red(`✘ Error while running command: ${err.message || err}`)));
}
