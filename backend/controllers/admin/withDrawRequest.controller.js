const WithdrawRequest = require("../../models/withDrawRequest.model");

//import model
const User = require("../../models/user.model");
const History = require("../../models/history.model");

//private key
const admin = require("../../util/privateKey");

//get all withdraw requests
exports.index = async (req, res) => {
  try {
    const { startDate, endDate, type, start, limit, search } = req.query;

    if (!startDate || !endDate || !type) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    const page = start ? parseInt(start) : 1;
    const pageSize = limit ? parseInt(limit) : 20;
    const searchTerm = typeof search === "string" ? search.trim() : "";

    const typeQuery = type !== "All" ? { status: parseInt(type) } : {};

    let dateFilterQuery = {};
    if (startDate !== "All" && endDate !== "All") {
      const startD = new Date(startDate);
      const endD = new Date(endDate);
      endD.setHours(23, 59, 59, 999);

      dateFilterQuery = {
        createdAt: { $gte: startD, $lte: endD },
      };
    }

    let searchMatchStage = {};
    if (searchTerm && searchTerm !== "undefined") {
      const regex = new RegExp(searchTerm, "i");
      searchMatchStage = {
        $or: [
          { "user.name": regex },
          { "user.userName": regex },
          { "user.uniqueId": regex },
          { uniqueId: regex },
        ],
      };
    }

    const result = await WithdrawRequest.aggregate([
      { $match: { ...dateFilterQuery, ...typeQuery } },

      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 1, name: 1, userName: 1, image: 1, uniqueId: 1 } }],
          as: "user",
        },
      },
      { $unwind: "$user" },

      ...(searchMatchStage.$or ? [{ $match: searchMatchStage }] : []),

      {
        $facet: {
          data: [
            {
              $project: {
                amount: 1,
                coin: 1,
                status: 1,
                paymentGateway: 1,
                paymentDetails: 1,
                reason: 1,
                uniqueId: 1,
                requestDate: 1,
                acceptOrDeclineDate: 1,
                createdAt: 1,
                user: 1,
              },
            },
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * pageSize },
            { $limit: pageSize },
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
    ]);

    const total = result[0]?.total || 0;
    const data = result[0]?.data || [];

    return res.status(200).json({
      status: true,
      message: "Withdrawal requests fetched successfully!",
      total,
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//accept withdraw request
exports.acceptWithdrawalRequest = async (req, res) => {
  try {
    if (!req.query.requestId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const request = await WithdrawRequest.findById(req.query.requestId);
    if (!request) {
      return res.status(200).json({ status: false, message: "Withdrawal Request does not found!" });
    }

    if (request.status == 2) {
      return res.status(200).json({ status: false, message: "Withdrawal request already accepted by the admin." });
    }

    if (request.status == 3) {
      return res.status(200).json({ status: false, message: "Withdrawal request already declined by the admin." });
    }

    const user = await User.findOne({ _id: request.userId });
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    const [updateUser, updateRequest, updateHistory] = await Promise.all([
      User.updateOne(
        { _id: request.userId, coin: { $gt: 0 } },
        {
          $inc: {
            coin: -request.coin,
            totalWithdrawalCoin: request.coin,
            totalWithdrawalAmount: request.amount,
          },
        }
      ),
      WithdrawRequest.updateOne(
        { _id: request._id },
        {
          $set: {
            status: 2,
            acceptOrDeclineDate: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
          },
        }
      ),
      History.updateOne(
        { uniqueId: request.uniqueId, type: 3 },
        {
          $set: {
            payoutStatus: 2,
            date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
          },
        }
      ),
    ]);

    res.status(200).json({
      status: true,
      message: "Withdrawal request accepted and paid to particular user.",
      data: updateRequest,
    });

    //checks if the user has an fcmToken
    if (user.fcmToken && user.fcmToken !== null) {
      const adminPromise = await admin;

      const payload = {
        token: user.fcmToken,
        notification: {
          title: "🔔 Withdrawal Request Accepted! 🔔",
          body: "Good news! Your withdrawal request has been accepted and is being processed. Thank you for using our service!",
        },
        data: {
          type: "WITHDRAWREQUEST",
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
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//decline withdraw request
exports.declineWithdrawalRequest = async (req, res) => {
  try {
    if (!req.query.requestId || !req.query.reason) {
      return res.status(200).json({ status: false, message: "requestId and reason must be requried." });
    }

    const reason = req.query.reason.trim();
    const request = await WithdrawRequest.findById(req.query.requestId);
    if (!request) {
      return res.status(200).json({ status: false, message: "Withdrawal Request does not found!" });
    }

    if (request.status == 3) {
      return res.status(200).json({ status: false, message: "Withdrawal request already declined by the admin." });
    }

    if (request.status == 2) {
      return res.status(200).json({ status: false, message: "Withdrawal request already accepted by the admin." });
    }

    const user = await User.findOne({ _id: request.userId });
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    const [updateRequest, updateHistory] = await Promise.all([
      WithdrawRequest.updateOne(
        { _id: request._id },
        {
          $set: {
            status: 3,
            reason: reason,
            acceptOrDeclineDate: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
          },
        }
      ),
      History.updateOne(
        { uniqueId: request.uniqueId, type: 3 },
        {
          $set: {
            payoutStatus: 3,
            reason: reason,
            date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
          },
        }
      ),
    ]);

    res.status(200).json({ status: true, message: "Withdrawal Request has been declined by the admin." });

    //checks if the user has an fcmToken
    if (user.fcmToken && user.fcmToken !== null) {
      const adminPromise = await admin;

      const payload = {
        token: user.fcmToken,
        notification: {
          title: "🔔 Withdrawal Request Declined! 🔔",
          body: "We're sorry, but your withdrawal request has been declined. Please contact support for more information.",
        },
        data: {
          type: "WITHDRAWREQUEST",
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
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
