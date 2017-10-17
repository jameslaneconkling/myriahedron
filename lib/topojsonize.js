const {
  readFileSync
} = require('fs');
const {
  topology
} = require('topojson');

const myriahedrons = process.argv.slice(2)
  .map(path => {
    const key = /[0-9](?=\.json?)/.exec(path);
    if (!key) {
      throw new Error(`could not determine key for path ${path}.  Expected a path ending in something like '-1.json'`);
    }

    return {
      key: key[0],
      geoJSON: readFileSync(path, { encoding: 'utf8' })
    };
  })
  .reduce((acc, { key, geoJSON }) => {
    acc[key] = JSON.parse(geoJSON);
    return acc;
  }, {});

console.log(JSON.stringify(topology(myriahedrons)));
