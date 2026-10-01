const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

const { checkPermission, MODULES } = require("../../middleware/checkPermission.middleware");

const reportController = require("../../controllers/admin/report.controller");

//get type wise all reports
route.get("/getReports", checkPermission(MODULES.REPORT), checkAccessWithSecretKey(), reportController.getReports);

//report solved
route.patch("/solveReport", checkPermission(MODULES.REPORT), checkAccessWithSecretKey(), reportController.solveReport);

//delete report
route.delete("/deleteReport", checkPermission(MODULES.REPORT), checkAccessWithSecretKey(), reportController.deleteReport);

module.exports = route;
