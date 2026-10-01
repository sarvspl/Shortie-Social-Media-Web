const express = require("express");
const translationController = require("../../controllers/client/translation.controller");
const checkAccessWithSecretKey = require("../../checkAccess");

const router = express.Router();

router.use(checkAccessWithSecretKey());

// get single Language's translations
router.get("/getLanguageTranslations", translationController.getLanguage);

// get all Languages and their translations
router.get("/getAllLanguagesTranslation", translationController.getAllLanguages);

// get latest version of global Language system
router.get("/version/latest", translationController.getLatestVersion);

// get all active Languages
router.get("/getActiveLanguage", translationController.getActiveLanguage);

module.exports = router;