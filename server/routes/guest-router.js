const express = require("express");
const config = require("../configs");
const {
  bundleDetails,
  bundlesList,
  saveBundlesList,
  purchaseEsimGo,
  saveBundlesCron,
} = require("../controller/guestController");
const {
  saveAiraloPackagesCron,
  fetchAiraloPackageUseage,
} = require("../controller/airaloController");
const {
  saveEsimVaultPackagesCron,
  fetchesimVaultPackageUseage,
} = require("../controller/esimVaultController");

const app = express();

//Get Esims list guest side
app.get("/esims-list", bundlesList);
app.get("/save-esims-list", saveBundlesList);

//Get Esim details guest side
app.get("/bundle-details", bundleDetails);

//purchase Esim
app.get("/purchase-esim", purchaseEsimGo);

//fetch Packages
app.get("/fetch-packages", async (req, res) => {
  try {
    await Promise.all([
      saveAiraloPackagesCron(),
      // saveBundlesCron(),
      // saveEsimVaultPackagesCron(),
    ]);
    res.status(200).send("Packages fetched and saved successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching packages.");
  }
});

//fetch datauseage
app.get("/fetch-datauseage", async (req, res) => {
  try {
    await Promise.all([
      fetchAiraloPackageUseage(),
      fetchesimVaultPackageUseage(),
    ]);
    res.status(200).send("datauseage fetched and saved successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching packages.");
  }
});

module.exports = app;
