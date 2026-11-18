const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");
const agoraController = require("../../controllers/client/agora.controller");

// Get Agora token for channel and user
route.get("/getToken", checkAccessWithSecretKey(), agoraController.getAgoraToken);
route.post("/getToken", checkAccessWithSecretKey(), agoraController.getAgoraToken);

module.exports = route;

