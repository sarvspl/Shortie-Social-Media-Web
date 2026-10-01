//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

const { checkPermission, MODULES } = require("../../middleware/checkPermission.middleware");

//controller
const PostController = require("../../controllers/admin/post.controller");

//upload fake post
route.post("/uploadfakePost", checkPermission(MODULES.POST), checkAccessWithSecretKey(), PostController.uploadfakePost);

//update fake post
route.patch("/updatefakePost", checkPermission(MODULES.POST), checkAccessWithSecretKey(), PostController.updatefakePost);

//get real or fake posts
route.get("/getPosts", checkPermission(MODULES.POST), checkAccessWithSecretKey(), PostController.getPosts);

//get particular user's posts
route.get("/getUserPost", checkPermission(MODULES.POST), checkAccessWithSecretKey(), PostController.getUserPost);

//get particular post details
route.get("/getDetailOfPost", checkPermission(MODULES.POST), checkAccessWithSecretKey(), PostController.getDetailOfPost);

//delete post
route.delete("/deletePost", checkPermission(MODULES.POST), checkAccessWithSecretKey(), PostController.deletePost);

module.exports = route;
