//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

const { checkPermission, MODULES } = require("../../middleware/checkPermission.middleware");

//controller
const VideoController = require("../../controllers/admin/video.controller");

//upload fake video
route.post("/uploadfakevideo", checkPermission(MODULES.VIDEOS), checkAccessWithSecretKey(), VideoController.uploadfakevideo);

//update fake video
route.patch("/updatefakevideo", checkPermission(MODULES.VIDEOS), checkAccessWithSecretKey(), VideoController.updatefakevideo);

//get real or fake videos
route.get("/getVideos", checkPermission(MODULES.VIDEOS), checkAccessWithSecretKey(), VideoController.getVideos);

//get particular user's videos
route.get("/getVideosOfUser", checkPermission(MODULES.VIDEOS), checkAccessWithSecretKey(), VideoController.getVideosOfUser);

//get particular video details
route.get("/getDetailOfVideo", checkPermission(MODULES.VIDEOS), checkAccessWithSecretKey(), VideoController.getDetailOfVideo);

//delete video
route.delete("/deleteVideo", checkPermission(MODULES.VIDEOS), checkAccessWithSecretKey(), VideoController.deleteVideo);

module.exports = route;
