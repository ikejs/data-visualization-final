const data = require('../data.json');
const codes = require('./alpha-3-to-name.json');
const fs = require('fs');


const newData = data.map(obj => {
  obj.key = Object.keys(codes).find(key => codes[key] === obj.country);
  return obj;
}).filter(country => country.key);

fs.writeFile('new.json', JSON.stringify(newData), (err) => {
  if (err) return console.log(err);
  console.log('done');
});


console.log(newData);