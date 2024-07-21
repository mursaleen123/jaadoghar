import mongoose from 'mongoose';
import config from './configs/index.js';

let db = null;

export const initialize = async () => {
  return new Promise((resolve, reject) => {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    mongoose.connect(config.databaseUrl, options);
    db = mongoose.connection;
    console.log('db initialize');
    db.on("error", reject);
    db.once("open", () => {
      resolve();
    });
  });
};

export const shutdown = async () => {
  if (db) {
    await db.close().then(() => {
      db = null;
    });
  }
};

export { db };
