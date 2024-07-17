const mongoose = require("mongoose");
const config = require("./configs");
module.exports.db = null;
module.exports.initialize = async () => {
  return new Promise((resolve, reject) => {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    mongoose.connect(config.databaseUrl, options);
    module.exports.db = mongoose.connection;
    console.log('db initialize')
    module.exports.db.on("error", reject);
    module.exports.db.once("open", () => {
      resolve();
    });
  });
};

module.exports.shutdown = async () => {
  if (module.exports.db) {
    await module.exports.db.close().then(() => {
      module.exports.db = null;
    });
  }
};
