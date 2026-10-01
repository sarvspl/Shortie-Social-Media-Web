const Video = require("../../models/video.model");
const User = require("../../models/user.model");
const Post = require("../../models/post.model");
const Song = require("../../models/song.model");
const VerificationRequest = require("../../models/verificationRequest.model");
const Report = require("../../models/report.model");

//get admin panel dashboard count
exports.dashboardCount = async (req, res) => {
  try {
    if (!req.query.startDate || !req.query.endDate) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    let dateFilterQuery = {};
    if (req?.query?.startDate !== "All" && req?.query?.endDate !== "All") {
      const startDate = new Date(req?.query?.startDate);
      const endDate = new Date(req?.query?.endDate);
      endDate.setHours(23, 59, 59, 999);

      dateFilterQuery = {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const [totalVideos, totalPosts, userCounts, totalSongs, totalVerificationRequests, totalReports] = await Promise.all([
      Video.countDocuments(dateFilterQuery),
      Post.countDocuments(dateFilterQuery),
      User.aggregate([
        { $match: dateFilterQuery },
        {
          $facet: {
            totalUsers: [{ $count: "count" }],
            totalActiveUsers: [{ $match: { isFake: false, isBlock: false } }, { $count: "count" }],
            totalVerifiedUsers: [{ $match: { isVerified: true } }, { $count: "count" }]
          }
        },
        {
          $project: {
            totalUsers: { $arrayElemAt: ["$totalUsers.count", 0] },
            totalActiveUsers: { $arrayElemAt: ["$totalActiveUsers.count", 0] },
            totalVerifiedUsers: { $arrayElemAt: ["$totalVerifiedUsers.count", 0] },
          }
        }
      ]),
      Song.countDocuments(dateFilterQuery),
      VerificationRequest.countDocuments({ ...dateFilterQuery, isAccepted: false, isRejected: false }),
      Report.countDocuments({ ...dateFilterQuery, status: 1 }),
    ]);

    const totalUsers = userCounts[0]?.totalUsers || 0;
    const totalActiveUsers = userCounts[0]?.totalActiveUsers || 0;
    const totalVerifiedUsers = userCounts[0]?.totalVerifiedUsers || 0;

    return res.status(200).json({
      status: true,
      message: "Get admin panel dashboard count.",
      data: {
        totalVideos,
        totalPosts,
        totalUsers,
        totalActiveUsers,
        totalVerifiedUsers,
        totalSongs,
        totalVerificationRequests,
        totalReports,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get date wise chartAnalytic for users, videos, posts
exports.chartAnalytic = async (req, res) => {
  try {
    if (!req.query.startDate || !req.query.endDate) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    let dateFilterQuery = {};
    if (req?.query?.startDate !== "All" && req?.query?.endDate !== "All") {
      const startDate = new Date(req?.query?.startDate);
      const endDate = new Date(req?.query?.endDate);
      endDate.setHours(23, 59, 59, 999);

      dateFilterQuery = {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    if (req.query.type === "User") {
      const data = await User.aggregate([
        {
          $match: dateFilterQuery,
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      return res.status(200).json({ status: true, message: "Success", chartUser: data });
    } else if (req.query.type === "Video") {
      const data = await Video.aggregate([
        {
          $match: dateFilterQuery,
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      return res.status(200).json({ status: true, message: "Success", chartVideo: data });
    } else if (req.query.type === "Post") {
      const data = await Post.aggregate([
        {
          $match: dateFilterQuery,
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      return res.status(200).json({ status: true, message: "Success", chartPost: data });
    } else if (req.query.type === "Song") {
      const data = await Song.aggregate([
        {
          $match: dateFilterQuery,
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      return res.status(200).json({ status: true, message: "Success", chartSong: data });
    } else {
      return res.status(200).json({ status: false, message: "type must be passed valid." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//get date wise chartAnalytic for active users, inActive users
exports.chartAnalyticOfUser = async (req, res) => {
  try {
    if (!req.query.startDate || !req.query.endDate) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    let dateFilterQuery = {};
    if (req?.query?.startDate !== "All" && req?.query?.endDate !== "All") {
      const startDate = new Date(req?.query?.startDate);
      const endDate = new Date(req?.query?.endDate);
      endDate.setHours(23, 59, 59, 999);

      dateFilterQuery = {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const result = await User.aggregate([
      { $match: dateFilterQuery }, 
      {
        $facet: {
          totalUsers: [{ $count: "count" }],
          activeUsers: [{ $match: { isBlock: false } }, { $count: "count" }],
          blockedUsers: [{ $match: { isBlock: true } }, { $count: "count" }],
        },
      },
      {
        $project: {
          totalUsers: { $arrayElemAt: ["$totalUsers.count", 0] },
          activeUsers: { $arrayElemAt: ["$activeUsers.count", 0] },
          blockedUsers: { $arrayElemAt: ["$blockedUsers.count", 0] },
        },
      },
    ]);

    const totalUsers = result[0]?.totalUsers || 0;
    const activeUsers = result[0]?.activeUsers || 0;
    const blockedUsers = result[0]?.blockedUsers || 0;

    return res.status(200).json({
      status: true,
      message: "Success",
      data: {
        totalUsers,
        activeUsers,
        blockedUsers,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
