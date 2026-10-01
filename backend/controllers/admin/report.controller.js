const Report = require("../../models/report.model");

//import model
const Notification = require("../../models/notification.model");
const Video = require("../../models/video.model");
const Post = require("../../models/post.model");
const PostOrVideoComment = require("../../models/postOrvideoComment.model");
const LikeHistoryOfPostOrVideo = require("../../models/likeHistoryOfpostOrvideo.model");
const LikeHistoryOfpostOrvideoComment = require("../../models/likeHistoryOfpostOrvideoComment.model");
const HashTagUsageHistory = require("../../models/hashTagUsageHistory.model");
const WatchHistory = require("../../models/watchHistory.model");

//deleteFromStorage
const { deleteFromStorage } = require("../../util/storageHelper");

//get type wise all reports
exports.getReports = async (req, res) => {
  try {
    const { startDate, endDate, type, status, start, limit, search } = req.query;

    if (!startDate || !endDate || !type || !status) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const page = start ? parseInt(start) : 1;
    const pageSize = limit ? parseInt(limit) : 20;
    const trimmedSearch = search ? search.trim() : null;

    // Date filter
    let dateFilterQuery = {};
    if (startDate !== "All" && endDate !== "All") {
      const sDate = new Date(startDate);
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);
      dateFilterQuery = { createdAt: { $gte: sDate, $lte: eDate } };
    }

    // Status filter
    let statusQuery = {};
    if (status !== "All") {
      statusQuery.status = parseInt(status);
    }

    // Search stage
    const searchStage = trimmedSearch
      ? {
          $match: {
            $or: [
              { userName: { $regex: trimmedSearch, $options: "i" } },
              { name: { $regex: trimmedSearch, $options: "i" } },
              { uniqueId: { $regex: trimmedSearch, $options: "i" } },
              { uniquePostId: { $regex: trimmedSearch, $options: "i" } },
              { toUserUserName: { $regex: trimmedSearch, $options: "i" } },
              { toUserName: { $regex: trimmedSearch, $options: "i" } },
              { toUserUniqueId: { $regex: trimmedSearch, $options: "i" } },
              { uniqueVideoId: { $regex: trimmedSearch, $options: "i" } },
            ],
          },
        }
      : null;

    // Common aggregation function
    const aggregateReports = async (baseMatch, lookupStages, projectStage) => {
      const pipeline = [{ $match: baseMatch }, ...lookupStages, { $project: projectStage }, ...(searchStage ? [searchStage] : []), { $sort: { createdAt: -1 } }];

      // Apply pagination only if no search
      if (!trimmedSearch) {
        pipeline.push({ $skip: (page - 1) * pageSize }, { $limit: pageSize });
      }

      const [totalReports, report] = await Promise.all([Report.countDocuments(baseMatch), Report.aggregate(pipeline)]);

      return { totalReports, report };
    };

    if (type == 1) {
      // Video reports
      const { totalReports, report } = await aggregateReports(
        { ...statusQuery, ...dateFilterQuery, type: 1 },
        [
          { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          { $match: { "user.isBlock": false } },
          { $lookup: { from: "videos", localField: "videoId", foreignField: "_id", as: "video" } },
          { $unwind: { path: "$video", preserveNullAndEmptyArrays: true } },
        ],
        {
          type: 1,
          status: 1,
          reportReason: 1,
          createdAt: 1,
          userName: "$user.userName",
          name: "$user.name",
          image: "$user.image",
          uniqueId: "$user.uniqueId",
          videoImage: "$video.videoImage",
          videoUrl: "$video.videoUrl",
          uniqueVideoId: "$video.uniqueVideoId",
          videoId: "$video._id",
        }
      );

      return res.status(200).json({
        status: true,
        message: "Get reports of the video by the admin.",
        total: totalReports,
        data: report,
      });
    } else if (type == 2) {
      // Post reports
      const { totalReports, report } = await aggregateReports(
        { ...statusQuery, ...dateFilterQuery, type: 2 },
        [
          { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          { $match: { "user.isBlock": false } },
          { $lookup: { from: "posts", localField: "postId", foreignField: "_id", as: "post" } },
          { $unwind: { path: "$post", preserveNullAndEmptyArrays: true } },
        ],
        {
          type: 1,
          status: 1,
          reportReason: 1,
          createdAt: 1,
          userName: "$user.userName",
          name: "$user.name",
          image: "$user.image",
          uniqueId: "$user.uniqueId",
          postImage: "$post.mainPostImage",
          uniquePostId: "$post.uniquePostId",
          postId: "$post._id",
        }
      );

      return res.status(200).json({
        status: true,
        message: "Get reports of the post by the admin.",
        total: totalReports,
        data: report,
      });
    } else if (type == 3) {
      // User reports
      const { totalReports, report } = await aggregateReports(
        { ...statusQuery, ...dateFilterQuery, type: 3 },
        [
          { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          { $match: { "user.isBlock": false } },
          { $lookup: { from: "users", localField: "toUserId", foreignField: "_id", as: "toUser" } },
          { $unwind: { path: "$toUser", preserveNullAndEmptyArrays: true } },
        ],
        {
          type: 1,
          status: 1,
          reportReason: 1,
          createdAt: 1,
          userName: "$user.userName",
          name: "$user.name",
          image: "$user.image",
          uniqueId: "$user.uniqueId",
          toUserUserName: "$toUser.userName",
          toUserName: "$toUser.name",
          toUserImage: "$toUser.image",
          toUserUniqueId: "$toUser.uniqueId",
          toUserId: "$toUser._id",
        }
      );

      return res.status(200).json({
        status: true,
        message: "Get reports of the user by the admin.",
        total: totalReports,
        data: report,
      });
    } else {
      return res.status(200).json({ status: false, message: "Type must be passed valid." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//report solved
exports.solveReport = async (req, res) => {
  try {
    if (!req.query.reportId) {
      return res.status(200).json({ status: false, message: "reportId must be requried." });
    }

    const report = await Report.findById(req.query.reportId);
    if (!report) {
      return res.status(200).json({ status: false, message: "report does not found." });
    }

    if (report.status == 2) {
      return res.status(200).json({ status: false, message: "report already solved by the admin." });
    }

    report.status = 2;
    await report.save();

    return res.status(200).send({
      status: true,
      message: "report has been solved by the admin.",
      data: report,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//delete report
exports.deleteReport = async (req, res) => {
  try {
    if (!req.query.reportId) {
      return res.status(200).json({ status: false, message: "reportId must be requried." });
    }

    const report = await Report.findById(req.query.reportId);
    if (!report) {
      return res.status(200).json({ status: false, message: "report does not found." });
    }

    res.status(200).json({
      status: true,
      message: "Report has been deleted by the admin.",
    });

    if (report.videoId !== null) {
      const video = await Video.findById(report.videoId);

      if (video?.videoImage) {
        await deleteFromStorage(video?.videoImage);
      }

      if (video?.videoUrl) {
        await deleteFromStorage(video?.videoUrl);
      }

      await Promise.all([
        LikeHistoryOfPostOrVideo.deleteMany({ videoId: video._id }),
        PostOrVideoComment.deleteMany({ videoId: video._id }),
        LikeHistoryOfpostOrvideoComment.deleteMany(),
        WatchHistory.deleteMany({ videoId: video._id }),
        HashTagUsageHistory.deleteMany({ videoId: video._id }),
        Notification.deleteMany({ otherUserId: video?.userId }),
      ]);

      await Video.deleteOne({ _id: video._id });
    }

    if (report.postId !== null) {
      const post = await Post.findById(report?.postId);

      if (post?.mainPostImage) {
        await deleteFromStorage(post?.mainPostImage);
      }

      if (post.postImage.length > 0) {
        for (let imageObj of post?.postImage) {
          const imageUrl = imageObj.url; // Extract URL from object

          if (imageUrl) {
            await deleteFromStorage(imageUrl);
          }
        }
      }

      await Promise.all([
        LikeHistoryOfPostOrVideo.deleteMany({ postId: post._id }),
        PostOrVideoComment.deleteMany({ postId: post._id }),
        LikeHistoryOfpostOrvideoComment.deleteMany({ postId: post._id }),
        HashTagUsageHistory.deleteMany({ postId: post._id }),
        Notification.deleteMany({ $or: [{ otherUserId: post?.userId }, { userId: post?.userId }] }),
      ]);

      await Post.deleteOne({ _id: post?._id });
    }

    await report.deleteOne();
  } catch {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
