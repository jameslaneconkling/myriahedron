const {
  Readable
} = require('stream');
const {
  midpoint
} = require('./utils');


/**
 * subdivide triangle into four triangles
 *
 *         a                     a
 *       /   \                 /   \
 *     /      \    ====>     ab --- ac
 *   /         \           /   \  /   \
 *  b --------- c         b --- bc --- c
 *
 */
const subdivideTriangle = ({ properties: { id }, geometry: { coordinates: [[a, b, c]] } }) => {
  const ab = midpoint(a, b);
  const bc = midpoint(b, c);
  const ac = midpoint(a, c);

  return [
    { id, coordinates: [[a, ab, ac, a]] },
    { id, coordinates: [[ab, b, bc, ab]] },
    { id, coordinates: [[bc, ac, ab, bc]] },
    { id, coordinates: [[ac, bc, c, ac]] }
  ]
    .map(({ id, coordinates }, idx) => ({
      type: 'Feature',
      properties: { id: `${id}.${idx + 1}` },
      geometry: { type: 'Polygon', coordinates }
    }));
};

// NOTE - doesn't quite pass a linter b/c of final trailing comma
const stringifyFeatures = features => features.reduce((acc, feature) => `${acc}\n${JSON.stringify(feature)},`, '');


const createMyriahedron = (triangles, depth, cb) => {
  if (depth <= 1) {
    return cb(triangles);
  }

  triangles
    .forEach(triangle => {
      createMyriahedron(subdivideTriangle(triangle), depth - 1, cb);
    });
};


/**
 * Take an input icosahedron geoJSON and subdivide into a myriahedron of specified depth
 *
 * @param {Object} icosahedron input icosahedron geoJSON
 * @param {number} depth specified depth
 */
module.exports = (icosahedron, depth) => {
  const readStream = new Readable;

  const cb = features => readStream.push(stringifyFeatures(features));

  readStream.push('{ "type": "FeatureCollection", "features": [');

  createMyriahedron(icosahedron.features, depth, cb);

  readStream.push('\n]}');
  readStream.push(null);

  return readStream;
};
