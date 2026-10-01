//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

const { checkPermission, MODULES } = require("../../middleware/checkPermission.middleware");

//controller
const LivevideoController = require("../../controllers/admin/livevideo.controller");

//upload fake video
route.post("/uploadLivevideo", checkPermission(MODULES.LIVE_VIDEO), checkAccessWithSecretKey(), LivevideoController.uploadLivevideo);

//update fake video
route.patch("/updateLivevideo", checkPermission(MODULES.LIVE_VIDEO), checkAccessWithSecretKey(), LivevideoController.updateLivevideo);

//get live videos
route.get("/getVideos", checkPermission(MODULES.LIVE_VIDEO), checkAccessWithSecretKey(), LivevideoController.getVideos);

//delete video
route.delete("/deleteVideo", checkPermission(MODULES.LIVE_VIDEO), checkAccessWithSecretKey(), LivevideoController.deleteVideo);

//video live or not
route.patch("/isLive", checkPermission(MODULES.LIVE_VIDEO), checkAccessWithSecretKey(), LivevideoController.isLive);

module.exports = route;
