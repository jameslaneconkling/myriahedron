const {
  readFileSync
} = require('fs');
const world = require('../node_modules/world-atlas/world/110m.json');
const booleanDisjoint = require('@turf/boolean-disjoint');
// const booleanContains = require('@turf/boolean-contains');
const {
  feature
} = require('topojson');


// node lib/myriahedral-landcover.js data/myriahedron-6.json | node_modules/.bin/geo2topo > data/myriahedron-landcover-topology-6.json
const land = feature(world, world.objects.land);
const myriahedron = JSON.parse(readFileSync(process.argv[2]));

console.log(JSON.stringify({
  type: 'FeatureCollection',
  features: myriahedron.features
    // filter on triangle overlapping land [more permissive]
    .filter(feature => !booleanDisjoint(feature, land))
    // filter on triangle contained w/i land [less permissive]
    // .filter(feature => booleanContains(feature, land))
}));
