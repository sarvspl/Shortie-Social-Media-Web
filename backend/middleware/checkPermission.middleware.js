const MODULES = {
  USER: "User",
  VERIFICATION_REQUEST: "Verification Request",
  BANNER: "Banner",
  GIFT: "Gift",
  REACTION: "Reaction",
  HASHTAG: "Hashtag",
  SONG: "Song",
  POST: "Post",
  STORY: "Story",
  VIDEOS: "Videos",
  LIVE_VIDEO: "Live Video",
  COIN_PLAN: "Coin Plan",
  ORDER_HISTORY: "Order History",
  LANGUAGE: "Language",
  SUPPORT_REQUEST: "Support Request",
  REPORT: "Report",
};

/**
 * HTTP method → permission action(s).
 * PATCH/PUT can be stored as either "Edit" or "Update" in the DB,
 * so we check for either.
 */
const METHOD_TO_ACTIONS = {
  GET: ["List"],
  POST: ["Create"],
  PATCH: ["Edit", "Update"],
  PUT: ["Edit", "Update"],
  DELETE: ["Delete"],
};

/**
 * @param {string} module - One of the MODULES values (e.g. MODULES.POST)
 */
const checkPermission = (module) => {
  return (req, res, next) => {
    // ── 1. Super-admin bypass ──────────────────────────────────────────────
    if (req.admin) return next();

    // ── 2. Staff (sub-admin) gate ──────────────────────────────────────────
    if (req.subAdmin) {
      const permissions = req.subAdmin?.role?.permissions;

      if (!permissions || !Array.isArray(permissions)) {
        console.warn(`⚠️ [RBAC] Staff ${req.subAdmin._id} has no permissions array on their role.`);
        return res.status(403).json({
          status: false,
          message: "Access denied. No permissions configured for your role.",
        });
      }

      // a. Module check
      const modulePermission = permissions.find((p) => p.module === module);

      if (!modulePermission) {
        console.warn(`⚠️ [RBAC] Staff ${req.subAdmin._id} denied — module "${module}" not in role.`);
        return res.status(403).json({
          status: false,
          message: `Access denied. You do not have access to the "${module}" module.`,
        });
      }

      // b. Action check
      const requiredActions = METHOD_TO_ACTIONS[req.method] || [];
      const grantedActions = modulePermission.actions || [];

      const hasAction = requiredActions.some((action) => grantedActions.includes(action));

      if (!hasAction) {
        console.warn(
          `⚠️ [RBAC] Staff ${req.subAdmin._id} denied — action [${requiredActions.join(" or ")}] not permitted on module "${module}". Granted: [${grantedActions.join(", ")}]`
        );
        return res.status(403).json({
          status: false,
          message: `Access denied. You do not have permission to perform this action on the "${module}" module.`,
        });
      }

      // c. All good
      console.log(
        `✅ [RBAC] Staff ${req.subAdmin._id} — access granted for [${req.method}] on module "${module}".`
      );
      return next();
    }

    // ── 3. Neither admin nor staff (auth middleware mis-order) ─────────────
    console.warn("⚠️ [RBAC] Neither req.admin nor req.subAdmin is set. Possible middleware mis-order.");
    return res.status(401).json({
      status: false,
      message: "Unauthorized. Authentication required.",
    });
  };
};

module.exports = { checkPermission, MODULES };
