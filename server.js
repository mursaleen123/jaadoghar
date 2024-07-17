const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const i18next = require("i18next");
const i18nextMiddleware = require("i18next-http-middleware");
const Backend = require("i18next-fs-backend");
const cors = require("cors");
const config = require("./server/configs/index.js");
const guestRouter = require("./server/routes/guest-router.js");
const airaloRouter = require("./server/routes/airalo-router.js");
const stripeRoute = require("./server/routes/stripe-route.js");
const userRouter = require("./server/routes/user-router.js");
const path = require("path");
const db = require("./server/db.js");
const { default: Stripe } = require("stripe");
const {
  sessionEndedSuccessfully,
  topupEndedSuccessfully,
} = require("./server/controller/stripe-controller.js");
const { staticFileMiddleware } = require("./server/middlewares.js");
const app = express();
require("dotenv").config();

app.use(cors());

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(__dirname, "locales", "{{lng}}", "translation.json"),
    },
    fallbackLng: "en",
    preload: ["en", "ar", "fr", "in"],
    saveMissing: true,
    detection: {
      order: ["querystring", "cookie"],
      caches: false,
    },
  });

const conditionalMiddleware = (req, res, next) => {
  if (req.originalUrl === "/api/webhook") {
    next();
  } else {
    express.json()(req, res, () => {
      express.urlencoded({ extended: true })(req, res, next);
    });
  }
};

app.use(conditionalMiddleware);

app.use("/api/v1", guestRouter);
app.use("/api/v1", airaloRouter);
app.use("/api/v1", stripeRoute);
app.use("/api/v1", userRouter);

// app.use('/public', staticFileMiddleware);
app.use("/public", express.static(path.join(__dirname, "./public")));

const stripe = require("stripe")(config.stripe_secret_key);
const endpointSecret = config.webhook_secret_key;
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event;
    const signature = req.headers["stripe-signature"];
    const rawBody = req.body;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        endpointSecret
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    let subscription;
    let status;
    switch (event.type) {
      case "checkout.session.completed":
        subscription = event.data.object;

        if (subscription.metadata.event === "simPurchase") {
          await sessionEndedSuccessfully(subscription, res);
        } else if (subscription.metadata.event === "topup") {
          await topupEndedSuccessfully(subscription, res);
        }
        break;
      default:
    }

    res.status(200).end();
  }
);

//esimgo Callback URL
const crypto = require("crypto");
const {
  fetchEsimgoPackageUseage,
} = require("./server/controller/airaloController.js");
app.post(
  "/api/esimgo_callback",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = crypto
      .createHmac("sha256", config.esim_key)
      .update(body)
      .digest("base64");
    const matches = signature === signatureHeader;
    await fetchEsimgoPackageUseage(matches);
    try {
      const matches = signature === signatureHeader;
      console.log(matches);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    let subscription;
    let status;

    res.status(200).end();
  }
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
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
