const geoJsonStream = require('geojson-stream');
const through = require('through2');
const { sort } = require('ramda');


const unwrapAntimeridian = (feature) => {
  const maxLong = sort(
    ([x1], [x2]) => x2 - x1,
    feature.geometry.coordinates[0]
  )[0][0];

  feature.geometry.coordinates[0] = feature.geometry.coordinates[0]
    .map((coord) => {
      if ((maxLong - coord[0]) > 180) {
        coord[0] = coord[0] + 360;
      }

      return coord;
    });

  return feature;
};


process.stdin
  .pipe(geoJsonStream.parse())
  .pipe(through.obj(function (feature, enc, next) {
    next(null, unwrapAntimeridian(feature));
  }))
  .pipe(geoJsonStream.stringify())
  .pipe(process.stdout);