const {
  geoPath,
  geoOrthographic,
  geoOrthographicRaw,
  geoProjectionMutator
} = require('d3-geo');
const {
  mesh,
  feature
} = require('topojson');
const world = require('../node_modules/world-atlas/world/110m.json');
const myriahedronTopology5 = require('../data/myriahedron-topology-5.json');
const width = 1000;
const height = 1000;

const root = document.body.appendChild(document.createElement('div'));
root.setAttribute('style', 'position: absolute; top: 0; bottom: 0; left: 0; right: 0; cursor: -webkit-grab');
const canvas = root.appendChild(document.createElement('canvas'));
canvas.setAttribute('style', `width: ${width / 2}px; height: ${height / 2}px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);`);
const projection = geoOrthographic().translate([250, 250]);
const projection2 = geoProjectionMutator(
  () => (x, y) => geoOrthographicRaw(-x, y)
)()
  .scale(249.5)
  .clipAngle(90 + 1e-6)
  .translate([250, 250]);
canvas.width = width;
canvas.height = height;


/**
 * context
 * {
 *   beginPath()
 *   moveTo(x, y)
 *   lineTo(x, y)
 *   arc(x, y, radius, startAngle, endAngle)
 *   closePath()
 * }
 */
const context = canvas.getContext('2d');
context.scale(2,2);


let isClicked = false;
let mouseYPercent;
document.onmousedown = () => {
  root.style.cursor = '-webkit-grabbing';
  isClicked = true;
};
document.onmouseup = () => {
  root.style.cursor = '-webkit-grab';
  isClicked = false;
};
document.onmousemove = ({ pageY }) => {
  if (isClicked) mouseYPercent = pageY / window.outerHeight;
};


const draw = (projection, projection2) => {
  const path = geoPath(projection, context);
  const path2 = geoPath(projection2, context);
  context.clearRect(0, 0, width, height);

  context.beginPath();
  context.lineWidth = 0.5;
  context.strokeStyle = '#bbb';
  context.fillStyle = 'rgba(200,200,200,0.1)';
  path2(feature(world, world.objects.land));
  context.fill();
  context.stroke();

  context.beginPath();
  context.lineWidth = 0.5;
  context.strokeStyle = '#999';
  context.fillStyle = 'rgba(50,50,50,0.1)';
  path(feature(world, world.objects.land));
  context.fill();
  context.stroke();

  context.beginPath();
  context.lineWidth = 0.5;
  context.strokeStyle = '#bbb';
  path(mesh(myriahedronTopology5));
  context.stroke();
};

let lat = 180;
setInterval(() => {
  lat += 1;
  draw(
    projection.rotate([lat, mouseYPercent ? (80 * mouseYPercent) - 40 : -20]),
    projection2.rotate([lat + 180, mouseYPercent ? (-80 * mouseYPercent) + 40 : 20])
  );
}, 0);
