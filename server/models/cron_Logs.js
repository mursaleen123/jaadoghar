const mongoose = require("mongoose");

const cronLogs = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["running", "completed", "pending", "failed"],
      default: "pending",
      required: true,
    },
    reason: { type: String, required: false, default: "" },
    event: { type: String, required: false, default: "" },
    ended_at: { type: Date }, 
  },
  { timestamps: true }
);
cronLogs.pre('save', function(next) {
  if (this.status === 'completed' && !this.ended_at) {
    this.ended_at = new Date();
  }
  next();
});
const cron_Logs = mongoose.model("cronLogs", cronLogs, "cronLogs");
module.exports = cron_Logs;
