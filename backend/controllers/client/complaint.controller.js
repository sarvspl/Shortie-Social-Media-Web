const Complaint = require("../../models/complaint.model");

//import model
const User = require("../../models/user.model");

//deleteFromStorage
const { deleteFromStorage } = require("../../util/storageHelper");

//mongoose
const mongoose = require("mongoose");

//axios
const axios = require("axios");

//private key
const admin = require("../../util/privateKey");

//complaint or suggession by particular user
exports.complaintByUser = async (req, res) => {
  const image = req?.body?.image || "";

  try {
    if (!req.body.userId || !req.body.complaint || !req.body.contact) {
      if (image) {
        await deleteFromStorage(image);
      }

      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const { complaint, contact } = req.body;
    const userId = new mongoose.Types.ObjectId(req.body.userId);

    const user = await User.findById(userId).select("_id isBlock fcmToken").lean();

    if (!user) {
      if (image) {
        await deleteFromStorage(image);
      }

      return res.status(200).json({ status: false, message: "user does not found." });
    }

    if (user.isBlock) {
      if (image) {
        await deleteFromStorage(image);
      }

      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    const data = await Complaint.create({
      userId: user._id,
      complaint,
      contact,
      image,
      date: new Date().toLocaleString(),
    });

    res.status(200).json({
      status: true,
      message: "You've submitted a complaint.",
      data,
    });

    if (image && settingJSON.postBanned) {
      const checks = [];
      if (settingJSON.postBanned.includes("1")) checks.push("nudity-2.1");
      if (settingJSON.postBanned.includes("2")) checks.push("offensive");
      if (settingJSON.postBanned.includes("3")) checks.push("violence");
      if (settingJSON.postBanned.includes("4")) checks.push("gore-2.0");
      if (settingJSON.postBanned.includes("5")) checks.push("weapon");
      if (settingJSON.postBanned.includes("6")) checks.push("tobacco");
      if (settingJSON.postBanned.includes("7")) checks.push("recreational_drug,medical");
      if (settingJSON.postBanned.includes("8")) checks.push("gambling");
      if (settingJSON.postBanned.includes("9")) checks.push("alcohol");
      if (settingJSON.postBanned.includes("10")) checks.push("money");
      if (settingJSON.postBanned.includes("11")) checks.push("self-harm");

      console.log("Checks for complaint image moderation =====================================", checks);

      if (checks.length > 0) {
        try {
          const response = await axios.get("https://api.sightengine.com/1.0/check.json", {
            params: {
              url: image,
              models: checks.join(","),
              api_user: settingJSON?.sightengineUser,
              api_secret: settingJSON?.sightengineSecret,
            },
          });

          const result = response.data;
          console.log("Image moderation result for chat image: ", image, ":", result);

          let isBanned = false;

          for (const check of checks) {
            if (
              check === "nudity-2.1" &&
              (result.nudity?.sexual_activity > 0.7 ||
                result.nudity?.sexual_display > 0.7 ||
                result.nudity?.erotica > 0.7 ||
                result.nudity?.very_suggestive > 0.7 ||
                result.nudity?.suggestive > 0.7 ||
                result.nudity?.mildly_suggestive > 0.7)
            ) {
              isBanned = true;
            }

            if (check === "offensive" && result.offensive?.prob > 0.7) isBanned = true;
            if (check === "violence" && result.violence?.prob > 0.7) isBanned = true;
            if (check === "gore-2.0" && result.gore?.prob > 0.7) isBanned = true;
            if (check === "weapon" && result.weapon?.prob > 0.7) isBanned = true;
            if (check === "tobacco" && result.tobacco?.prob > 0.7) isBanned = true;
            if (check === "recreational_drug,medical" && result.drugs?.prob > 0.7) isBanned = true;
            if (check === "gambling" && result.gambling?.prob > 0.7) isBanned = true;
            if (check === "alcohol" && result.alcohol?.prob > 0.7) isBanned = true;
            if (check === "money" && result.money?.prob > 0.7) isBanned = true;
            if (check === "self-harm" && result.selfharm?.prob > 0.7) isBanned = true;
          }

          await Complaint.updateOne({ _id: data._id }, { isComplaintImageRestricted: isBanned });

          console.log(`Image ${image} isBanned for complaint image:: ${isBanned}`);

          if (user.fcmToken && isBanned) {
            const adminPromise = await admin;

            const payload = {
              token: user.fcmToken,
              notification: {
                title: "❌ Issue with Attached Image ❌",
                body: "The image you submitted with your feedback doesn’t meet our community standards. Please upload a suitable image to proceed. We appreciate your effort! 🌟💡",
              },
              data: {
                type: "COMPLAINT_SUGGESTION_IMAGE_BANNED",
              },
            };

            try {
              const response = await adminPromise.messaging().send(payload);
              console.log("Successfully sent notification: ", response);
            } catch (error) {
              console.error("Error sending notification: ", error);
            }
          }
        } catch (error) {
          console.log(`Error processing complaint image: ${image}:`, error.response?.data || error.message);
        }
      } else {
        console.log("No checks selected or no image URL provided.");
      }
    }
  } catch (error) {
    if (image) {
      await deleteFromStorage(image);
    }

    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
