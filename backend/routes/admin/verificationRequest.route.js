//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

const { checkPermission, MODULES } = require("../../middleware/checkPermission.middleware");

//controller
const verificationRequestController = require("../../controllers/admin/verificationRequest.controller");

//verificationRequest accept by the admin
route.patch("/verificationRequestAccept", checkPermission(MODULES.VERIFICATION_REQUEST), checkAccessWithSecretKey(), verificationRequestController.verificationRequestAccept);

//verificationRequest decline by the admin
route.patch("/verificationRequestDecline", checkPermission(MODULES.VERIFICATION_REQUEST), checkAccessWithSecretKey(), verificationRequestController.verificationRequestDecline);

//get all verificationRequest
route.get("/getAll", checkPermission(MODULES.VERIFICATION_REQUEST), checkAccessWithSecretKey(), verificationRequestController.getAll);

module.exports = route;
