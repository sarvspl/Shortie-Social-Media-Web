const Setting = require("../../models/setting.model");

//deleteFromStorage
const { deleteFromStorage } = require("../../util/storageHelper");

const Joi = require("joi");

const sha256Regex = /^([A-F0-9]{2}:){31}[A-F0-9]{2}$/;
const androidAssetLinksSchema = Joi.array()
  .min(1)
  .max(5)
  .items(
    Joi.object({
      relation: Joi.array().items(Joi.string().valid("delegate_permission/common.handle_all_urls")).min(1).required(),

      target: Joi.object({
        namespace: Joi.string().valid("android_app").required(),

        package_name: Joi.string()
          .pattern(/^[a-zA-Z0-9_.]+$/)
          .required(),

        sha256_cert_fingerprints: Joi.array().min(1).max(10).items(Joi.string().uppercase().pattern(sha256Regex).required()).required(),
      })
        .required()
        .unknown(false),
    })
      .required()
      .unknown(false),
  )
  .required();

const appleAppSiteAssociationSchema = Joi.object({
  applinks: Joi.object({
    apps: Joi.array().items(Joi.string()).required(),
    details: Joi.array()
      .items(
        Joi.object({
          appID: Joi.string().required(),
          paths: Joi.array().items(Joi.string()).required(),
        }),
      )
      .min(1)
      .required(),
  }).required(),
}).unknown(true);

//create setting
exports.createSetting = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.status(200).json({ status: false, message: "oops ! Invalid details." });
    }

    const setting = new Setting();
    setting.privacyPolicyLink = req.body.privacyPolicyLink;
    await setting.save();

    return res.status(200).json({ status: true, message: "Success", data: setting });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Sever Error" });
  }
};

