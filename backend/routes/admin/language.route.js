//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

const { checkPermission, MODULES } = require("../../middleware/checkPermission.middleware");

//controller
const languageController = require("../../controllers/admin/language.controller");

// create Language
route.post("/createLanguage", checkPermission(MODULES.LANGUAGE), checkAccessWithSecretKey(), languageController.createLanguage);

// get all languages
route.get("/getAllLanguages", checkPermission(MODULES.LANGUAGE), checkAccessWithSecretKey(), languageController.getAllLanguages);

// get single Lnaguage
route.get("/getLanguage", checkPermission(MODULES.LANGUAGE), checkAccessWithSecretKey(), languageController.getLanguage);

// update Language
route.patch("/updateLanguage", checkPermission(MODULES.LANGUAGE), checkAccessWithSecretKey(), languageController.updateLanguage);

// toggle isActive and isDefault switch
route.patch("/toggleSwitch", checkPermission(MODULES.LANGUAGE), checkAccessWithSecretKey(), languageController.toggleSwitch);

// delete Language and its Translations
route.delete("/deleteLanguage", checkPermission(MODULES.LANGUAGE), checkAccessWithSecretKey(), languageController.deleteLanguage);

module.exports = route;
