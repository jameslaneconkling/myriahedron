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

// NOTE - the below closure shenanigans ensures the stringified features array does not have a trailing comma
// necessary so the output passes a json linter
const stringifyFeatures = (() => {
  let first = true;
  return features => features
    .reduce((acc, feature) => {
      if (first) {
        first = false;
        return `${acc}${JSON.stringify(feature)}`;
      }

      return `${acc},${JSON.stringify(feature)}`;
    }, '');
})();


const createMyriahedron = (triangles, depth, cb) => {
  if (depth <= 1) {
    return cb(triangles);
  }

  triangles
    .forEach(triangle => {
      createMyriahedron(subdivideTriangle(triangle), depth - 1, cb);
    });
};


const createMyriahedronGenerator = function*(triangles, depth) {
  if (depth <= 1) {
    yield triangles;
    return;
  }

  for (let i = 0; i < triangles.length; i++) {
    yield* createMyriahedronGenerator(subdivideTriangle(triangles[i]), depth - 1);
  }
};


/**
 * Take an input icosahedron geoJSON and subdivide into a myriahedron of specified depth
 *
 * @param {Object} icosahedron input icosahedron geoJSON
 * @param {number} depth specified depth
 */
module.exports = (icosahedron, depth) => {
  /**
   * Strategy 1: generate myriahedron by recursively pushing results onto a read stream
   *
   * the simplest to implement, this strategy does not allow for backpressure, meaning if the function recurses
   * faster than the stream is consumed, the stream's buffer could eat up memory.
   *
   * even more problematic, because `createMyriahedron()` is fully synchronous, the stream cannot start to be
   * consumed until the function returns, essentially eliminating the benefit of the stream
   */
  // const readStream = new Readable;

  // const cb = features => readStream.push(stringifyFeatures(features));

  // readStream.push('{ "type": "FeatureCollection", "features": [');

  // createMyriahedron(icosahedron.features, depth, cb);

  // readStream.push('\n]}');
  // readStream.push(null);

  // return readStream;

  /**
   * Strategy 2: generate myriahedron by iterating a generator
   *
   * because generators are pull based, the stream can control the rate at which the generator
   * function recursively yields new features
   */
  const readStream = new Readable;

  readStream.push('{ "type": "FeatureCollection", "features": [');

  const myriahedronGenerator = createMyriahedronGenerator(icosahedron.features, depth);

  readStream._read = () => {
    const { value, done } = myriahedronGenerator.next();

    if (done) {
      readStream.push('\n]}');
      readStream.push(null);
      return;
    }

    readStream.push(stringifyFeatures(value));
  };


  return readStream;
};
