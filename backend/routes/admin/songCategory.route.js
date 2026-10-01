//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

const { checkPermission, MODULES } = require("../../middleware/checkPermission.middleware");

//controller
const songCategoryController = require("../../controllers/admin/songCategory.controller");

//create songCategory
route.post("/create", checkPermission(MODULES.SONG), checkAccessWithSecretKey(), songCategoryController.create);

//update songCategory
route.patch("/update", checkPermission(MODULES.SONG), checkAccessWithSecretKey(), songCategoryController.update);

//get all songCategory
route.get("/getSongCategory", checkPermission(MODULES.SONG), checkAccessWithSecretKey(), songCategoryController.getSongCategory);

//delete songCategory
route.delete("/deleteSongCategory", checkPermission(MODULES.SONG), checkAccessWithSecretKey(), songCategoryController.destroy);

module.exports = route;
