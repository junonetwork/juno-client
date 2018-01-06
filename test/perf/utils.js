import {
  range,
} from 'ramda';


// https://medium.com/javascript-scene/7-surprising-things-i-learned-writing-a-fibonacci-generator-4886a5c87710
const nsTime = exports.nsTime = (hrtime) => (hrtime[0] * 1e9) + hrtime[1];


exports.runPerfTests = (tests) => (
  tests.forEach(({
    title,
    count,
    pre = () => {},
    perf,
    post = () => {},
  }) => {
    const totalTime = range(0, count)
      .reduce((runningSum) => {
        const preArg = pre();

        const t1 = nsTime(process.hrtime());
        perf(preArg);
        const t2 = nsTime(process.hrtime());

        post();

        return runningSum + (t2 - t1);
      }, 0);

    console.log(`${title}\t- Average Time: ${Math.round((totalTime / count) / 1000) / 1000}ms - ${count} iterations`);
  })
);
