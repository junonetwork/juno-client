import {
  range,
} from 'ramda';


// https://medium.com/javascript-scene/7-surprising-things-i-learned-writing-a-fibonacci-generator-4886a5c87710
const nsTime = exports.nsTime = (hrtime) => (hrtime[0] * 1e9) + hrtime[1];


exports.runPerfTests = (tests) => (
  tests.forEach(({
    title,
    count = 20,
    init = () => {},
    run,
  }) => {
    const totalTime = range(0, count)
      .reduce((runningSum) => {
        const initArg = init();

        const t1 = nsTime(process.hrtime());
        run(initArg);
        const t2 = nsTime(process.hrtime());


        return runningSum + (t2 - t1);
      }, 0);

    // NOTE - this still throws an out of memory error w/ too many iterations,
    // meaning memoized selects aren't getting garbage collected...
    if (global.gc) {
      global.gc();
    }

    console.log(`${title}\t- Average Time: ${Math.round((totalTime / count) / 1000) / 1000}ms - ${count} iterations`);
  })
);
