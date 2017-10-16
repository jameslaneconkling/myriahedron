const {
  geoPath,
  geoOrthographic
} = require('d3-geo');
const topojson = require('topojson-client');
const world = require('../node_modules/world-atlas/world/110m.json');

console.log(world);

const width = 1000;
const height = 500;

const root = document.body.appendChild(document.createElement('div'));
const canvas = root.appendChild(document.createElement('canvas'));
canvas.width = width;
canvas.height = height;


const context = canvas.getContext('2d');
const path = geoPath(geoOrthographic(), context);

context.beginPath();
path(topojson.mesh(world));
context.stroke();
