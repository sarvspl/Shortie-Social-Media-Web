const HashTag = require("../../models/hashTag.model");

//import model
const Video = require("../../models/video.model");
const Post = require("../../models/post.model");
const HashTagUsageHistory = require("../../models/hashTagUsageHistory.model");

//deleteFromStorage
const { deleteFromStorage } = require("../../util/storageHelper");

//mongoose
const mongoose = require("mongoose");

//craete hashTag
exports.create = async (req, res) => {
  try {
    if (!req.body.hashTagBanner || !req.body.hashTagIcon || !req.body.hashTag) {
      if (req?.body?.hashTagIcon) {
        await deleteFromStorage(req?.body?.hashTagIcon);
      }

      if (req?.body?.hashTagBanner) {
        await deleteFromStorage(req?.body?.hashTagBanner);
      }

      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const hashTag = req.body.hashTag.trim();

    const alreadyExist = await HashTag.findOne({ hashTag: hashTag }).lean();

    if (alreadyExist) {
      if (req?.body?.hashTagIcon) {
        await deleteFromStorage(req?.body?.hashTagIcon);
      }

      if (req?.body?.hashTagBanner) {
        await deleteFromStorage(req?.body?.hashTagBanner);
      }

      return res.status(200).json({
        status: false,
        message: "HashTag already exist.",
      });
    } else {
      const newHashTag = new HashTag();
      newHashTag.hashTag = hashTag;
      newHashTag.hashTagIcon = req?.body?.hashTagIcon;
      newHashTag.hashTagBanner = req?.body?.hashTagBanner;
      await newHashTag.save();

      return res.status(200).json({
        status: true,
        message: "HashTag created by the admin.",
        data: newHashTag,
      });
    }
  } catch (error) {
    if (req?.body?.hashTagIcon) {
      await deleteFromStorage(req?.body?.hashTagIcon);
    }

    if (req?.body?.hashTagBanner) {
      await deleteFromStorage(req?.body?.hashTagBanner);
    }

    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//update hashTag
exports.update = async (req, res) => {
  try {
    if (!req.query.hashTagId) {
      if (req?.body?.hashTagIcon) {
        await deleteFromStorage(req?.body?.hashTagIcon);
      }

      if (req?.body?.hashTagBanner) {
        await deleteFromStorage(req?.body?.hashTagBanner);
      }

      return res.status(200).json({ status: false, message: "hashTagId must be requried." });
    }

    const hashTagId = new mongoose.Types.ObjectId(req.query.hashTagId);

    const hashTag = await HashTag.findById(hashTagId);
    if (!hashTag) {
      if (req?.body?.hashTagIcon) {
        await deleteFromStorage(req?.body?.hashTagIcon);
      }

      if (req?.body?.hashTagBanner) {
        await deleteFromStorage(req?.body?.hashTagBanner);
      }

      return res.status(200).json({ status: false, message: "hashTag does not found." });
    }

    if (req?.body?.hashTagBanner) {
      await deleteFromStorage(hashTag.hashTagBanner);

      hashTag.hashTagBanner = req?.body?.hashTagBanner ? req?.body?.hashTagBanner : hashTag.hashTagBanner;
    }

    if (req?.body?.hashTagIcon) {
      await deleteFromStorage(hashTag.hashTagIcon);

      hashTag.hashTagIcon = req?.body?.hashTagIcon ? req?.body?.hashTagIcon : hashTag.hashTagIcon;
    }

    hashTag.hashTag = req.body.hashTag ? req.body.hashTag : hashTag.hashTag;
    await hashTag.save();

    return res.status(200).json({ status: true, message: "HashTag has been updated by the admin.", data: hashTag });
  } catch (error) {
    if (req?.body?.hashTagIcon) {
      await deleteFromStorage(req?.body?.hashTagIcon);
    }

    if (req?.body?.hashTagBanner) {
      await deleteFromStorage(req?.body?.hashTagBanner);
    }

    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get hashTag
exports.getbyadmin = async (req, res, next) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const search = req.query.search ? req.query.search.trim() : null;

    const matchStage = search
      ? { $match: { hashTag: { $regex: search, $options: "i" } } }
      : { $match: {} };

    const result = await HashTag.aggregate([
      matchStage,

      {
        $lookup: {
          from: "hashtagusagehistories",
          localField: "_id",
          foreignField: "hashTagId",
          pipeline: [
            { $count: "count" }
          ],
          as: "usageHistory",
        },
      },
      {
        $addFields: {
          usageCount: { $ifNull: [{ $arrayElemAt: ["$usageHistory.count", 0] }, 0] },
        },
      },
      {
        $project: {
          usageHistory: 0,
        },
      },

      {
        $facet: {
          data: [
            { $sort: { usageCount: -1 } },
            ...(search
              ? []
              : [
                { $skip: (start - 1) * limit },
                { $limit: limit },
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
    ]);

    return res.status(200).json({
      status: true,
      message: "Hashtag retrieved by the admin.",
      total: result[0]?.total || 0,
      data: result[0]?.data || [],
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//delete hashTag
exports.delete = async (req, res, next) => {
  try {
    if (!req.query.hashTagId) {
      return res.status(200).json({ status: false, message: "hashTagId must be requried." });
    }

    const hashTagId = new mongoose.Types.ObjectId(req.query.hashTagId);

    const hashTag = await HashTag.findById(hashTagId);
    if (!hashTag) {
      return res.status(200).json({ status: false, message: "hashTag does not found." });
    }

    if (hashTag?.hashTagBanner) {
      await deleteFromStorage(hashTag.hashTagBanner);
    }

    if (hashTag?.hashTagIcon) {
      await deleteFromStorage(hashTag.hashTagIcon);
    }

    res.status(200).json({ status: true, message: "HashTag has been deleted by the admin." });

    const [updatedVideos, updatedPosts, deleteHistory] = await Promise.all([
      Video.updateMany({ hashTagId: { $in: [hashTag._id] } }, { $pull: { hashTagId: hashTag._id } }),
      Post.updateMany({ hashTagId: { $in: [hashTag._id] } }, { $pull: { hashTagId: hashTag._id } }),
      HashTagUsageHistory.deleteMany({ hashTagId: hashTag._id }),
    ]);

    await hashTag.deleteOne();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get all hashTag for dropdown
exports.getHashtag = async (req, res, next) => {
  try {
    const search = req.query.search ? req.query.search.trim() : null;

    const matchStage = search
      ? { hashTag: { $regex: search, $options: "i" } }
      : {};

    const hashTags = await HashTag.aggregate([
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      { $limit: 20 },

      {
        $lookup: {
          from: "hashtagusagehistories",
          localField: "_id",
          foreignField: "hashTagId",
          pipeline: [
            { $count: "count" }
          ],
          as: "usage",
        },
      },
      {
        $addFields: {
          totalHashTagUsedCount: { $ifNull: [{ $arrayElemAt: ["$usage.count", 0] }, 0] },
        },
      },

      {
        $project: {
          hashTag: 1,
          totalUsageCount: "$totalHashTagUsedCount",
          hashTagIcon: 1,
          hashTagBanner: 1,
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Retrieve hashtags when video uploaded by the user.",
      data: hashTags,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: error.message || "Internal Server Error" });
  }
};
