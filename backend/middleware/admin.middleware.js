//JWT Token
const jwt = require("jsonwebtoken");

//import model
const Admin = require("../models/admin.model");
const SubAdmin = require("../models/subAdmin.model");

module.exports = async (req, res, next) => {
  try {
    const Authorization = req.get("Authorization");

    if (!Authorization) {
      return res.status(401).json({ status: false, message: "Oops ! You are not authorized." });
    }

    //console.log("Authorization in header:   ", Authorization);

    const decodeToken = jwt.verify(Authorization, process.env.JWT_SECRET);

    if (!decodeToken || !decodeToken._id) {
      return res.status(401).json({ status: false, message: "Invalid token. Authorization failed." });
    }

    if (decodeToken.type === "admin") {
      const admin = await Admin.findById(decodeToken._id);
      if (!admin) {
        return res.status(401).json({ status: false, message: "Admin not found. Authorization failed." });
      }
      req.admin = admin;
    } else if (decodeToken.type === "subAdmin") {
      const subAdmin = await SubAdmin.findById(decodeToken._id).populate("role", "name permissions");
      if (!subAdmin) {
        return res.status(401).json({ status: false, message: "Sub Admin not found. Authorization failed." });
      }
      req.subAdmin = subAdmin;
    }
    next();
  } catch (error) {
    //console.error("❌ JWT Verification Error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ status: false, message: "Token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ status: false, message: "Invalid token" });
    }

    return res.status(500).json({ status: false, message: error.message });
  }
};
