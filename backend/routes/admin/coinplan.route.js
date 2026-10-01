const express = require("express");
const route = express.Router();

//Controller
const coinplanController = require("../../controllers/admin/coinplan.controller");

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../checkAccess");

const { checkPermission, MODULES } = require("../../middleware/checkPermission.middleware");

//create coinplan
route.post("/store", checkPermission(MODULES.COIN_PLAN), checkAccessWithSecretKey(), coinplanController.store);

//update coinplan
route.patch("/update", checkPermission(MODULES.COIN_PLAN), checkAccessWithSecretKey(), coinplanController.update);

//handle isActive switch
route.patch("/handleSwitch", checkPermission(MODULES.COIN_PLAN), checkAccessWithSecretKey(), coinplanController.handleSwitch);

//delete coinplan
route.delete("/delete", checkPermission(MODULES.COIN_PLAN), checkAccessWithSecretKey(), coinplanController.delete);

//get coinplan
route.get("/get", checkPermission(MODULES.COIN_PLAN), checkAccessWithSecretKey(), coinplanController.get);

//get coinplan histories of users (admin earning)
route.get("/fetchUserCoinplanTransactions", checkAccessWithSecretKey(), coinplanController.fetchUserCoinplanTransactions);

//get coinplan user's histories (admin earning)
route.get("/:userId", checkAccessWithSecretKey(), coinplanController.fetchUserCoinPlanHistory);

module.exports = route;
