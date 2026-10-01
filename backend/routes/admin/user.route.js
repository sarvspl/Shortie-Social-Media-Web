//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

const { checkPermission, MODULES } = require("../../middleware/checkPermission.middleware");

//controller
const UserController = require("../../controllers/admin/user.controller");

//create user
route.post("/fakeUser", checkPermission(MODULES.USER), checkAccessWithSecretKey(), UserController.fakeUser);

//update profile of the user
route.patch("/updateUser", checkPermission(MODULES.USER), checkAccessWithSecretKey(), UserController.updateUser);

//get users (who is added by admin or real)
route.get("/getUsers", checkPermission(MODULES.USER), checkAccessWithSecretKey(), UserController.getUsers);

//handle block of the users (multiple or single)
route.patch("/isBlock", checkPermission(MODULES.USER), checkAccessWithSecretKey(), UserController.isBlock);

//delete the users (multiple or single)
route.delete("/deleteUsers", checkPermission(MODULES.USER), checkAccessWithSecretKey(), UserController.deleteUsers);

//get user profile
route.get("/getProfile", checkPermission(MODULES.USER), checkAccessWithSecretKey(), UserController.getProfile);

//add or deduct user coin
route.patch("/manageUserCoin", checkPermission(MODULES.USER), checkAccessWithSecretKey(), UserController.manageUserCoin);

module.exports = route;
