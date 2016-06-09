import fs from 'fs';

module.exports = (fileToSaveTo, content, options = { encoding: 'utf8' }) => {
  try {
    fs.writeFileSync(fileToSaveTo, content, options);
    console.log(`File "${fileToSaveTo}" saved!`);
    return true;
  } catch (err) {
    console.log('ERROR WHILE SAVING FILE');
    console.log(err);
    return false;
  }
};
