// This code is very optimized
// function getSum(array_values) {
//   const startTime = process.hrtime();
//   const sum = array_values.reduce((acc, val) => acc + val, 0);
//   const [seconds, nanoseconds] = process.hrtime(startTime);
//   const runtime = seconds + nanoseconds / 1e9;
//   return runtime;
// }

function getSum(array_values) {
  const startTime = process.hrtime();
  let sum = 0;
  for (let value of array_values) {
    sum += value;
  }
  const [seconds, nanoseconds] = process.hrtime(startTime);
  const runtime = seconds + nanoseconds / 1e9;
  return runtime;
}

module.exports = { getSum };
