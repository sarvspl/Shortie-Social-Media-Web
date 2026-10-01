const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

const { checkPermission, MODULES } = require("../../middleware/checkPermission.middleware");

//controller
const WithdrawalRequestController = require("../../controllers/admin/withDrawRequest.controller");

//get all withdraw requests
route.get("/index", checkPermission(MODULES.ORDER_HISTORY), checkAccessWithSecretKey(), WithdrawalRequestController.index);

//accept withdraw request
route.patch("/accept", checkPermission(MODULES.ORDER_HISTORY), checkAccessWithSecretKey(), WithdrawalRequestController.acceptWithdrawalRequest);

//decline withdraw request
route.patch("/decline", checkPermission(MODULES.ORDER_HISTORY), checkAccessWithSecretKey(), WithdrawalRequestController.declineWithdrawalRequest);

module.exports = route;
