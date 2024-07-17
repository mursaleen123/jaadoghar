const cron = require("node-cron");
const mongoose = require("mongoose");
const {
  saveAiraloPackagesCron,
  fetchAiraloPackageUseage,
} = require("./server/controller/airaloController");
const { saveBundlesCron } = require("./server/controller/guestController");
const { config, databaseUrl } = require("./server/configs");
const CronLogs = require("./server/models/cron_Logs");
const {
  fetchesimVaultPackageUseage,
} = require("./server/controller/esimVaultController");
const { generateQrCode } = require("./server/helpers/generateQrCode");

mongoose.connect(databaseUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

const job = cron.schedule(
  "*/15 * * * *",
  async () => {
    const cronLog = new CronLogs({ status: "running", event: "useage" });

    try {
      await cronLog.save();
      console.log("Cron job started.");

      await Promise.all([
        fetchAiraloPackageUseage(),
        fetchesimVaultPackageUseage(),
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
