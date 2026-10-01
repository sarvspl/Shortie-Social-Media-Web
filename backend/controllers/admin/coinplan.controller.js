const CoinPlan = require("../../models/coinplan.model");

//deleteFromStorage
const { deleteFromStorage } = require("../../util/storageHelper");

const History = require("../../models/history.model");

//create coinplan
exports.store = async (req, res) => {
  try {
    if (!req.body.coin || !req.body.amount || !req.body.productKey || !req.body.icon) {
      if (req?.body?.icon) {
        await deleteFromStorage(req?.body?.icon);
      }

      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const { coin, amount, productKey } = req.body;

    const coinplan = new CoinPlan();
    coinplan.coin = coin;
    coinplan.amount = amount;
    coinplan.productKey = productKey;
    coinplan.icon = req.body.icon ? req.body.icon : "";
    await coinplan.save();

    return res.status(200).json({
      status: true,
      message: "coinplan create Successfully",
      data: coinplan,
    });
  } catch (error) {
    if (req?.body?.icon) {
      await deleteFromStorage(req?.body?.icon);
    }

    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error",
    });
  }
};

//update coinplan
exports.update = async (req, res) => {
  try {
    if (!req.query.coinPlanId) {
      if (req?.body?.icon) {
        await deleteFromStorage(req?.body?.icon);
      }

      return res.status(200).json({ status: false, message: "coinPlanId must be needed." });
    }

    const coinplan = await CoinPlan.findById(req.query.coinPlanId);
    if (!coinplan) {
      if (req?.body?.icon) {
        await deleteFromStorage(req?.body?.icon);
      }

      return res.status(200).json({ status: false, message: "CoinPlan does not found." });
    }

    coinplan.coin = req.body.coin ? Number(req.body.coin) : coinplan.coin;
    coinplan.amount = req.body.amount ? Number(req.body.amount) : coinplan.amount;
    coinplan.productKey = req.body.productKey ? req.body.productKey : coinplan.productKey;

    if (req?.body?.icon) {
      await deleteFromStorage(coinplan.icon);

      coinplan.icon = req?.body?.icon ? req?.body?.icon : coinplan.icon;
    }

    await coinplan.save();

    return res.status(200).json({
      status: true,
      message: "Coinplan update Successfully",
      data: coinplan,
    });
  } catch (error) {
    if (req?.body?.icon) {
      await deleteFromStorage(req?.body?.icon);
    }

    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error",
    });
  }
};

