const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    androidAppVersion: { type: String, default: "" },
    iosAppVersion: { type: String, default: "" },
    androidAppLink: { type: String, default: "" },
    iosAppLink: { type: String, default: "" },

    privacyPolicyLink: { type: String, default: "PRIVACY POLICY LINK" },
    termsOfUsePolicyLink: { type: String, default: "TERMS OF USE POLICY LINK" },

    zegoAppId: { type: String, default: "ZEGO APP ID" },
    zegoAppSignIn: { type: String, default: "ZEGO APP SIGN IN" },
    zegoServerSecret: { type: String, default: "ZEGO SERVER SECRET" },

    paymentGateway: { type: Array, default: [] },
    isFakeData: { type: Boolean, default: false },

    profilePictureCollection: { type: Array, default: [] },

    durationOfShorts: { type: Number, default: 0 }, //that value always save in seconds
    minCoinForCashOut: { type: Number, default: 0 }, //min coin requried for convert coin to default currency i.e., 1000 coin = 1 $
    loginBonus: { type: Number, default: 5000 },
    pkEndTime: { type: Number, default: 10 },
    openAIKey: { type: String, default: "" },

    minWithdrawalRequestedCoin: { type: Number, default: 0 },
    currency: {
      name: { type: String, default: "", unique: true },
      symbol: { type: String, default: "", unique: true },
      countryCode: { type: String, default: "" },
      currencyCode: { type: String, default: "" },
      isDefault: { type: Boolean, default: false },
    }, //default currency

    privateKey: { type: Object, default: {} }, //firebase.json handle notification
    resendApiKey: { type: String, default: "RESEND API KEY" },

    //video banned setting
    videoBanned: { type: Array, default: [] },
    postBanned: { type: Array, default: [] },
    sightengineUser: { type: String, default: "API USER" },
    sightengineSecret: { type: String, default: "API SECRET" },

    //shorts effect setting
    isEffectActive: { type: Boolean, default: false },
    androidLicenseKey: { type: String, default: "LICENSE KEY" },
    iosLicenseKey: { type: String, default: "LICENSE KEY" },

    watermarkType: { type: Number, enum: [1, 2] }, //1.active 2.inactive
    isWatermarkOn: { type: Boolean, default: false },
    watermarkIcon: { type: String, default: "" },

    //Storage Settings
    storage: {
      local: { type: Boolean, default: true }, // Local storage active by default
      awsS3: { type: Boolean, default: false },
      digitalOcean: { type: Boolean, default: false },
    },

    //DigitalOcean Spaces
    doEndpoint: { type: String, default: "" },
    doAccessKey: { type: String, default: "" },
    doSecretKey: { type: String, default: "" },
    doHostname: { type: String, default: "" },
    doBucketName: { type: String, default: "" },
    doRegion: { type: String, default: "" },

    //AWS S3
    awsEndpoint: { type: String, default: "" },
    awsAccessKey: { type: String, default: "" },
    awsSecretKey: { type: String, default: "" },
    awsHostname: { type: String, default: "" },
    awsBucketName: { type: String, default: "" },
    awsRegion: { type: String, default: "" },

    //Advertisement setting
    adDisplayIndex: { type: Number, default: 0 }, //it represents the index at which ads should be displayed

    isVideoAdEnabled: { type: Boolean, default: false },
    isFeedAdEnabled: { type: Boolean, default: false },
    isChatAdEnabled: { type: Boolean, default: false },
    isLiveStreamBackButtonAdEnabled: { type: Boolean, default: false },
    isChatBackButtonAdEnabled: { type: Boolean, default: false },

    isGoogle: { type: Boolean, default: false },
    android: {
      google: {
        native: { type: String, default: "android_native_id" },
        interstitial: { type: String, default: "android_interstitial_id" },
        nativeAdVideo: { type: String, default: "android_native_video_ad_id" },
      },
    },
    ios: {
      google: {
        native: { type: String, default: "ios_native_id" },
        interstitial: { type: String, default: "ios_interstitial_id" },
        nativeAdVideo: { type: String, default: "ios_native_video_ad_id" },
      },
    },

    androidAssetLinks: { type: Array, default: [] },
    appleAppSiteAssociation: { type: mongoose.Schema.Types.Mixed, default: {} },

    websiteUrl: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

settingSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Setting", settingSchema);
