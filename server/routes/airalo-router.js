const express = require("express");

const {
  getAiraloToken,
  getAiraloSims,
  getAiraloPackages,
  getAiraloSimsDetails,
  saveAiraloPackages,
  getAiraloTopupList,
  airaloTopupOrder,
  getTopups,
} = require("../controller/airaloController");
const {
  checkAuthenticationToken,
} = require("../middlewares/checkAuthenticationToken");
const { checkAuthMiddleware } = require("../middlewares");

const app = express();

app.post("/token", getAiraloToken);
app.get("/sims", checkAuthenticationToken, getAiraloSims);
app.get(
  "/sim-details/:sim_iccid",
  checkAuthenticationToken,
  getAiraloSimsDetails
);
app.get("/packages", checkAuthenticationToken, getAiraloPackages);
app.get("/save-packages", checkAuthenticationToken, saveAiraloPackages);
app.get("/get-topup-packages", getAiraloTopupList);
app.post("/submit-topup-order", airaloTopupOrder);
app.get("/get-topups", checkAuthMiddleware, getTopups);

module.exports = app;
