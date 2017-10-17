const {
  geoPath,
  geoOrthographic
} = require('d3-geo');
const {
  mesh
} = require('topojson');
// const world = require('../node_modules/world-atlas/world/110m.json');
// const myriahedron1 = require('../data/myriahedron-1.json');
// const myriahedron2 = require('../data/myriahedron-2.json');
// const myriahedron4 = require('../data/myriahedron-4.json');
// const myriahedron5 = require('../data/myriahedron-5.json');
// const myriahedronTopology5 = require('../data/myriahedron-topology-5.json');
const myriahedronTopology1_2_5 = require('../data/myriahedron-topology-1-2-5.json');
const width = 1000;
const height = 500;

const root = document.body.appendChild(document.createElement('div'));
root.setAttribute('style', 'position: absolute; top: 0; bottom: 0; left: 0; right: 0');
const canvas = root.appendChild(document.createElement('canvas'));
canvas.setAttribute('style', 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)');
const projection = geoOrthographic();
canvas.width = width;
canvas.height = height;
const context = canvas.getContext('2d');


const draw = (projection) => {
  const path = geoPath(projection, context);
  context.clearRect(0, 0, width, height);

  // context.beginPath();
  // context.lineWidth = 1;
  // context.strokeStyle = '#aaa';
  // path(mesh(world));
  // context.stroke();

  context.beginPath();
  context.lineWidth = 0.5;
  context.strokeStyle = '#aaa';
  path(mesh(myriahedronTopology1_2_5, myriahedronTopology1_2_5.objects['5']));
  context.stroke();

  // context.beginPath();
  // context.lineWidth = 1;
  // context.strokeStyle = '#aaa';
  // path(mesh(myriahedronTopology1_2_5, myriahedronTopology1_2_5.objects['1']));
  // context.stroke();
};

setInterval(() => {
  draw(projection.rotate([Date.now() / 80, -20]));
}, 0);