//handle isActive switch
exports.handleSwitch = async (req, res) => {
  try {
    if (!req.query.coinPlanId) {
      return res.status(200).json({ status: false, message: "coinPlanId must be needed." });
    }

    const coinplan = await CoinPlan.findById(req.query.coinPlanId);
    if (!coinplan) {
      return res.status(200).json({ status: false, message: "CoinPlan does not found." });
    }

    coinplan.isActive = !coinplan.isActive;
    await coinplan.save();

    return res.status(200).json({ status: true, message: "Success", data: coinplan });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//delete coinplan
exports.delete = async (req, res) => {
  try {
    if (!req.query.coinPlanId) {
      return res.status(200).json({ status: false, message: "coinPlanId must be needed." });
    }

    const coinplan = await CoinPlan.findById(req.query.coinPlanId);
    if (!coinplan) {
      return res.status(200).json({ status: false, message: "CoinPlan does not found." });
    }

    if (coinplan?.icon) {
      await deleteFromStorage(coinplan.icon);
    }

    await coinplan.deleteOne();

    return res.status(200).json({
      status: true,
      message: "Coinplan deleted Successfully",
      data: coinplan,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//get coinPlan
exports.get = async (req, res) => {
  try {
    const { start = 1, limit = 10 } = req.query;

    const parsedPage = parseInt(start);
    const parsedLimit = parseInt(limit);

    if (isNaN(parsedPage) || parsedPage <= 0 || isNaN(parsedLimit) || parsedLimit <= 0) {
      return res.status(200).json({
        status: false,
        message: "'start' and 'limit' must be valid positive integers.",
      });
    }

    const skip = (parsedPage - 1) * parsedLimit;

    const result = await CoinPlan.aggregate([
      {
        $facet: {
          data: [
            { $sort: { coin: 1, amount: 1 } },
            { $skip: skip },
            { $limit: parsedLimit }
          ],
          total: [
            { $count: "count" }
          ]
        }
      }
    ]);

    const coinPlan = result[0].data;
    const total = result[0].total[0]?.count || 0;

    return res.status(200).json({
      status: true,
      message: "Retrive CoinPlan Successfully",
      total,
      data: coinPlan,
    });
  } catch {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//get coinplan histories of users (admin earning)
// exports.fetchUserCoinplanTransactions = async (req, res) => {
//   try {
//     const start = req.query.start ? parseInt(req.query.start) : 1;
//     const limit = req.query.limit ? parseInt(req.query.limit) : 20;
//     const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

//     const startDate = req?.query?.startDate || "All";
//     const endDate = req?.query?.endDate || "All";

//     let dateFilterQuery = {};
//     if (req?.query?.startDate !== "All" && req?.query?.endDate !== "All") {
//       const formatStartDate = new Date(startDate);
//       const formatEndDate = new Date(endDate);
//       formatEndDate.setHours(23, 59, 59, 999);

//       dateFilterQuery = {
//         createdAt: {
//           $gte: formatStartDate,
//           $lte: formatEndDate,
//         },
//       };
//     }

//     let searchMatchStage = {};

//     if (search && search !== "undefined") {
//       const regex = new RegExp(search, "i");

//       searchMatchStage = {
//         $or: [{ "userDetails.name": regex }, { "userDetails.userName": regex }, { "userDetails.uniqueId": regex }, { paymentGateway: regex }],
//       };
//     }

//     let totalHistoryPromise;

//     if (search && search !== "undefined") {
//       totalHistoryPromise = History.aggregate([
//         {
//           $match: {
//             ...dateFilterQuery,
//             type: 2,
//             amount: { $exists: true, $ne: 0 },
//           },
//         },
//         {
//           $lookup: {
//             from: "users",
//             localField: "userId",
//             foreignField: "_id",
//             as: "userDetails",
//           },
//         },
//         { $unwind: "$userDetails" },
//         { $match: searchMatchStage },
//         { $count: "total" },
//       ]);
//     } else {
//       totalHistoryPromise = History.countDocuments({
//         ...dateFilterQuery,
//         type: 2,
//         amount: { $exists: true, $ne: 0 },
//       });
//     }

//     const [totalHistoryResult, adminEarnings, history] = await Promise.all([
//       totalHistoryPromise,
//       History.aggregate([
//         {
//           $match: {
//             ...dateFilterQuery,
//             type: 2,
//             amount: { $exists: true, $ne: 0 },
//           },
//         },
//         { $group: { _id: null, totalEarnings: { $sum: "$amount" } } },
//       ]),
//       History.aggregate([
//         {
//           $match: {
//             ...dateFilterQuery,
//             type: 2,
//             amount: { $exists: true, $ne: 0 },
//           },
//         },
//         {
//           $lookup: {
//             from: "users",
//             localField: "userId",
//             foreignField: "_id",
//             as: "userDetails",
//           },
//         },
//         { $unwind: "$userDetails" },
//         {
//           $match: {
//             ...(searchMatchStage.$or ? searchMatchStage : {}),
//           },
//         },
//         {
//           $group: {
//             _id: "$userDetails._id",
//             name: { $first: "$userDetails.name" },
//             userName: { $first: "$userDetails.userName" },
//             image: { $first: "$userDetails.image" },
//             uniqueId: { $first: "$userDetails.uniqueId" },
//             totalPlansPurchased: { $sum: 1 },
//             totalAmountSpent: { $sum: "$amount" },
//             // coinPlanPurchase: {
//             //   $push: {
//             //     coin: "$coin",
//             //     uniqueId: "$uniqueId",
//             //     paymentGateway: "$paymentGateway",
//             //     amount: "$amount",
//             //     date: "$date",
//             //   },
//             // },
//           },
//         },
//         { $sort: { totalPlansPurchased: -1 } },
//         { $skip: (start - 1) * limit },
//         { $limit: limit },
//       ]),
//     ]);

//     const totalAdminEarnings = adminEarnings.length > 0 ? adminEarnings[0].totalEarnings : 0;
//     const totalHistory = Array.isArray(totalHistoryResult) ? totalHistoryResult[0]?.total || 0 : totalHistoryResult;

//     return res.status(200).json({
//       status: true,
//       message: "Retrieve all histories grouped by user.",
//       totalAdminEarnings: totalAdminEarnings,
//       total: totalHistory,
//       data: history,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ status: false, message: "Internal server error" });
//   }
// };

exports.fetchUserCoinplanTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.start) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search?.trim() || "";
    const paymentGateway = req.query.paymentGateway?.trim() || "";

    const startDate = req.query.startDate || "All";
    const endDate = req.query.endDate || "All";

    let dateFilter = {};
    if (startDate !== "All" && endDate !== "All") {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      dateFilter.createdAt = { $gte: start, $lte: end };
    }

    const matchStage = {
      type: 2,
      amount: { $exists: true, $ne: 0 },
      ...dateFilter,
      ...(paymentGateway && { paymentGateway }),
    };

    const pipeline = [
      { $match: matchStage },

      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                userName: 1,
                image: 1,
                uniqueId: 1,
              },
            },
          ],
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
                { paymentGateway: { $regex: search, $options: "i" } },
                { uniqueId: { $regex: search, $options: "i" } },
              ],
            },
          },
        ]
        : []),

      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },

            {
              $project: {
                _id: "$user._id",

                name: "$user.name",
                userName: "$user.userName",
                image: "$user.image",
                uniqueId: "$user.uniqueId",

                paymentGateway: 1,
                coin: 1,
                amount: 1,
                transactionId: "$uniqueId",
                createdAt: 1,
                date: 1,
              },
            },
          ],

          total: [{ $count: "total" }],

          totalAdminEarnings: [
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" },
              },
            },
          ],
        },
      },
    ];

    const result = await History.aggregate(pipeline);
    const response = result[0];

    return res.status(200).json({
      status: true,
      message: "Retrieve all histories.",

      totalAdminEarnings:
        response.totalAdminEarnings[0]?.total || 0,

      total: response.total[0]?.total || 0,

      data: response.data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

//get coinplan user's histories (admin earning)
exports.fetchUserCoinPlanHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search?.trim() || "";
    const startDate = req.query.startDate || "All";
    const endDate = req.query.endDate || "All";

    let dateFilter = {};
    if (startDate !== "All" && endDate !== "All") {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      dateFilter.createdAt = { $gte: start, $lte: end };
    }

    let searchFilter = {};
    if (search) {
      const regex = new RegExp(search, "i");
      searchFilter = {
        $or: [{ paymentGateway: regex }, { uniqueId: regex }],
      };
    }

    const matchQuery = {
      userId,
      type: 2,
      amount: { $exists: true, $ne: 0 },
      ...dateFilter,
      ...searchFilter,
    };

    const [data, total] = await Promise.all([
      History.find(matchQuery)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("coin uniqueId paymentGateway amount createdAt date"),
      History.countDocuments(matchQuery),
    ]);

    return res.status(200).json({
      status: true,
      message: "User coin plan history",
      total,
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};
