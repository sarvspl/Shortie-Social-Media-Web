//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

const { checkPermission, MODULES } = require("../../middleware/checkPermission.middleware");

//controller
const HashTagController = require("../../controllers/admin/hashTag.controller");

//create hashTag
route.post("/create", checkPermission(MODULES.HASHTAG), checkAccessWithSecretKey(), HashTagController.create);

//update hashTag
route.patch("/update", checkPermission(MODULES.HASHTAG), checkAccessWithSecretKey(), HashTagController.update);

//get hashTag
route.get("/getbyadmin", checkPermission(MODULES.HASHTAG), checkAccessWithSecretKey(), HashTagController.getbyadmin);

//delete hashTag
route.delete("/delete", checkPermission(MODULES.HASHTAG), checkAccessWithSecretKey(), HashTagController.delete);

//get all hashTag for deopdown
route.get("/getHashtag", checkAccessWithSecretKey(), HashTagController.getHashtag);

module.exports = route;
