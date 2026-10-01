//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

const { checkPermission, MODULES } = require("../../middleware/checkPermission.middleware");

//controller
const songController = require("../../controllers/admin/song.coontroller");

//create songList
route.post("/createSong", checkPermission(MODULES.SONG), checkAccessWithSecretKey(), songController.createSong);

//update songList
route.patch("/updateSong", checkPermission(MODULES.SONG), checkAccessWithSecretKey(), songController.updateSong);

//get all song
route.get("/getSongs", checkPermission(MODULES.SONG), checkAccessWithSecretKey(), songController.getSongs);

//delete song
route.delete("/deletesong", checkPermission(MODULES.SONG), checkAccessWithSecretKey(), songController.deletesong);

module.exports = route;
