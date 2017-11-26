const from = require('from2');
const midpoint = require('@turf/midpoint');


const wrapAntimeridian = (coordinates) => {
  if (coordinates[0] > 180) {
    coordinates[0] = coordinates[0] % 180 - 180;
  } else if (coordinates[0] < -180) {
    coordinates[0] = coordinates[0] % 180 + 180;
  }

  return coordinates;
};


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
  const ab = wrapAntimeridian(midpoint(a, b).geometry.coordinates);
  const bc = wrapAntimeridian(midpoint(b, c).geometry.coordinates);
  const ac = wrapAntimeridian(midpoint(a, c).geometry.coordinates);


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

  return from.obj(function (size, next) {
    const { value: features, done } = myriahedronGenerator.next();

    if (done) {
      return next(null, null);
    }

    /* from2 semantics don't quite follow through2?  the following:
     * ```
     * features.forEach(feature => this.push(feature));
     * next()
     * ```
     * is interpreted as emitting an undefined value
     */
    features.forEach((feature, idx) => {
      if (idx === features.length - 1) {
        return next(null, feature);
      }

      this.push(feature);
    });
  });
};
