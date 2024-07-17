const mongoose = require("mongoose");
const packageSchema = require("../models/packagesSchema");

// console.log("Database URL:", 'mongodb+srv://mursaleenumer:LOrV68FosnW9r63y@cluster0.rhjn8nu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

async function updateCollection() {
  try {
    await mongoose.connect(
      "mongodb+srv://zeshanbutt9128:6MpiQzDUNSL2cz4H@gleesim.fu3f5or.mongodb.net/?retryWrites=true&w=majority&appName=gleesim",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    await packageSchema.updateMany({}, { $set: { is_active: true } });

    console.log("Collection updated successfully.");
  } catch (error) {
    console.error("Error updating collection:", error);
  } finally {
    mongoose.disconnect();
  }
}

updateCollection();
