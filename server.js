const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const cors = require("cors");
const config = require("./server/configs/index.js");
const path = require("path");
const db = require("./server/db.js");
const userRouter = require("./server/routes/user-router.js");
const { staticFileMiddleware } = require("./server/middlewares.js");
const app = express();
require("dotenv").config();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", userRouter);

app.use("/public", express.static(path.join(__dirname, "./public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/test", (req, res) => {
  console.log("Test route accessed");
  res.send("Test route response");
});

const promiseServer = async (app) => {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    resolve(server);
  });
};

const promiseRun = (server) => {
  return new Promise((resolve, reject) => {
    server.listen(config.port, () => {
      console.log("Server started and listening on the port " + config.port);
      resolve();
    });
  });
};

async function initialize() {
  await db.initialize();

  const server = await promiseServer(app);
  console.log("Server initialized.");
  await promiseRun(server);
}

initialize();
