const path = require("path");
const express = require("express");
const routes = express.Router();
const { Worker } = require("worker_threads");
const { insert_values, get_values } = require("./src/database");
const { getSum } = require("./src/sum");

/**@type {{[_:string]: Worker}} */
const workers = {};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function create_array(size) {
  const arr = [];
  for (let i = 0; i < size; i++) {
    arr.push(getRandomInt(100, 999));
  }
  return arr;
}

routes.get("/src/assets/", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "src", "assets", "index.html"));
});

routes.get("/values", async (req, res) => {
  try {
    const values = await get_values();
    return res.status(200).json({ count: values.length, res: values });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

routes.post("/values", async (req, res) => {
  const { count_threads, size } = req.body;
  const has_threads = count_threads > 0;
  if (!size) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const array_values = create_array(size);
    if (!count_threads) {
      const runtime = getSum(array_values);
      await insert_values({ size, has_threads, count_threads, runtime });
      return res.status(201).json({ success: true });
    }

    const chunkSize = Math.ceil(array_values.length / count_threads);
    const workerPromises = [];
    let totalRuntime = 0;

    for (let i = 0; i < count_threads; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, array_values.length);
      const chunk = array_values.slice(start, end);
      const sessionName = Date.now().toString();
      const worker = new Worker(path.join(__dirname, "src", "app.js"), {
        workerData: { chunk },
      });

      workers[sessionName] = worker;
      workerPromises.push(
        new Promise((resolve, reject) => {
          worker.on("message", (message) => {
            totalRuntime += message.runtime;
            resolve(message);
          });
          worker.on("error", reject);
          worker.on("exit", (code) => {
            if (code !== 0) {
              reject(new Error(`Worker stopped with exit code ${code}`));
            }
          });
        })
      );
    }

    await Promise.all(workerPromises);
    await insert_values({ size, has_threads, count_threads, runtime: totalRuntime });

    return res.status(201).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = { routes };
