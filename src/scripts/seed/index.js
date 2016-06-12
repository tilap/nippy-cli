import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import dotenv from 'dotenv';

console.info('');
console.info(chalk.green.bold('❯ Seeding database'));

const scriptRoot = process.cwd(); // Current root, expected to be at the root of the app
const modelFactoryPath = path.resolve(scriptRoot, './dist/core/factory/model.js');

try {
  fs.accessSync(modelFactoryPath, fs.F_OK);
} catch (e) {
  console.error(chalk.red('  You need to scalfold the project first and build it'));
  console.error(chalk.grey(`  The file ${modelFactoryPath} are required`));
  process.exit();
}

try {
  dotenv.config();
} catch (err) {
  console.info(chalk.grey(`  .env file not found. Use global environment`));
}
if (!process.env.PORT) process.env.PORT = 1234; // port is useless but is required to work

function seed(folder) {
  if (folder.substr(0, 1) !== '/') {
    folder = path.resolve(scriptRoot, folder);
  }

  return new Promise((resolve, reject) => {
    try {
      fs.accessSync(folder, fs.F_OK);
    } catch (err) {
      return reject(`Seeding folder "${folder}" not found`);
    }

    const modelFactory = require(modelFactoryPath); // eslint-disable-line global-require

    let promises = { insert: [], drop: [] };
    let databaseSeeds = [];

    fs.readdirSync(folder).forEach((file) => {
      const seedFile = `${folder}/${file}`;
      if (fs.statSync(seedFile).isFile()) {
        databaseSeeds.push(file);
        const datas = require(seedFile); // eslint-disable-line global-require
        const modelSlug = file.replace('.json', '');
        console.info(chalk.grey(`  found ${modelSlug} to seed`));

        const model = modelFactory(modelSlug);
        promises.drop.push(model.remove());
        datas.forEach((data) => {
          promises.insert.push(model(data).save());
        });
      }
    });

    console.info(`  ${databaseSeeds.length} databases to seed`);

    return Promise.all(promises.drop)
      .catch((err) => reject(`Error while dropping collection: ${err.message || err}`))
      .then((res) => Promise.all(promises.insert))
      .catch((err) => reject(`Error while inserting document: ${err.message || err}`))
      .then((res) => resolve('Seeding done'));
  });
}

new Promise((resolve, reject) => {
  if (process.argv[2] && process.argv[2].constructor === String) {
    return resolve(process.argv[2]);
  } else {
    return inquirer.prompt({
      type: 'text',
      name: 'folder',
      message: 'Seed data folder',
      default: 'seed',
    }).then((answers) => resolve(answers.folder));
  }
})
.then((folder) => seed(folder))
.then((res) => {
  console.info(chalk.green(`✓ ${res}`));
  console.log('');
  process.exit(0);
})
.catch((err) => {
  console.error(chalk.red('✘ Error during seeding'));
  console.error(chalk.red(err.message) || err);
  process.exit(0);
});
