//mongoose
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MongoDb_Connection_String, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("Mongo: successfully connected to db");
  })
  .catch((err) => {
    console.error("MongoDB Atlas connection error:", err.message);
  });

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB connection disconnected. Attempting to reconnect...");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB connection reconnected successfully.");
});

const db = mongoose.connection;

module.exports = db;

