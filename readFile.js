const fs = require('fs');

//readFile method that accepts a filepath and a callback
module.exports.readFile = (file, cb) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if(err) throw err;
    data = data.split('\n');
    cb(data);
  });
}
