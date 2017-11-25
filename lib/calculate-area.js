const geoJsonStream = require('geojson-stream');
const through = require('through2');
const area = require('@turf/area');


process.stdin
  .pipe(geoJsonStream.parse())
  .pipe(through.obj(function(feature, enc, next) {
    feature.properties.area = area(feature);

    next(null, feature);
  }))
  // .pipe(geoJsonStream.stringify())
  .pipe(through.obj(function (feature, enc, next) {
    next(null, feature.properties.area + '\n');
  }))
  .pipe(process.stdout);
