const { parentPort, workerData } = require('worker_threads');
const { getSum } = require('./sum');

const array_values = workerData.chunk;

const runtime = getSum(array_values);

parentPort.postMessage({
    runtime
});
