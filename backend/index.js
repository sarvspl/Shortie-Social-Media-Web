//express
const express = require("express");
const app = express();

//cors
const cors = require("cors");

app.set("trust proxy", true);

app.use(cors());
app.use(express.json());

//logging middleware
const logger = require("morgan");
app.use(logger("dev"));

//path
const path = require("path");

//fs
const fs = require("fs");

//dotenv
require("dotenv").config({ path: ".env" });

//import model
const Setting = require("./models/setting.model");

//Declare global variable
global.settingJSON = {};

//handle global.settingJSON when pm2 restart
async function initializeSettings() {
  try {
    const setting = await Setting.findOne().sort({ createdAt: -1 });
    if (setting) {
      global.settingJSON = setting.toObject();
      // console.log("✅ Settings loaded:", global.settingJSON._id);
    } else {
      global.settingJSON = require("./setting");
      console.warn("⚠️ No DB settings found. Using fallback.");
    }
  } catch (err) {
    console.error("❌ Failed to initialize settings:", err);
  }
}

module.exports = app;

//Declare the function as a global variable to update the setting.js file
global.updateSettingFile = (settingData) => {
  const settingJSON = JSON.stringify(settingData, null, 2);
  fs.writeFileSync("setting.js", `module.exports = ${settingJSON};`, "utf8");

  global.settingJSON = settingData;
  console.log("Settings file updated.");
};

const db = require("./util/connection");

const routes = require("./routes/route");
app.use(routes);

db.on("error", () => {
  console.log("Connection Error: ");
});

db.once("open", async () => {
  console.log("Mongo: successfully connected to db");
  await initializeSettings();
});

//socket io
const http = require("http");
const server = http.createServer(app);
global.io = require("socket.io")(server);

//socket.js
require("./socket");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/.well-known/assetlinks.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  return res.status(200).json(global?.settingJSON?.androidAssetLinks || []);
});

app.get("/.well-known/apple-app-site-association", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  return res.status(200).json(global?.settingJSON?.appleAppSiteAssociation || {});
});

//set port and listen the request
server.listen(process?.env.PORT, () => {
  console.log("Hello World ! listening on " + process?.env?.PORT);
});

//node-cron
const cron = require("node-cron");

const { cleanOrphanedStoryMedia } = require("./util/cleanOrphanedStoryMedia");

cron.schedule("0 0 * * *", async () => {
  console.log(`[CRON] cleanOrphanedStoryMedia started`);

  try {
    await cleanOrphanedStoryMedia();

    console.log(`[CRON] cleanOrphanedStoryMedia completed`);
  } catch (error) {
    console.error(`[CRON] cleanOrphanedStoryMedia failed`, error);
  }
});