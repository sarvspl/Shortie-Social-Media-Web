//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const bannerController = require("../../controllers/admin/banner.controller");

const { checkPermission, MODULES } = require("../../middleware/checkPermission.middleware");

//get banner
route.get("/getBanner", checkPermission(MODULES.BANNER), checkAccessWithSecretKey(), bannerController.getBanner);

//banner create
route.post("/createBanner", checkPermission(MODULES.BANNER), checkAccessWithSecretKey(), bannerController.createBanner);

//banner update
route.patch("/updateBanner", checkPermission(MODULES.BANNER), checkAccessWithSecretKey(), bannerController.updateBanner);

//delete banner
route.delete("/deleteBanner", checkPermission(MODULES.BANNER), checkAccessWithSecretKey(), bannerController.deleteBanner);

//banner is active or not
route.patch("/isActive", checkPermission(MODULES.BANNER), checkAccessWithSecretKey(), bannerController.isActive);

module.exports = route;
