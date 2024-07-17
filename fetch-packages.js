const cron = require("node-cron");
const mongoose = require("mongoose");
const {
  saveAiraloPackagesCron,
} = require("./server/controller/airaloController");
const { saveBundlesCron } = require("./server/controller/guestController");
const { config, databaseUrl } = require("./server/configs");
const CronLogs = require("./server/models/cron_Logs");
const {
  saveEsimVaultPackagesCron,
} = require("./server/controller/esimVaultController");

mongoose.connect(databaseUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

const job = cron.schedule(
  "*/* * * * * *",
  async () => {
    const cronLog = new CronLogs({ status: "running", event: "packages" });

    try {
      await cronLog.save();
      console.log("Cron job started.");

      await Promise.all([
        // saveAiraloPackagesCron(),
        saveBundlesCron(),
        // saveEsimVaultPackagesCron(),
      ]);

      cronLog.status = "completed";
      await cronLog.save();
      console.log("Cron job completed.");
    } catch (error) {
      cronLog.status = "failed";
      cronLog.reason = error;
      await cronLog.save();
      console.error("Error occurred during cron job:", error);
    }
  },
  {
    scheduled: false,
  }
);

job.start();
