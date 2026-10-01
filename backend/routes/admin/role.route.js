const express = require("express");
const router = express.Router();

const roleCtrl = require("../../controllers/admin/role.controller");
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

// Create Role
router.post("/registerRole", AdminMiddleware, adminOnly, roleCtrl.registerRole);

// Update Role
router.patch("/modifyRole", AdminMiddleware, adminOnly, roleCtrl.modifyRole);

// Get All Roles
router.get("/listRoles", AdminMiddleware, adminOnly, roleCtrl.listRoles);

// Delete Role
router.delete("/removeRole", AdminMiddleware, adminOnly, roleCtrl.removeRole);

// Get All Roles ( When Create Staff )
router.get("/listAssignableRoles", AdminMiddleware, adminOnly, roleCtrl.listAssignableRoles);

// Toggle Role Active Status
router.patch("/changeRoleActivation", AdminMiddleware, adminOnly, roleCtrl.changeRoleActivation);

module.exports = router;
