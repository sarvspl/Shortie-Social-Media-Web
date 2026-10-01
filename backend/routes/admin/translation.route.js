const express = require("express");
const multer = require("multer");

const localizationController = require("../../controllers/admin/translation.controller");
const checkAccessWithSecretKey = require("../../checkAccess");
const { checkPermission, MODULES } = require("../../middleware/checkPermission.middleware");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// create Translations for languages using CSV file
router.post(
  "/uploadTranslations",
  checkPermission(MODULES.LANGUAGE),
  checkAccessWithSecretKey(),
  upload.single("file"),
  localizationController.uploadTranslations
);

// update specific key-value pairs for a language
router.patch(
  "/updateLanguageTranslations",
  checkPermission(MODULES.LANGUAGE),
  checkAccessWithSecretKey(),
  localizationController.updateLanguageTranslations
);

// download all translations as CSV file
router.get(
  "/downloadTranslationsCSV",
  checkPermission(MODULES.LANGUAGE),
  checkAccessWithSecretKey(),
  localizationController.downloadTranslationsCSV
);

// get single Language's translations
router.get(
  "/getLanguageTranslations",
  checkPermission(MODULES.LANGUAGE),
  checkAccessWithSecretKey(),
  localizationController.getLanguage
);

module.exports = router;
