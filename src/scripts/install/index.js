import childProcess from 'child_process';
import path from 'path';
import chalk from 'chalk';

const runScript = require('../../library/runScript')(path.resolve(__dirname, '../..', 'scripts'));

runScript('scaffolder/index.js')
  .then(() => runScript('setup/index.js'))
  .then(() => new Promise((resolve, reject) => {
    console.info('');
    console.info(chalk.green.bold('❯ Installing node dependancies...'));
    console.info(chalk.grey('  Could take a few minutes depending on your connection... Coffee time ;)'));
    childProcess.exec('npm install', (err, stdout, stderr) => resolve());
  }))
  .then(() => new Promise((resolve, reject) => {
    console.info('');
    console.info(chalk.green.bold('❯ Building the app for first time...'));
    childProcess.execSync('npm run build');
    childProcess.exec('npm run build', (err, stdout, stderr) => resolve());
  }))
  .then(() => {
    console.info(chalk.green('✓ The api is installed'));
    console.info(chalk.grey('  If you don\'t already have a running mongodb, you can start "npm run db", then "npm run watch" to start the app.'));
    console.log('');
  });
