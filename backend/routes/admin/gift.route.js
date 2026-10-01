//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

const { checkPermission, MODULES } = require("../../middleware/checkPermission.middleware");

//controller
const GiftController = require("../../controllers/admin/gift.controller");

//create gift
route.post("/createGift", checkPermission(MODULES.GIFT), checkAccessWithSecretKey(), GiftController.createGift);

//update gift
route.patch("/updateGift", checkPermission(MODULES.GIFT), checkAccessWithSecretKey(), GiftController.updateGift);

//get gift
route.get("/getGifts", checkPermission(MODULES.GIFT), checkAccessWithSecretKey(), GiftController.getGifts);

//delete gift
route.delete("/deleteGift", checkPermission(MODULES.GIFT), checkAccessWithSecretKey(), GiftController.deleteGift);

module.exports = route;
