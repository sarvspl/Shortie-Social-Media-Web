//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

const { checkPermission, MODULES } = require("../../middleware/checkPermission.middleware");

//controller
const reactionController = require("../../controllers/admin/reaction.controller");

//create reaction
route.post("/addReaction", checkPermission(MODULES.REACTION), checkAccessWithSecretKey(), reactionController.addReaction);

//update reaction
route.patch("/modifyReaction", checkPermission(MODULES.REACTION), checkAccessWithSecretKey(), reactionController.modifyReaction);

//reaction is active or not
route.patch("/hasActiveReaction", checkPermission(MODULES.REACTION), checkAccessWithSecretKey(), reactionController.hasActiveReaction);

//get reaction
route.get("/fetchReaction", checkPermission(MODULES.REACTION), checkAccessWithSecretKey(), reactionController.fetchReaction);

//delete reaction
route.delete("/removeReaction", checkPermission(MODULES.REACTION), checkAccessWithSecretKey(), reactionController.removeReaction);

module.exports = route;
