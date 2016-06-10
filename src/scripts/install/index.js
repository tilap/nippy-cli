import childProcess from 'child_process';
import path from 'path';
import chalk from 'chalk';
import { Spinner } from 'cli-spinner';

const runScript = require('../../library/runScript')(path.resolve(__dirname, '../..', 'scripts'));

const spinner = new Spinner('  %s processing... please wait');
spinner.setSpinnerString('|/-\\');

runScript('scaffolder/index.js')
  .then(() => runScript('setup/index.js'))
  .then(() => new Promise((resolve, reject) => {
    console.info('');
    console.info(chalk.green.bold('❯ Installing node dependancies...'));
    console.info(chalk.grey('  Could take a few minutes depending on your connection... Coffee time ;)'));
    spinner.start();
    childProcess.exec('npm install', (err, stdout, stderr) => {
      spinner.stop();
      return resolve()
    });
  }))
  .then(() => new Promise((resolve, reject) => {
    console.info('');
    console.info(chalk.green.bold('❯ Building the app for first time...'));
    spinner.start();
    childProcess.execSync('npm run build');
    spinner.stop();

    spinner.start();
    childProcess.exec('npm run build', (err, stdout, stderr) => {
      spinner.stop();
      return resolve()
    });
  }))
  .then(() => {
    console.info('');
    console.info(chalk.green('✓ The api is installed'));
    console.info(chalk.grey('  If you don\'t already have a running mongodb, you can start "npm run db", then "npm run watch" to start the app.'));
    console.log('');
  });