//update Setting
exports.updateSetting = async (req, res) => {
  try {
    if (!req.query.settingId) {
      return res.status(200).json({ status: false, message: "SettingId mumst be requried." });
    }

    const setting = await Setting.findById(req.query.settingId);
    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting does not found." });
    }

    let shouldRestart = false;

    // DigitalOcean
    if (req.body.doEndpoint && req.body.doEndpoint !== setting.doEndpoint) shouldRestart = true;
    if (req.body.doAccessKey && req.body.doAccessKey !== setting.doAccessKey) shouldRestart = true;
    if (req.body.doSecretKey && req.body.doSecretKey !== setting.doSecretKey) shouldRestart = true;
    if (req.body.doHostname && req.body.doHostname !== setting.doHostname) shouldRestart = true;
    if (req.body.doBucketName && req.body.doBucketName !== setting.doBucketName) shouldRestart = true;
    if (req.body.doRegion && req.body.doRegion !== setting.doRegion) shouldRestart = true;

    // AWS
    if (req.body.awsEndpoint && req.body.awsEndpoint !== setting.awsEndpoint) shouldRestart = true;
    if (req.body.awsAccessKey && req.body.awsAccessKey !== setting.awsAccessKey) shouldRestart = true;
    if (req.body.awsSecretKey && req.body.awsSecretKey !== setting.awsSecretKey) shouldRestart = true;
    if (req.body.awsHostname && req.body.awsHostname !== setting.awsHostname) shouldRestart = true;
    if (req.body.awsBucketName && req.body.awsBucketName !== setting.awsBucketName) shouldRestart = true;
    if (req.body.awsRegion && req.body.awsRegion !== setting.awsRegion) shouldRestart = true;

    // Private Key
    if (req.body.privateKey) {
      shouldRestart = true;
    }

    setting.sightengineUser = req.body.sightengineUser ? req.body.sightengineUser : setting.sightengineUser;
    setting.sightengineSecret = req.body.sightengineSecret ? req.body.sightengineSecret : setting.sightengineSecret;
    setting.androidLicenseKey = req.body.androidLicenseKey ? req.body.androidLicenseKey : setting.androidLicenseKey;
    setting.iosLicenseKey = req.body.iosLicenseKey ? req.body.iosLicenseKey : setting.iosLicenseKey;
    setting.privacyPolicyLink = req.body.privacyPolicyLink ? req.body.privacyPolicyLink : setting.privacyPolicyLink;
    setting.termsOfUsePolicyLink = req.body.termsOfUsePolicyLink ? req.body.termsOfUsePolicyLink : setting.termsOfUsePolicyLink;
    setting.zegoAppId = req.body.zegoAppId ? req.body.zegoAppId : setting.zegoAppId;
    setting.zegoAppSignIn = req.body.zegoAppSignIn ? req.body.zegoAppSignIn : setting.zegoAppSignIn;
    setting.zegoServerSecret = req?.body?.zegoServerSecret ? req?.body?.zegoServerSecret : setting?.zegoServerSecret;

    setting.resendApiKey = req.body.resendApiKey ? req.body.resendApiKey : setting.resendApiKey;
    setting.pkEndTime = req.body.pkEndTime ? req.body.pkEndTime : setting.pkEndTime;
    setting.openAIKey = req.body.openAIKey ? req.body.openAIKey : setting.openAIKey;

    setting.doEndpoint = req.body.doEndpoint ? req.body.doEndpoint : setting.doEndpoint;
    setting.doAccessKey = req.body.doAccessKey ? req.body.doAccessKey : setting.doAccessKey;
    setting.doSecretKey = req.body.doSecretKey ? req.body.doSecretKey : setting.doSecretKey;
    setting.doHostname = req.body.doHostname ? req.body.doHostname : setting.doHostname;
    setting.doBucketName = req.body.doBucketName ? req.body.doBucketName : setting.doBucketName;
    setting.doRegion = req.body.doRegion ? req.body.doRegion : setting.doRegion;

    setting.awsEndpoint = req.body.awsEndpoint ? req.body.awsEndpoint : setting.awsEndpoint;
    setting.awsAccessKey = req.body.awsAccessKey ? req.body.awsAccessKey : setting.awsAccessKey;
    setting.awsSecretKey = req.body.awsSecretKey ? req.body.awsSecretKey : setting.awsSecretKey;
    setting.awsHostname = req.body.awsHostname ? req.body.awsHostname : setting.awsHostname;
    setting.awsBucketName = req.body.awsBucketName ? req.body.awsBucketName : setting.awsBucketName;
    setting.awsRegion = req.body.awsRegion ? req.body.awsRegion : setting.awsRegion;

    setting.durationOfShorts = parseInt(req.body.durationOfShorts) ? parseInt(req.body.durationOfShorts) : setting.durationOfShorts;
    setting.minCoinForCashOut = parseInt(req.body.minCoinForCashOut) ? parseInt(req.body.minCoinForCashOut) : setting.minCoinForCashOut;
    setting.loginBonus = parseInt(req.body.loginBonus) ? parseInt(req.body.loginBonus) : setting.loginBonus;
    setting.minWithdrawalRequestedCoin = req.body.minWithdrawalRequestedCoin ? parseInt(req.body.minWithdrawalRequestedCoin) : setting.minWithdrawalRequestedCoin;

    setting.privateKey = req.body.privateKey ? JSON.parse(req.body.privateKey.trim()) : setting.privateKey;
    setting.videoBanned = req.body.videoBanned ? req.body.videoBanned.toString().split(",") : setting.videoBanned;
    setting.postBanned = req.body.postBanned ? req.body.postBanned.toString().split(",") : setting.postBanned;

    setting.adDisplayIndex = req.body.adDisplayIndex ? Number(req.body.adDisplayIndex) : setting.adDisplayIndex;
    setting.android.google.interstitial = req.body.androidGoogleInterstitial ? req.body.androidGoogleInterstitial : setting.android.google.interstitial;
    setting.android.google.native = req.body.androidGoogleNative ? req.body.androidGoogleNative : setting.android.google.native;
    setting.android.google.nativeAdVideo = req.body.androidGoogleNativeAdVideo ? req.body.androidGoogleNativeAdVideo : setting.android.google.nativeAdVideo;
    setting.ios.google.interstitial = req.body.iosGoogleInterstitial ? req.body.iosGoogleInterstitial : setting.ios.google.interstitial;
    setting.ios.google.native = req.body.iosGoogleNative ? req.body.iosGoogleNative : setting.ios.google.native;
    setting.ios.google.nativeAdVideo = req.body.iosGoogleNativeAdVideo ? req.body.iosGoogleNativeAdVideo : setting.ios.google.nativeAdVideo;

    setting.websiteUrl = req.body.websiteUrl ? req.body.websiteUrl.trim() : setting.websiteUrl;

    if ("androidAppVersion" in req.body) {
      setting.androidAppVersion = req.body.androidAppVersion.trim();
    }
    if ("iosAppVersion" in req.body) {
      setting.iosAppVersion = req.body.iosAppVersion.trim();
    }
    if ("androidAppLink" in req.body) {
      setting.androidAppLink = req.body.androidAppLink.trim();
    }
    if ("iosAppLink" in req.body) {
      setting.iosAppLink = req.body.iosAppLink.trim();
    }

    if (req.body.androidAssetLinks !== undefined) {
      let parsedAndroidAssetLinks = req.body.androidAssetLinks;

      if (typeof parsedAndroidAssetLinks === "string") {
        try {
          parsedAndroidAssetLinks = JSON.parse(parsedAndroidAssetLinks.trim());
        } catch (err) {
          return res.status(200).json({
            status: false,
            message: "androidAssetLinks must be valid JSON",
          });
        }
      }

      const { error, value } = androidAssetLinksSchema.validate(parsedAndroidAssetLinks, {
        abortEarly: true,
      });

      if (error) {
        return res.status(200).json({
          status: false,
          message: error.details[0].message,
        });
      }

      setting.androidAssetLinks = Object.freeze(value);
    }

    if (req.body.appleAppSiteAssociation !== undefined) {
      let parsedAppleAASA = req.body.appleAppSiteAssociation;

      if (typeof parsedAppleAASA === "string") {
        try {
          parsedAppleAASA = JSON.parse(parsedAppleAASA.trim());
        } catch (err) {
          return res.status(200).json({
            status: false,
            message: "appleAppSiteAssociation must be valid JSON",
          });
        }
      }

      const { error, value } = appleAppSiteAssociationSchema.validate(parsedAppleAASA, {
        abortEarly: true,
      });

      if (error) {
        return res.status(200).json({
          status: false,
          message: error.details[0].message,
        });
      }

      setting.appleAppSiteAssociation = Object.freeze(value);
    }

    await setting.save();

    res.status(200).json({
      status: true,
      message: "Setting has been Updated by the admin.",
      data: setting,
    });

    updateSettingFile(setting);

    if (shouldRestart) {
      setTimeout(() => {
        console.log("🔄 Storage credentials updated, restarting server...");
        process.exit(0);
      }, 500);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get setting
exports.getSetting = async (req, res) => {
  try {
    const setting = settingJSON ? settingJSON : null;
    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting does not found." });
    }

    return res.status(200).json({ status: true, message: "Success", data: setting });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//fetch selected fields of setting
exports.getLinks = async (req, res) => {
  try {
    const setting = settingJSON ? settingJSON : null;
    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting does not found." });
    }

    const data = {
      websiteUrl: setting.websiteUrl,
      androidAppLink: setting.androidAppLink,
      iosAppLink: setting.iosAppLink,
    };

    return res.status(200).json({
      status: true,
      message: "Selected fields of setting fetch Successfully",
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//handle setting switch
exports.handleSwitch = async (req, res) => {
  try {
    if (!req.query.settingId || !req.query.type) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const setting = await Setting.findById(req.query.settingId);
    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting does not found." });
    }

    const key = req.query.type.trim();

    const ALLOWED_KEYS = [
      "isEffectActive",
      "isFakeData",
    ];

    if (!ALLOWED_KEYS.includes(key)) {
      return res.status(200).json({ status: false, message: "type passed must be valid." });
    }

    setting[key] = !setting[key];
    await setting.save();

    updateSettingFile(setting);

    return res.status(200).json({ status: true, message: "Success", data: setting });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//handle water mark setting
exports.modifyWatermarkSetting = async (req, res) => {
  try {
    if (!req.body.settingId || !req.body.watermarkType) {
      return res.status(200).json({ status: false, message: "Invalid details!" });
    }

    const setting = await Setting.findById(req.body.settingId);
    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting does not found." });
    }

    const watermarkType = parseInt(req.body.watermarkType);

    if (watermarkType === 1) {
      if (!req.body.watermarkIcon) {
        return res.status(200).json({ status: false, message: "watermarkIcon must be requried." });
      }

      setting.watermarkType = 1;
      setting.isWatermarkOn = true;
      setting.watermarkIcon = req.body.watermarkIcon;
    }

    if (watermarkType === 2) {
      if (setting.watermarkIcon) {
        await deleteFromStorage(setting.watermarkIcon);
      }

      setting.watermarkType = 2;
      setting.isWatermarkOn = false;
      setting.watermarkIcon = "";
    }

    await setting.save();

    updateSettingFile(setting);

    return res.status(200).json({
      status: true,
      message: "Setting has been Updated by admin.",
      setting: setting,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//handle advertisement setting switch
exports.switchAdSetting = async (req, res) => {
  try {
    if (!req.query.settingId || !req.query.type) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const setting = await Setting.findById(req.query.settingId);
    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting does not found." });
    }

    if (req.query.type === "isVideoAdEnabled") {
      setting.isVideoAdEnabled = !setting.isVideoAdEnabled;
    } else if (req.query.type === "isFeedAdEnabled") {
      setting.isFeedAdEnabled = !setting.isFeedAdEnabled;
    } else if (req.query.type === "isChatAdEnabled") {
      setting.isChatAdEnabled = !setting.isChatAdEnabled;
    } else if (req.query.type === "isLiveStreamBackButtonAdEnabled") {
      setting.isLiveStreamBackButtonAdEnabled = !setting.isLiveStreamBackButtonAdEnabled;
    } else if (req.query.type === "isChatBackButtonAdEnabled") {
      setting.isChatBackButtonAdEnabled = !setting.isChatBackButtonAdEnabled;
    } else if (req.query.type === "isGoogle") {
      setting.isGoogle = !setting.isGoogle;
    } else {
      return res.status(200).json({ status: false, message: "type passed must be valid." });
    }

    await setting.save();

    updateSettingFile(setting);

    return res.status(200).json({ status: true, message: "Success", data: setting });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//handle update storage
exports.switchStorageOption = async (req, res) => {
  try {
    const settingId = req?.query?.settingId;
    const type = req?.query?.type?.trim();

    if (!settingId || !type) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    const setting = await Setting.findById(settingId);
    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting not found." });
    }

    // Ensure only one storage is true at a time
    if (type === "local") {
      setting.storage.local = !setting.storage.local;
      if (setting.storage.local) {
        setting.storage.awsS3 = false;
        setting.storage.digitalOcean = false;
      }
    } else if (type === "awsS3") {
      setting.storage.awsS3 = !setting.storage.awsS3;
      if (setting.storage.awsS3) {
        setting.storage.local = false;
        setting.storage.digitalOcean = false;
      }
    } else if (type === "digitalOcean") {
      setting.storage.digitalOcean = !setting.storage.digitalOcean;
      if (setting.storage.digitalOcean) {
        setting.storage.local = false;
        setting.storage.awsS3 = false;
      }
    } else {
      return res.status(200).json({ status: false, message: "Invalid storage type provided." });
    }

    await setting.save();
    updateSettingFile(setting);

    return res.status(200).json({
      status: true,
      message: "Storage setting updated successfully",
      data: setting,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//manage user profile picture collection
exports.updateProfilePictureCollection = async (req, res) => {
  try {
    const { settingId, action, imageUrls, indexes } = req.body;

    if (!settingId) {
      return res.status(200).json({ status: false, message: "SettingId must be provided." });
    }

    const setting = await Setting.findById(settingId);
    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting not found." });
    }

    if (action === "add") {
      if (!imageUrls || (!Array.isArray(imageUrls) && typeof imageUrls !== "string")) {
        return res.status(200).json({ status: false, message: "Image URLs must be provided." });
      }

      const urls = Array.isArray(imageUrls)
        ? imageUrls
        : imageUrls
            .split(",")
            .map((url) => url.trim())
            .filter(Boolean);

      if (urls.length === 0) {
        return res.status(200).json({ status: false, message: "No valid image URLs provided." });
      }

      setting.profilePictureCollection.push(...urls);
    } else if (action === "remove") {
      if (typeof indexes === "undefined" || (!Array.isArray(indexes) && typeof indexes !== "string")) {
        return res.status(200).json({ status: false, message: "Indexes must be provided to remove." });
      }

      const parsedIndexes = Array.isArray(indexes) ? indexes.map(Number) : indexes.split(",").map((i) => parseInt(i.trim(), 10));

      const invalid = parsedIndexes.some((i) => isNaN(i) || i < 0 || i >= setting.profilePictureCollection.length);
      if (invalid) {
        return res.status(200).json({ status: false, message: "One or more indexes are invalid." });
      }

      parsedIndexes.sort((a, b) => b - a);

      const deletedImages = [];

      for (const i of parsedIndexes) {
        const url = setting.profilePictureCollection[i];
        setting.profilePictureCollection.splice(i, 1);

        try {
          await deleteFromStorage(url, true); // allow deletion of defaultphoto
          console.log(`✅ Deleted profile image from storage: ${url}`);
          deletedImages.push(url);
        } catch (err) {
          console.warn(`⚠️ Failed to delete from storage: ${url}`);
        }
      }

      console.log(`🗑️ Total ${deletedImages.length} profile image(s) removed:`, deletedImages);
    } else {
      return res.status(200).json({ status: false, message: "Invalid action. Use 'add' or 'remove'." });
    }

    await setting.save();

    res.status(200).json({
      status: true,
      message: `Profile picture(s) ${action === "add" ? "added" : "removed"} successfully.`,
      data: setting.profilePictureCollection,
    });

    updateSettingFile(setting);
  } catch (error) {
    console.error("❌ Error in updateProfilePictureCollection:", error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
