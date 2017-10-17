const degrees2Radians = degrees => degrees * (Math.PI / 180);
const radians2Degrees = radians => radians * (180 / Math.PI);


const bearing = exports.bearing = ([lon1, lat1], [lon2, lat2]) => {
  const a = Math.sin(lon2 - lon1) *
    Math.cos(lat2);
  const b = Math.cos(lat1) *
    Math.sin(lat2) -
    Math.sin(lat1) *
    Math.cos(lat2) *
    Math.cos(lon2 - lon1);

  return Math.atan2(a, b);
};


const midDistance = exports.midDistance = ([lon1, lat1], [lon2, lat2]) => {
  var dLat = lat2 - lat1;
  var dLon = lon2 - lon1;

  var a = Math.pow(Math.sin(dLat / 2), 2) +
    Math.pow(Math.sin(dLon / 2), 2) *
    Math.cos(lat1) *
    Math.cos(lat2);

  return Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};


/**
 * Calculate midpoint between to geographic coordinates using the Haversine formula
 * http://www.movable-type.co.uk/scripts/latlong.html
 *
 * @param {[number, number]} degreesPoint1 first point, as [degreesX, degreesY] (aka [degreesLng, degreesLat])
 * @param {[number, number]} degreesPoint2 second point, as [degreesX, degreesY] (aka [degreesLng, degreesLat])
 */
exports.midpoint = (degreesPoint1, degreesPoint2) => {
  const radianPoint1 = degreesPoint1.map(degrees2Radians);
  const radianPont2 = degreesPoint2.map(degrees2Radians);

  var dist = midDistance(radianPoint1, radianPont2);
  var heading = bearing(radianPoint1, radianPont2);

  var lat2 = Math.asin(
    Math.sin(radianPoint1[1]) *
    Math.cos(dist) +
    Math.cos(radianPoint1[1]) *
    Math.sin(dist) *
    Math.cos(heading)
  );

  var lon2 = radianPoint1[0] + Math.atan2(
    Math.sin(heading) *
    Math.sin(dist) *
    Math.cos(radianPoint1[1]),
    Math.cos(dist) -
    Math.sin(radianPoint1[1]) *
    Math.sin(lat2)
  );

  return [lon2, lat2].map(radians2Degrees);
};


exports.compose = (...fns) => fns.reduce((a, b) => (...args) => a(b(...args)));
