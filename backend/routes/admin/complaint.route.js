//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

const { checkPermission, MODULES } = require("../../middleware/checkPermission.middleware");

//controller
const ComplaintController = require("../../controllers/admin/complaint.controller");

//get type wise all complaints
route.get("/getComplaints", checkPermission(MODULES.SUPPORT_REQUEST), checkAccessWithSecretKey(), ComplaintController.getComplaints);

//complaint solved
route.patch("/solveComplaint", checkPermission(MODULES.SUPPORT_REQUEST), checkAccessWithSecretKey(), ComplaintController.solveComplaint);

//delete complaint
route.delete("/deleteComplaint", checkPermission(MODULES.SUPPORT_REQUEST), checkAccessWithSecretKey(), ComplaintController.deleteComplaint);

module.exports = route;
