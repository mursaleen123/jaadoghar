import express from "express";
import http from "http";
import cors from "cors";
import config from "./server/configs/index.js";
import path from "path";
import { fileURLToPath } from "url";
import {
  initialize as dbInitialize,
  shutdown as dbShutdown,
} from "./server/db.js"; // Import named exports
import userRouter from "./server/routes/user-router.js";
import propertyRouter from "./server/routes/property-router.js";
import amenityRouter from "./server/routes/amenities-router.js";
import collectionRouter from "./server/routes/collection-router.js";
import filterRouter from "./server/routes/filters-router.js";
import experienceRouter from "./server/routes/experience-router.js";
import sectionRouter from "./server/routes/section-router.js";
import roomRouter from "./server/routes/room-router.js";
import pricingModelRouter from "./server/routes/pricingModel-router.js";
import destinationRouter from "./server/routes/destination-router.js";
import faqsRouter from "./server/routes/faqs-router.js";
import bookingRouter from "./server/routes/booking-router.js";
import settingRouter from "./server/routes/settings-router.js";
import seasonRouter from "./server/routes/season-routes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", filterRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1", propertyRouter);
app.use("/api/v1", amenityRouter);
app.use("/api/v1", collectionRouter);
app.use("/api/v1", experienceRouter);
app.use("/api/v1", sectionRouter);
app.use("/api/v1", roomRouter);
app.use("/api/v1", pricingModelRouter);
app.use("/api/v1", destinationRouter);
app.use("/api/v1", faqsRouter);
app.use("/api/v1", bookingRouter);
app.use("/api/v1", settingRouter);
app.use("/api/v1", seasonRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  try {
    console.log("Initializing database...");
    await dbInitialize(); // Initialize the database
    console.log("Database initialized.");

    const server = await promiseServer(app);
    console.log("Server initialized.");
    await promiseRun(server);
  } catch (error) {
    console.error("Error initializing server:", error);
  }
}

initialize();

// Ensure to handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log(
    "SIGTERM signal received: closing HTTP server and shutting down database..."
  );
  await dbShutdown(); // Close the database connection
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log(
    "SIGINT signal received: closing HTTP server and shutting down database..."
  );
  await dbShutdown(); // Close the database connection
  process.exit(0);
});
