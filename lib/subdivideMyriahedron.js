const from = require('from');
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
 * Take an input myriahedron geoJSON and subdivide into a myriahedron of specified depth
 *
 * @param {Object} myriahedron input myriahedron geoJSON
 * @param {number} depth specified depth
 */
module.exports = (myriahedron, depth) => {
  const myriahedronGenerator = createMyriahedronGenerator(myriahedron.features, depth);

  return from(function (count, next) {
    const { value: features, done } = myriahedronGenerator.next();

    if (done) {
      return this.emit('end');
    }

    features.forEach(feature => this.emit('data', feature));

    next();
  });
};
