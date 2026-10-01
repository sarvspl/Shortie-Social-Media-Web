//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

const { checkPermission, MODULES } = require("../../middleware/checkPermission.middleware");

//controller
const StoryController = require("../../controllers/admin/story.controller");

// Upload Fake Story
route.post("/uploadFakeStory", checkPermission(MODULES.STORY), checkAccessWithSecretKey(), StoryController.uploadFakeStory);

// Update Fake Story
route.patch("/updateFakeStory", checkPermission(MODULES.STORY), checkAccessWithSecretKey(), StoryController.updateFakeStory);

// Get all stories
route.get("/getAllStories", checkPermission(MODULES.STORY), checkAccessWithSecretKey(), StoryController.getAllStories);

// Delete Story
route.delete("/removeStory", checkPermission(MODULES.STORY), checkAccessWithSecretKey(), StoryController.removeStory);

module.exports = route;
