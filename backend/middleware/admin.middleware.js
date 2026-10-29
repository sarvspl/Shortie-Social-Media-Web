//JWT Token
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

//import model
const Admin = require("../models/admin.model");
const SubAdmin = require("../models/subAdmin.model");

module.exports = async (req, res, next) => {
  try {
    const Authorization = req.get("Authorization");

    if (!Authorization) {
      return res.status(401).json({ status: false, message: "Oops ! You are not authorized." });
    }

    const decodeToken = jwt.verify(Authorization, process.env.JWT_SECRET);

    if (!decodeToken || !decodeToken._id) {
      return res.status(401).json({ status: false, message: "Invalid token. Authorization failed." });
    }

    if (decodeToken.type === "admin") {
      let admin = null;
      if (mongoose.connection.readyState === 1) {
        try {
          admin = await Admin.findById(decodeToken._id);
        } catch (e) {
          console.warn("DB query in admin middleware failed:", e.message);
        }
      }
      if (!admin) {
        req.admin = {
          _id: decodeToken._id,
          name: decodeToken.name || "Admin",
          email: decodeToken.email || "admin@gmail.com",
          role: "admin",
          type: "admin",
        };
      } else {
        req.admin = admin;
      }
    } else if (decodeToken.type === "subAdmin") {
      let subAdmin = null;
      if (mongoose.connection.readyState === 1) {
        try {
          subAdmin = await SubAdmin.findById(decodeToken._id).populate("role", "name permissions");
        } catch (e) {
          console.warn("DB query in admin middleware for subAdmin failed:", e.message);
        }
      }
      if (!subAdmin) {
        req.subAdmin = {
          _id: decodeToken._id,
          name: decodeToken.name || "SubAdmin",
          email: decodeToken.email || "",
          role: decodeToken.role || "subAdmin",
          permissions: decodeToken.permissions || [],
          type: "subAdmin",
        };
      } else {
        req.subAdmin = subAdmin;
      }
    }
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ status: false, message: "Token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ status: false, message: "Invalid token" });
    }

    return res.status(500).json({ status: false, message: error.message });
  }
};
