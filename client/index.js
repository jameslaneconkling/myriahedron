const {
  geoPath,
  geoOrthographic
} = require('d3-geo');
const {
  mesh
} = require('topojson-client');
const world = require('../node_modules/world-atlas/world/110m.json');
const myriahedron1 = require('../data/myriahedron-1.json');
// const myriahedron2 = require('../data/myriahedron-2.json');
const myriahedron4 = require('../data/myriahedron-4.json');
const width = 1000;
const height = 500;

const root = document.body.appendChild(document.createElement('div'));
const canvas = root.appendChild(document.createElement('canvas'));
const projection = geoOrthographic();
canvas.width = width;
canvas.height = height;
const context = canvas.getContext('2d');


const draw = (projection) => {
  const path = geoPath(projection, context);
  context.clearRect(0, 0, width, height);

  context.beginPath();
  context.lineWidth = 1;
  context.strokeStyle = '#aaa';
  path(mesh(world));
  context.stroke();

  context.beginPath();
  context.lineWidth = 0.5;
  context.strokeStyle = '#aaa';
  path(myriahedron4);
  context.stroke();

  // context.beginPath();
  // path(myriahedron2);
  // context.lineWidth = 2;
  // context.strokeStyle = '#aaa';
  // context.stroke();

  context.beginPath();
  path(myriahedron1);
  context.lineWidth = 2;
  context.strokeStyle = '#666';
  context.stroke();
};

setInterval(() => {
  draw(projection.rotate([Date.now() / 80, -20]));
}, 0);
