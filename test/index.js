const test = require('tape');
const concat = require('concat-stream');
const JSONStream = require('JSONStream');
const myriahedron1 = require('../data/myriahedron-1.json');
const myriahedron2 = require('../data/myriahedron-2.json');
const subdivideMyriahedron = require('../index.js');


test('calling subdivideMyriahedron with myriahedron-1 and depth 2 should output myriahedron-2 [smoke test]', (t) => {
  t.plan(1);

  subdivideMyriahedron(myriahedron1, 2)
    .on('error', t.fail)
    .pipe(JSONStream.stringify(
      '{"type":"FeatureCollection","features":[',
      ',',
      ']}'
    ))
    .pipe(concat(result => t.deepEqual(JSON.parse(result), myriahedron2)));
});
