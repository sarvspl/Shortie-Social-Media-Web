const admin = require("../util/privateKey");
const User = require("../models/user.model");
const History = require("../models/history.model");

const validateFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: false, message: "Authorization token required" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const signInProvider = decodedToken.firebase?.sign_in_provider;

    if (!decodedToken || (!decodedToken.email && signInProvider !== "anonymous")) {
      return res.status(401).json({ status: false, message: "Invalid token. Authorization failed." });
    }

    let userQuery;
    const { loginType, email, mobileNumber } = req.body;

    if (loginType === 1) {
      if (!mobileNumber) {
        return res.status(200).json({ status: false, message: "mobileNumber is required." });
      }
      userQuery = await User.findOne({ mobileNumber: mobileNumber.trim() });
    } else if (loginType === 2) {
      if (!email) {
        return res.status(200).json({ status: false, message: "email is required." });
      }
      userQuery = await User.findOne({ email: email.trim() });
    } else {
      return res.status(200).json({ status: false, message: "Invalid loginType provided." });
    }

    // Create new user if not found
    if (!userQuery) {
      console.log("User not found. Creating new user...");

      const uniqueId = generateHistoryUniqueId();
      const bonusCoins = settingJSON.loginBonus ? settingJSON.loginBonus : 5000;

      const newUser = new User({
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        coin: bonusCoins,
        uid: decodedToken.uid,
        email: email?.trim() || null,
        mobileNumber: mobileNumber?.trim() || null,
      });

      userQuery = newUser;

      await History.create({
        otherUserId: newUser._id,
        coin: bonusCoins,
        uniqueId: uniqueId,
        type: 5,
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      });

      if (newUser.fcmToken) {
        const adminPromise = await admin;

        const payload = {
          token: newUser.fcmToken,
          notification: {
            title: "🎁 Welcome Bonus! 🎁",
            body: "✨ Congratulations! You have received a login bonus. Thank you for joining us.",
          },
          data: {
            type: "LOGINBONUS",
          },
        };

        adminPromise
          .messaging()
          .send(payload)
          .then((response) => {
            console.log("Successfully sent with response: ", response);
          })
          .catch((error) => {
            console.log("Error sending message: ", error);
          });
      }
    }

    req.user = userQuery;
    next();
  } catch (error) {
    console.error("Token verification error:", error);

    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({ status: false, message: "Token expired. Please reauthenticate." });
    }

    return res.status(401).json({ status: false, message: "Invalid token. Authorization failed." });
  }
};

module.exports = validateFirebaseToken;
