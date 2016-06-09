import childProcess from 'child_process';
import fs from 'fs';

module.exports = (rootPath) => (scriptPath, options = []) => new Promise((resolve, reject) => {
  scriptPath = `${rootPath}/${scriptPath}`;

  try {
    fs.accessSync(scriptPath);
  } catch (err) {
    return reject(new Error(`Unable to access the script ${scriptPath}: ${err.message || err}`));
  }

  let invoked = false;
  const process = childProcess.fork(scriptPath, options);

  process.on('error', (err) => {
    if (invoked) return;
    invoked = true;
    return reject(err);
  });

  process.on('exit', (code) => {
    if (invoked) return;
    invoked = true;
    if (code === 0) {
      return resolve();
    }
    reject(new Error(`exit code ${code}`));
  });
});
