'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (fileToSaveTo, content) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? { encoding: 'utf8' } : arguments[2];

  try {
    _fs2.default.writeFileSync(fileToSaveTo, content, options);
    console.log('File "' + fileToSaveTo + '" saved!');
    return true;
  } catch (err) {
    console.log('ERROR WHILE SAVING FILE');
    console.log(err);
    return false;
  }
};