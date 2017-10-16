const fs = require('fs');

const icosahedron = JSON.parse(fs.readFileSync(process.argv[2]));

/**
 * Convert icosahedron lines to triangle polygons
 *
 * The collection of triangles that make up the faces of the icosahedron is
 * equal to the collection of all 3-vertex cycles.
 */


/**
 * index all edges and nodes for efficient access
 */
const graph = icosahedron.features.reduce((acc, { properties: { Name }, geometry: { coordinates: [fromCoords, toCoords] } }) => {
  const from = parseInt(Name.substring(0, 1));
  const to = parseInt(Name.substring(1));

  if (!acc.nodes[from]) {
    acc.nodes[from] = fromCoords;
  }

  if (!acc.nodes[to]) {
    acc.nodes[to] = toCoords;
  }

  if (!acc.fromEdges[from]) {
    acc.fromEdges[from] = [to];
  } else {
    acc.fromEdges[from].push(to);
  }

  if (!acc.toEdges[to]) {
    acc.toEdges[to] = [from];
  } else {
    acc.toEdges[to].push(from);
  }

  return acc;
}, { nodes: {}, fromEdges: {}, toEdges: {} });


/**
 * Recursively search for 3-vertex cycles
 */
const findCycles = (graph, node, cycle = []) => {
  if (cycle.length === 3 && cycle[0] === node) {
    return [[...cycle, node]]; // found cycle
  } else if (cycle.length === 3) {
    return []; // failed to find cycle
  }

  // visit all outgoing and incoming edges to construct new cycle
  return ([...graph.fromEdges[node] || [], ...graph.toEdges[node] || []])
    .filter(nextNode => nextNode > node || nextNode === cycle[0])
    .reduce((result, nextNode) => {
      return [...result, ...findCycles(graph, nextNode, [...cycle, node])];
    }, []);
};


/**
 * convert cycles to geoJSON polygon features
 */
const features = Object.keys(graph.nodes)
  .map(node => parseInt(node, 10))
  .reduce((acc, node) => {
    acc.push(...findCycles(graph, node));

    return acc;
  }, [])
  .map((cycle, idx) => ({
    type: 'Feature',
    properties: { id: String(idx) },
    geometry: {
      type: 'Polygon',
      coordinates: [cycle.map(node => graph.nodes[node])]
    }
  }));

console.log(JSON.stringify({
  type: 'FeatureCollection',
  features
}));
