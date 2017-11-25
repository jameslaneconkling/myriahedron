const fs = require('fs');
const geoJsonStream = require('geojson-stream');
const subdivideMyriahedron = require('./lib/subdivideMyriahedron');


const depth = parseInt(process.argv[2], 10);
if (isNaN(depth) || depth < 1) {
  console.error('first argument must be an integer >= 1');
  process.exit(1);
}


const baseMyriahedronFilePath = process.argv[3] || `${__dirname}/data/myriahedron-1.json`;
let baseMyriahedron;


try {
  baseMyriahedron = JSON.parse(fs.readFileSync(baseMyriahedronFilePath));
} catch (e) {
  console.error('error reading or parsing file');
  console.error(e);
  process.exit(1);
}


subdivideMyriahedron(baseMyriahedron, depth)
  .pipe(geoJsonStream.stringify())
  .pipe(process.stdout);
