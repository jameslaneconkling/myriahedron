const {
  compose,
  sort,
  uniq,
  splitEvery
} = require('ramda');
const geoJsonStream = require('geojson-stream');
const through = require('through2');
const { Slice: slice } = require('polyk');


const wrapAntimeridian = (feature) => {
  const maxLong = sort(
    ([x1], [x2]) => x2 - x1,
    feature.geometry.coordinates[0]
  )[0][0];

  feature.geometry.coordinates[0] = feature.geometry.coordinates[0]
    .map((coord) => {
      if (maxLong > 180 && coord[0] >= 180) {
        coord[0] = coord[0] % 180 - 180;
      } else if (coord[0] < -180) {
        coord[0] = coord[0] % 180 + 180;
      }

      return coord;
    });

  return feature;
};


const flattenCoordinates = coordinates => coordinates.reduce((flattened, [x, y]) => {
  flattened.push(x, y);
  return flattened;
}, []);


const groupCoordinates = compose(
  uniq,
  splitEvery(2)
);


const snapToAntimeridian = coordinates => {
  return coordinates
    .map(coords => {

      if (Math.abs(180 - coords[0]) < 0.0000001) {
        coords[0] = 180;
      }

      return coords;
    });
};


const splitOnAntimeridian = (feature) => {
  return slice(
    flattenCoordinates(
      feature.geometry.coordinates[0]
    ),
    180,
    90,
    180,
    -90
  )
    .map(groupCoordinates)
    .map(snapToAntimeridian)
    .map(([first, ...rest]) => ({
      type: 'Feature',
      properties: feature.properties,
      geometry: {
        type: 'Polygon',
        coordinates: [[first, ...rest, first]]
      }
    }));
};


process.stdin
  .pipe(geoJsonStream.parse())
  .pipe(through.obj(function (feature, enc, next) {
    splitOnAntimeridian(feature).forEach(polygon => this.push(polygon));

    next();
  }))
  .pipe(through.obj(function (feature, enc, next) {
    next(null, wrapAntimeridian(feature));
  }))
  .pipe(geoJsonStream.stringify())
  .pipe(process.stdout);
