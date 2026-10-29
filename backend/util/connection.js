//dns setup for Atlas SRV resolution
const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {}

//mongoose
const mongoose = require("mongoose");


const directUri = "mongodb://rounak_db_user:B2Uo94L0o9cQRbqG@ac-jzzfz71-shard-00-00.jsobsaj.mongodb.net:27017,ac-jzzfz71-shard-00-01.jsobsaj.mongodb.net:27017,ac-jzzfz71-shard-00-02.jsobsaj.mongodb.net:27017/shortie?ssl=true&replicaSet=atlas-3upddw-shard-0&authSource=admin&retryWrites=true&w=majority";

const connectionOptions = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 25,
  minPoolSize: 2,
  heartbeatFrequencyMS: 10000,
};

let isConnecting = false;

async function connectDb() {
  if (isConnecting || mongoose.connection.readyState === 1) return;
  isConnecting = true;

  const uri = process.env.MongoDb_Connection_String || directUri;

  try {
    await mongoose.connect(uri, connectionOptions);
    console.log("Mongo: successfully connected to db");
  } catch (err) {
    console.error("MongoDB Atlas connection error:", err.message);
    if (uri !== directUri) {
      console.warn("Attempting fallback to direct replicaSet URI...");
      try {
        await mongoose.connect(directUri, connectionOptions);
        console.log("Mongo: successfully connected to db via direct replicaSet");
        isConnecting = false;
        return;
      } catch (fallbackErr) {
        console.error("Direct connection fallback error:", fallbackErr.message);
      }
    }
    // Schedule a retry
    setTimeout(() => {
      isConnecting = false;
      connectDb();
    }, 5000);
  } finally {
    isConnecting = false;
  }
}

connectDb();

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB connection disconnected. Attempting to reconnect in 3s...");
  setTimeout(connectDb, 3000);
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB connection reconnected successfully.");
});

const db = mongoose.connection;

module.exports = db;
