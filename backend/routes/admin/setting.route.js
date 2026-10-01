//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

const AdminMiddleware = require("../../middleware/admin.middleware");

//controller
const settingController = require("../../controllers/admin/setting.controller");

//update Setting
route.patch("/updateSetting", checkAccessWithSecretKey(), AdminMiddleware, settingController.updateSetting);

//get setting data
route.get("/getSetting", checkAccessWithSecretKey(), AdminMiddleware, settingController.getSetting);

//handle setting switch
route.patch("/handleSwitch", checkAccessWithSecretKey(), AdminMiddleware, settingController.handleSwitch);

//handle water mark setting
route.patch("/modifyWatermarkSetting", checkAccessWithSecretKey(), AdminMiddleware, settingController.modifyWatermarkSetting);

//handle advertisement setting switch
route.patch("/switchAdSetting", checkAccessWithSecretKey(), AdminMiddleware, settingController.switchAdSetting);

//handle update storage
route.patch("/switchStorageOption", checkAccessWithSecretKey(), AdminMiddleware, settingController.switchStorageOption);

//manage user profile picture collection
route.patch("/updateProfilePictureCollection", checkAccessWithSecretKey(), AdminMiddleware, settingController.updateProfilePictureCollection);

//fetch selected fields of setting
route.get("/getLinks", settingController.getLinks);

module.exports = route;
