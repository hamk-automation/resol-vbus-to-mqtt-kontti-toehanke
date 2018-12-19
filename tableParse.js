const tabletojson = require('tabletojson');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('table1.html', { encoding: 'UTF-8' });
const converted = tabletojson.convert(html);
fs.writeFileSync('parsedTable.json', JSON.stringify(converted))
console.log(converted);