const express = require("express");
const router = express.Router();

const subAdminCtrl = require("../../controllers/admin/subAdmin.controller");
const AdminMiddleware = require("../../middleware/admin.middleware");

const checkAccessWithSecretKey = require("../../checkAccess");
router.use(checkAccessWithSecretKey());

/**
 * adminOnly — rejects any request from a staff (sub-admin) member.
 * Role & Staff management must be restricted to the super-admin only
 * to prevent privilege escalation attacks.
 */
const adminOnly = (req, res, next) => {
  if (req.admin) return next();
  return res.status(403).json({
    status: false,
    message: "Access denied. Only the super-admin can manage roles.",
  });
};

// Create sub admin
router.post("/registerSubAdminAccount", AdminMiddleware, adminOnly, subAdminCtrl.registerSubAdminAccount);

// Update Sub Admin
router.patch("/modifySubAdminProfile", AdminMiddleware, adminOnly, subAdminCtrl.modifySubAdminProfile);

// Toggle Sub Admin Active Status
router.patch("/switchSubAdminAccess", AdminMiddleware, adminOnly, subAdminCtrl.switchSubAdminAccess);

// Delete Sub Admin
router.delete("/revokeSubAdminAccount", AdminMiddleware, adminOnly, subAdminCtrl.revokeSubAdminAccount);

// Get All Sub Admin
router.get("/fetchSubAdminDirectory", AdminMiddleware, adminOnly, subAdminCtrl.fetchSubAdminDirectory);

// Login Sub Admin
router.post("/authenticateSubAdminAccount", subAdminCtrl.authenticateSubAdminAccount);

module.exports = router;
