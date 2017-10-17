const {
  geoPath,
  geoOrthographic,
  geoOrthographicRaw,
  geoProjectionMutator
} = require('d3-geo');
const {
  mesh
} = require('topojson');
const world = require('../node_modules/world-atlas/world/110m.json');
const myriahedronTopology5 = require('../data/myriahedron-topology-5.json');
// const myriahedronTopology1_2_5 = require('../data/myriahedron-topology-1-2-5.json');
// const myriahedronTopologyLandcover6 = require('../data/myriahedron-landcover-topology-6.json');
const width = 1000;
const height = 1000;

const root = document.body.appendChild(document.createElement('div'));
root.setAttribute('style', 'position: absolute; top: 0; bottom: 0; left: 0; right: 0; cursor: -webkit-grab');
const canvas = root.appendChild(document.createElement('canvas'));
canvas.setAttribute('style', `width: ${width / 2}px; height: ${height / 2}px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);`);
const projection = geoOrthographic().translate([250, 250]);
// const projection2 = geoOrthographic().translate([250, 250]);
const projection2 = geoProjectionMutator(
  () => (x, y) => geoOrthographicRaw(-x, y)
)()
  .scale(249.5)
  .clipAngle(90 + 1e-6)
  .translate([250, 250]);
canvas.width = width;
canvas.height = height;
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
  context.strokeStyle = '#aaa';
  path2(mesh(world, world.objects.land));
  context.stroke();

  // context.beginPath();
  // context.lineWidth = 0.5;
  // context.strokeStyle = '#eaeaea';
  // path2(mesh(myriahedronTopology5));
  // context.stroke();

  context.beginPath();
  context.lineWidth = 1;
  context.strokeStyle = '#aaa';
  path(mesh(world, world.objects.land));
  context.stroke();

  context.beginPath();
  context.lineWidth = 0.5;
  context.strokeStyle = '#bbb';
  path(mesh(myriahedronTopology5));
  context.stroke();


  // context.beginPath();
  // context.lineWidth = 0.8;
  // context.strokeStyle = '999';
  // path(mesh(myriahedronTopology1_2_5, myriahedronTopology1_2_5.objects['1']));
  // context.stroke();
};

let lat = 180;
setInterval(() => {
  lat += 1;
  draw(
    projection.rotate([lat, mouseYPercent ? (80 * mouseYPercent) - 40 : -20]),
    projection2.rotate([lat + 180, mouseYPercent ? (-80 * mouseYPercent) + 40 : 20])
  );
}, 0);
