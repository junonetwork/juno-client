const Benchmark = require('benchmark');
const {
  state,
  graphFragment,
} = require('./perf-data');
const {
  getSheetMatrix,
} = require('../../app/redux/modules/sheets');


// console.log(JSON.stringify(getSheetMatrix(state, '0', graphFragment.json), null, 2));
const suite = new Benchmark.Suite();


suite
  .add(
    'getSheetMatrix',
    () => getSheetMatrix(state, '0', graphFragment.json)
  )
  .on('cycle', (event) => (
    console.log(String(event.target))
  ))
  .run();
