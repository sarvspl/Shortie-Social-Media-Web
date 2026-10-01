const VerificationRequest = require("../../models/verificationRequest.model");

//import model
const User = require("../../models/user.model");

//private key
const admin = require("../../util/privateKey");

//verificationRequest accept by the admin
exports.verificationRequestAccept = async (req, res) => {
  try {
    if (!req.query.verificationRequestId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const verificationRequest = await VerificationRequest.findOne({ _id: req.query.verificationRequestId });
    if (!verificationRequest) {
      return res.status(200).json({ status: true, message: "verificationRequest does not found!" });
    }

    const user = await User.findById(verificationRequest.userId);
    if (!user) {
      return res.status(200).json({ status: false, message: "user dose not found." });
    }

    if (verificationRequest.isAccepted === true) {
      return res.status(200).json({ status: false, message: "VerificationRequest already has been accepted by the admin." });
    }

    if (verificationRequest.isRejected === true) {
      return res.status(200).json({ status: false, message: "VerificationRequest already has been rejected by the admin." });
    }

    verificationRequest.isAccepted = true;
    user.isVerified = true;

    await Promise.all([verificationRequest.save(), user.save()]);

    res.status(200).json({ status: true, message: "VerificationRequest has been accepted by the admin.", data: verificationRequest });

    //checks if the user has an fcmToken
    if (user.fcmToken && user.fcmToken !== null) {
      const adminPromise = await admin;

      const payload = {
        token: user.fcmToken,
        notification: {
          title: "✅ Verification Request Accepted! ✅",
          body: "Congratulations! Your verification request has been accepted. Thank you for verifying your account.",
        },
        data: {
          type: "VERIFICATIONREQUEST",
        },
      };

      adminPromise
        .messaging()
        .send(payload)
        .then((response) => {
          console.log("Successfully sent with response: ", response);
        })
        .catch((error) => {
          console.log("Error sending message:      ", error);
        });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//verificationRequest decline by the admin
exports.verificationRequestDecline = async (req, res) => {
  try {
    if (!req.query.verificationRequestId) {
      return res.status(200).json({ status: false, message: "verificationRequestId must be requried!" });
    }

    if (!req.body.reason) {
      return res.status(200).json({ status: false, message: "reason must be passed by the admin." });
    }

    const verificationRequest = await VerificationRequest.findOne({ _id: req.query.verificationRequestId });
    if (!verificationRequest) {
      return res.status(200).json({ status: true, message: "verificationRequest does not found!" });
    }

    if (verificationRequest.isAccepted === true) {
      return res.status(200).json({ status: false, message: "VerificationRequest already has been accepted by the admin." });
    }

    if (verificationRequest.isRejected === true) {
      return res.status(200).json({ status: false, message: "VerificationRequest already has been rejected by the admin." });
    }

    verificationRequest.isRejected = true;
    verificationRequest.reason = req.body.reason?.trim();
    await verificationRequest.save();

    res.status(200).json({ status: true, message: "verificationRequest has been declined by the admin!", data: verificationRequest });

    const user = await User.findById(verificationRequest?.userId);

    //checks if the user has an fcmToken
    if (user.fcmToken && user.fcmToken !== null) {
      const adminPromise = await admin;

      const payload = {
        token: user.fcmToken,
        notification: {
          title: "❌ Verification Request Declined! ❌",
          body: "We're sorry, but your verification request has been declined. Please contact support for more information.",
        },
        data: {
          type: "VERIFICATIONREQUEST",
        },
      };

      adminPromise
        .messaging()
        .send(payload)
        .then((response) => {
          console.log("Successfully sent with response: ", response);
        })
        .catch((error) => {
          console.log("Error sending message:      ", error);
        });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//get all verificationRequest
exports.getAll = async (req, res) => {
  try {
    const { type, search, start, limit } = req.query;

    if (!type) {
      return res.status(200).json({ status: false, message: "type must be passed valid." });
    }

    const page = start ? parseInt(start) : 1;
    const pageSize = limit ? parseInt(limit) : 20;

    let filter = {};
    if (type === "pending") filter = { isAccepted: false, isRejected: false };
    else if (type === "accepted") filter = { isAccepted: true, isRejected: false };
    else if (type === "declined") filter = { isAccepted: false, isRejected: true };
    else return res.status(200).json({ status: false, message: "type must be passed valid." });

    const matchStage = { $match: filter };

    const pipeline = [
      matchStage,
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 1, name: 1, userName: 1, uniqueId: 1, image: 1 } }],
          as: "user",
        },
      },
      { $unwind: "$user" },

      ...(search
        ? [
          {
            $match: {
              $or: [
                { "user.name": { $regex: search, $options: "i" } },
                { "user.userName": { $regex: search, $options: "i" } },
                { "user.uniqueId": { $regex: search, $options: "i" } },
              ],
            },
          },
        ]
        : []),

      { $sort: { createdAt: -1 } },

      {
        $facet: {
          data: [
            ...(search ? [] : [
              { $skip: (page - 1) * pageSize },
              { $limit: pageSize },
            ]),
          ],
          total: [{ $count: "count" }],
        },
      },
      {
        $project: {
          data: 1,
          total: { $arrayElemAt: ["$total.count", 0] },
        },
      },
    ];

    const result = await VerificationRequest.aggregate(pipeline);

    return res.status(200).json({
      status: true,
      message: "All verificationRequests have been retrieved by the admin.",
      total: search ? result[0]?.data.length : result[0]?.total || 0,
      data: result[0]?.data || [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
