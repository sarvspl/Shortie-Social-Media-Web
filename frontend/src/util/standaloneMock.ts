// Standalone / Offline Mock Service for Shortie Admin Panel
// Allows the admin panel to run completely offline without requiring MongoDB or any database.

export const createStandaloneToken = (email: string = "admin@gmail.com", name: string = "Admin"): string => {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    _id: "standalone_admin_id",
    name: name || "Admin",
    email: email || "admin@gmail.com",
    role: "admin",
    flag: true,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1 year expiry
  };

  const toBase64Url = (obj: any): string => {
    try {
      const str = JSON.stringify(obj);
      if (typeof window !== "undefined" && typeof window.btoa === "function") {
        return window.btoa(unescape(encodeURIComponent(str)))
          .replace(/=/g, "")
          .replace(/\+/g, "-")
          .replace(/\//g, "_");
      }
      return Buffer.from(str)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
    } catch {
      return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
    }
  };

  return `${toBase64Url(header)}.${toBase64Url(payload)}.standalone_signature_verified`;
};

export const sampleDashboardCount = {
  totalVideos: 48,
  totalPosts: 112,
  totalUsers: 1420,
  totalActiveUsers: 1350,
  totalVerifiedUsers: 380,
  totalSongs: 76,
  totalVerificationRequests: 16,
  totalReports: 7,
};

export const sampleUsers = [
  {
    _id: "usr_101",
    name: "Alex Johnson",
    userName: "alex_j",
    uniqueId: "UID_1001",
    email: "alex@example.com",
    gender: "male",
    country: "United States",
    isBlock: false,
    isVerified: true,
    isFake: false,
    coin: 450,
    image: "/images/user.png",
    createdAt: "2026-09-20T10:00:00.000Z",
  },
  {
    _id: "usr_102",
    name: "Sarah Williams",
    userName: "sarah_w",
    uniqueId: "UID_1002",
    email: "sarah@example.com",
    gender: "female",
    country: "United Kingdom",
    isBlock: false,
    isVerified: true,
    isFake: false,
    coin: 820,
    image: "/images/user.png",
    createdAt: "2026-09-22T12:30:00.000Z",
  },
  {
    _id: "usr_103",
    name: "Michael Brown",
    userName: "mike_b",
    uniqueId: "UID_1003",
    email: "mike@example.com",
    gender: "male",
    country: "Canada",
    isBlock: false,
    isVerified: false,
    isFake: false,
    coin: 150,
    image: "/images/user.png",
    createdAt: "2026-09-25T14:15:00.000Z",
  },
  {
    _id: "usr_104",
    name: "Elena Rostova",
    userName: "elena_r",
    uniqueId: "UID_1004",
    email: "elena@example.com",
    gender: "female",
    country: "Germany",
    isBlock: false,
    isVerified: true,
    isFake: false,
    coin: 1200,
    image: "/images/user.png",
    createdAt: "2026-09-28T08:45:00.000Z",
  },
  {
    _id: "usr_105",
    name: "Demo Creator",
    userName: "creator_bot",
    uniqueId: "UID_1005",
    email: "bot@example.com",
    gender: "female",
    country: "India",
    isBlock: false,
    isVerified: false,
    isFake: true,
    coin: 600,
    image: "/images/user.png",
    createdAt: "2026-09-29T10:00:00.000Z",
  },
];

export const samplePosts = [
  {
    _id: "post_101",
    caption: "Welcome to Shortie! Exciting new updates rolling out soon #viral #community",
    postImage: "/images/loginimage2.png",
    userId: { _id: "usr_101", name: "Alex Johnson", userName: "alex_j", uniqueId: "UID_1001", image: "/images/user.png" },
    user: { _id: "usr_101", name: "Alex Johnson", userName: "alex_j", uniqueId: "UID_1001", image: "/images/user.png" },
    likes: 142,
    comments: 18,
    isFake: false,
    createdAt: "2026-09-28T09:00:00.000Z",
  },
  {
    _id: "post_102",
    caption: "Sunset photography session by the beach 🌅 #photography #vibes",
    postImage: "/images/loginimage2.png",
    userId: { _id: "usr_102", name: "Sarah Williams", userName: "sarah_w", uniqueId: "UID_1002", image: "/images/user.png" },
    user: { _id: "usr_102", name: "Sarah Williams", userName: "sarah_w", uniqueId: "UID_1002", image: "/images/user.png" },
    likes: 284,
    comments: 34,
    isFake: false,
    createdAt: "2026-09-29T17:30:00.000Z",
  },
];

export const sampleVideos = [
  {
    _id: "vid_101",
    caption: "Amazing dance moves! Check this out #dance #trending",
    videoUrl: "",
    videoImage: "/images/loginimage2.png",
    userId: { _id: "usr_102", name: "Sarah Williams", userName: "sarah_w", uniqueId: "UID_1002", image: "/images/user.png" },
    user: { _id: "usr_102", name: "Sarah Williams", userName: "sarah_w", uniqueId: "UID_1002", image: "/images/user.png" },
    likes: 389,
    comments: 42,
    views: 1200,
    isFake: false,
    createdAt: "2026-09-29T11:00:00.000Z",
  },
  {
    _id: "vid_102",
    caption: "Quick guitar acoustic session 🎸 #music #acoustic",
    videoUrl: "",
    videoImage: "/images/loginimage2.png",
    userId: { _id: "usr_103", name: "Michael Brown", userName: "mike_b", uniqueId: "UID_1003", image: "/images/user.png" },
    user: { _id: "usr_103", name: "Michael Brown", userName: "mike_b", uniqueId: "UID_1003", image: "/images/user.png" },
    likes: 512,
    comments: 61,
    views: 2450,
    isFake: false,
    createdAt: "2026-09-30T15:20:00.000Z",
  },
];

export const sampleWithdrawRequests = [
  {
    _id: "wr_101",
    uniqueId: "WREQ_9011",
    userId: "usr_101",
    user: {
      _id: "usr_101",
      name: "Alex Johnson",
      userName: "alex_j",
      uniqueId: "UID_1001",
      image: "/images/user.png",
    },
    amount: 150,
    coin: 1500,
    paymentGateway: "PayPal",
    requestDate: "2026-10-01",
    createdAt: "2026-10-01T10:00:00.000Z",
    status: 1, // Pending
    paymentDetails: "alex.pay@example.com",
  },
  {
    _id: "wr_102",
    uniqueId: "WREQ_9012",
    userId: "usr_102",
    user: {
      _id: "usr_102",
      name: "Sarah Williams",
      userName: "sarah_w",
      uniqueId: "UID_1002",
      image: "/images/user.png",
    },
    amount: 250,
    coin: 2500,
    paymentGateway: "Bank Transfer",
    requestDate: "2026-10-02",
    createdAt: "2026-10-02T14:30:00.000Z",
    status: 1, // Pending
    paymentDetails: "Bank: Chase, Account: ****5678",
  },
  {
    _id: "wr_103",
    uniqueId: "WREQ_9008",
    userId: "usr_104",
    user: {
      _id: "usr_104",
      name: "Elena Rostova",
      userName: "elena_r",
      uniqueId: "UID_1004",
      image: "/images/user.png",
    },
    amount: 500,
    coin: 5000,
    paymentGateway: "Stripe",
    requestDate: "2026-09-28",
    createdAt: "2026-09-28T09:15:00.000Z",
    status: 2, // Accepted
    paymentDetails: "elena.stripe@example.com",
  },
];

export const sampleVerificationRequests = [
  {
    _id: "vr_101",
    userId: "usr_103",
    user: {
      _id: "usr_103",
      name: "Michael Brown",
      userName: "mike_b",
      uniqueId: "UID_1003",
      image: "/images/user.png",
    },
    nameOnDocument: "Passport",
    profileSelfie: "/images/user.png",
    document: "/images/loginimage2.png",
    status: 1, // Pending
    date: "2026-10-01T11:00:00.000Z",
    createdAt: "2026-10-01T11:00:00.000Z",
  },
  {
    _id: "vr_102",
    userId: "usr_101",
    user: {
      _id: "usr_101",
      name: "Alex Johnson",
      userName: "alex_j",
      uniqueId: "UID_1001",
      image: "/images/user.png",
    },
    nameOnDocument: "National ID",
    profileSelfie: "/images/user.png",
    document: "/images/loginimage2.png",
    status: 2, // Accepted
    date: "2026-09-20T08:00:00.000Z",
    createdAt: "2026-09-20T08:00:00.000Z",
  },
];

export const sampleSongCategories = [
  { _id: "scat_1", name: "Pop", image: "/images/loginimage2.png", createdAt: "2026-09-01T00:00:00.000Z" },
  { _id: "scat_2", name: "Hip-Hop & R&B", image: "/images/loginimage2.png", createdAt: "2026-09-01T00:00:00.000Z" },
  { _id: "scat_3", name: "Acoustic & Chill", image: "/images/loginimage2.png", createdAt: "2026-09-01T00:00:00.000Z" },
];

export const sampleSongs = [
  {
    _id: "song_101",
    title: "Summer Vibes",
    singer: "DJ Breeze",
    image: "/images/loginimage2.png",
    songUrl: "",
    songTime: "02:45",
    songCategory: { _id: "scat_1", name: "Pop" },
    songCategoryId: "scat_1",
    createdAt: "2026-09-10T00:00:00.000Z",
  },
  {
    _id: "song_102",
    title: "Midnight Cruise",
    singer: "Luna Wave",
    image: "/images/loginimage2.png",
    songUrl: "",
    songTime: "03:12",
    songCategory: { _id: "scat_3", name: "Acoustic & Chill" },
    songCategoryId: "scat_3",
    createdAt: "2026-09-12T00:00:00.000Z",
  },
];

export const sampleReports = [
  {
    _id: "rep_101",
    user: { _id: "usr_101", name: "Alex Johnson", userName: "alex_j", image: "/images/user.png" },
    toUserId: { _id: "usr_103", name: "Michael Brown", userName: "mike_b", image: "/images/user.png" },
    reason: "Inappropriate language or behavior",
    description: "User posted derogatory remarks in the comments section.",
    status: "pending",
    createdAt: "2026-10-02T09:30:00.000Z",
  },
];

export const sampleComplaints = [
  {
    _id: "comp_101",
    user: { _id: "usr_102", name: "Sarah Williams", userName: "sarah_w", email: "sarah@example.com", image: "/images/user.png" },
    contact: "+1 555-019-2831",
    message: "I completed a coin top-up 2 hours ago, but the coins have not reflected in my balance yet.",
    image: "/images/loginimage2.png",
    status: 1, // Pending
    createdAt: "2026-10-02T12:00:00.000Z",
  },
];

export const sampleCoinPlanTransactions = [
  {
    _id: "cpt_101",
    user: { _id: "usr_101", name: "Alex Johnson", userName: "alex_j", image: "/images/user.png" },
    coinPlan: { coin: 500, amount: 4.99 },
    amount: 4.99,
    coin: 500,
    paymentGateway: "Stripe",
    createdAt: "2026-10-01T15:20:00.000Z",
  },
  {
    _id: "cpt_102",
    user: { _id: "usr_102", name: "Sarah Williams", userName: "sarah_w", image: "/images/user.png" },
    coinPlan: { coin: 1200, amount: 9.99 },
    amount: 9.99,
    coin: 1200,
    paymentGateway: "PayPal",
    createdAt: "2026-10-02T18:45:00.000Z",
  },
];

export const sampleBanners = [
  {
    _id: "ban_1",
    image: "/images/loginimage2.png",
    url: "https://shortie.app/promo",
    isActive: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
];

export const sampleGiftCategories = [
  { _id: "gcat_1", name: "Popular", image: "/images/coin.png" },
  { _id: "gcat_2", name: "Romantic", image: "/images/coin.png" },
];

export const sampleGifts = [
  { _id: "gift_1", name: "Heart", coin: 20, image: "/images/coin.png", type: 0, category: { _id: "gcat_1", name: "Popular" } },
  { _id: "gift_2", name: "Crown", coin: 100, image: "/images/coin.png", type: 0, category: { _id: "gcat_1", name: "Popular" } },
];

export const sampleStaff = [
  {
    _id: "staff_1",
    name: "Admin Staff",
    email: "staff@shortie.app",
    role: { _id: "role_2", name: "Moderator" },
    isActive: true,
    createdAt: "2026-09-15T00:00:00.000Z",
  },
];

export const sampleHashtags = [
  { _id: "tag_1", hashTag: "trending", banner: "/images/loginimage2.png", count: 185 },
  { _id: "tag_2", hashTag: "dance", banner: "/images/loginimage2.png", count: 124 },
  { _id: "tag_3", hashTag: "comedy", banner: "/images/loginimage2.png", count: 98 },
];

export const sampleStories = [
  {
    _id: "story_101",
    user: { _id: "usr_101", name: "Alex Johnson", userName: "alex_j", image: "/images/user.png" },
    image: "/images/loginimage2.png",
    createdAt: "2026-10-02T08:00:00.000Z",
  },
];

export const sampleSettings = {
  _id: "setting_standalone_1",
  appName: "",
  privacyPolicyLink: "https://shortie.app/privacy",
  termsOfUsePolicyLink: "https://shortie.app/terms",
  isAppActive: true,
  loginBonus: 100,
  isFakeData: false,
  agoraKey: "",
  agoraCertificate: "",
  currencySymbol: "$",
  stripeSecretKey: "",
  stripePublishableKey: "",
  razorpayKey: "",
  createdAt: "2026-09-01T00:00:00.000Z",
};

export const sampleLanguages = [
  { _id: "lang_1", name: "English", languageCode: "en", isDefault: true },
  { _id: "lang_2", name: "Spanish", languageCode: "es", isDefault: false },
  { _id: "lang_3", name: "French", languageCode: "fr", isDefault: false },
  { _id: "lang_4", name: "German", languageCode: "de", isDefault: false },
  { _id: "lang_5", name: "Hindi", languageCode: "hi", isDefault: false },
];

export const sampleCoinPlans = [
  { _id: "cp_1", coin: 100, amount: 0.99, isTopSeller: true },
  { _id: "cp_2", coin: 500, amount: 4.99, isTopSeller: false },
  { _id: "cp_3", coin: 1200, amount: 9.99, isTopSeller: false },
];

export const sampleRoles = [
  { _id: "role_1", name: "Super Admin", permissions: ["all"] },
  { _id: "role_2", name: "Moderator", permissions: ["posts", "videos", "reports"] },
  { _id: "role_3", name: "Support Staff", permissions: ["support", "users"] },
];

export const sampleCurrencies = [
  { _id: "curr_1", name: "US Dollar", symbol: "$", currencyCode: "USD", isDefault: true, countryCode: "US" },
  { _id: "curr_2", name: "Euro", symbol: "€", currencyCode: "EUR", isDefault: false, countryCode: "EU" },
  { _id: "curr_3", name: "Indian Rupee", symbol: "₹", currencyCode: "INR", isDefault: false, countryCode: "IN" },
];

export const getStandaloneMockResponse = (
  method: string = "GET",
  url: string = "",
  payload?: any
): any => {
  const normalizedMethod = method.toUpperCase();
  const normalizedUrl = url.toLowerCase();

  // Login
  if (normalizedUrl.includes("admin/login") || normalizedUrl.includes("login")) {
    const email = payload?.email || "admin@gmail.com";
    return {
      status: true,
      message: "Login Successfully (Standalone Mode)",
      role: "admin",
      token: createStandaloneToken(email),
      admin: {
        _id: "standalone_admin_id",
        name: "Admin",
        email: email,
        role: "admin",
        flag: true,
      },
    };
  }

  // Profile
  if (normalizedUrl.includes("admin/profile") || normalizedUrl.includes("profile")) {
    return {
      status: true,
      message: "Profile loaded",
      data: {
        _id: "standalone_admin_id",
        name: "Admin",
        email: "admin@gmail.com",
        role: "admin",
        flag: true,
        image: "/images/user.png",
      },
    };
  }

  // Dashboard Count
  if (normalizedUrl.includes("dashboardcount")) {
    return {
      status: true,
      message: "Get admin panel dashboard count.",
      data: sampleDashboardCount,
    };
  }

  // Chart Analytic for Users / Posts / Videos
  if (normalizedUrl.includes("chartanalyticofuser")) {
    return {
      status: true,
      message: "Success",
      data: {
        totalUsers: 1420,
        activeUsers: 1350,
        blockedUsers: 70,
      },
    };
  }

  if (normalizedUrl.includes("chartanalytic")) {
    return {
      status: true,
      message: "Success",
      chartUser: [
        { _id: "2026-09-25", count: 18 },
        { _id: "2026-09-26", count: 24 },
        { _id: "2026-09-27", count: 35 },
        { _id: "2026-09-28", count: 42 },
        { _id: "2026-09-29", count: 38 },
        { _id: "2026-09-30", count: 55 },
        { _id: "2026-10-01", count: 62 },
      ],
      chartPost: [
        { _id: "2026-09-25", count: 12 },
        { _id: "2026-09-26", count: 19 },
        { _id: "2026-09-27", count: 28 },
        { _id: "2026-09-28", count: 32 },
        { _id: "2026-09-29", count: 25 },
        { _id: "2026-09-30", count: 40 },
        { _id: "2026-10-01", count: 47 },
      ],
      chartVideo: [
        { _id: "2026-09-25", count: 8 },
        { _id: "2026-09-26", count: 14 },
        { _id: "2026-09-27", count: 21 },
        { _id: "2026-09-28", count: 23 },
        { _id: "2026-09-29", count: 19 },
        { _id: "2026-09-30", count: 31 },
        { _id: "2026-10-01", count: 36 },
      ],
    };
  }

  // Withdraw Requests
  if (normalizedUrl.includes("withdrawrequest")) {
    return {
      status: true,
      message: "Success",
      data: sampleWithdrawRequests,
      total: sampleWithdrawRequests.length,
    };
  }

  // Verification Requests
  if (normalizedUrl.includes("verificationrequest")) {
    return {
      status: true,
      message: "Success",
      data: sampleVerificationRequests,
      total: sampleVerificationRequests.length,
    };
  }

  // Complaints / Support
  if (normalizedUrl.includes("complaint")) {
    return {
      status: true,
      message: "Success",
      data: sampleComplaints,
      total: sampleComplaints.length,
    };
  }

  // Reports
  if (normalizedUrl.includes("report")) {
    return {
      status: true,
      message: "Success",
      data: sampleReports,
      total: sampleReports.length,
    };
  }

  // Song Categories
  if (normalizedUrl.includes("songcategory")) {
    return {
      status: true,
      message: "Success",
      data: sampleSongCategories,
      total: sampleSongCategories.length,
    };
  }

  // Songs
  if (normalizedUrl.includes("song")) {
    return {
      status: true,
      message: "Success",
      data: sampleSongs,
      total: sampleSongs.length,
    };
  }

  // Coin Plan Transactions / Admin Earnings
  if (normalizedUrl.includes("fetchusercoinplantransactions") || normalizedUrl.includes("admin/coinplan/fetchusercoinplan")) {
    return {
      status: true,
      message: "Success",
      data: sampleCoinPlanTransactions,
      total: sampleCoinPlanTransactions.length,
      totalAdminEarnings: 3450,
    };
  }

  // Coin Plan
  if (normalizedUrl.includes("coinplan")) {
    return {
      status: true,
      message: "Success",
      data: sampleCoinPlans,
      total: sampleCoinPlans.length,
    };
  }

  // Banners
  if (normalizedUrl.includes("banner")) {
    return {
      status: true,
      message: "Success",
      data: sampleBanners,
      total: sampleBanners.length,
    };
  }

  // Gift Categories
  if (normalizedUrl.includes("giftcategory")) {
    return {
      status: true,
      message: "Success",
      data: sampleGiftCategories,
      total: sampleGiftCategories.length,
    };
  }

  // Gifts
  if (normalizedUrl.includes("gift")) {
    return {
      status: true,
      message: "Success",
      data: sampleGifts,
      total: sampleGifts.length,
    };
  }

  // Sub Admin / Staff
  if (normalizedUrl.includes("subadmin")) {
    return {
      status: true,
      message: "Success",
      data: sampleStaff,
      total: sampleStaff.length,
    };
  }

  // Hashtags
  if (normalizedUrl.includes("hashtag")) {
    return {
      status: true,
      message: "Success",
      data: sampleHashtags,
      total: sampleHashtags.length,
    };
  }

  // Stories
  if (normalizedUrl.includes("story")) {
    return {
      status: true,
      message: "Success",
      data: sampleStories,
      story: sampleStories,
      total: sampleStories.length,
      totalStory: sampleStories.length,
      totalFakeStory: 0,
    };
  }

  // Live Videos
  if (normalizedUrl.includes("livevideo")) {
    return {
      status: true,
      message: "Success",
      data: sampleVideos,
      videos: sampleVideos,
      total: sampleVideos.length,
      totalVideo: sampleVideos.length,
    };
  }

  // Settings
  if (normalizedUrl.includes("setting")) {
    return {
      status: true,
      message: "Success",
      setting: sampleSettings,
      data: sampleSettings,
    };
  }

  // Currency
  if (normalizedUrl.includes("currency/getdefault")) {
    return {
      status: true,
      message: "Success",
      data: sampleCurrencies[0],
    };
  }

  if (normalizedUrl.includes("currency")) {
    return {
      status: true,
      message: "Success",
      data: sampleCurrencies,
      total: sampleCurrencies.length,
    };
  }

  // Users
  if (normalizedUrl.includes("user")) {
    return {
      status: true,
      message: "Success",
      data: sampleUsers,
      total: sampleUsers.length,
      realUsers: sampleUsers.filter((u) => !u.isFake),
      totalRealUser: sampleUsers.filter((u) => !u.isFake).length,
      fakeUsers: sampleUsers.filter((u) => u.isFake),
      totalFakeUser: sampleUsers.filter((u) => u.isFake).length,
    };
  }

  // Posts
  if (normalizedUrl.includes("post")) {
    return {
      status: true,
      message: "Success",
      data: samplePosts,
      total: samplePosts.length,
      post: samplePosts,
    };
  }

  // Videos
  if (normalizedUrl.includes("video")) {
    return {
      status: true,
      message: "Success",
      data: sampleVideos,
      videos: sampleVideos,
      total: sampleVideos.length,
      totalVideo: sampleVideos.length,
    };
  }

  // Languages
  if (normalizedUrl.includes("langauge") || normalizedUrl.includes("language")) {
    return {
      status: true,
      message: "Success",
      data: sampleLanguages,
      total: sampleLanguages.length,
    };
  }

  // Roles
  if (normalizedUrl.includes("role")) {
    return {
      status: true,
      message: "Success",
      data: sampleRoles,
      total: sampleRoles.length,
    };
  }

  // If it's a mutating action (POST, PATCH, PUT, DELETE), simulate success
  if (["POST", "PATCH", "PUT", "DELETE"].includes(normalizedMethod)) {
    return {
      status: true,
      message: "Action successful (Standalone Mode)",
      data: payload?.data || payload || {},
    };
  }

  // Default empty fallback for any other table or list
  return {
    status: true,
    message: "Success",
    data: [],
    total: 0,
  };
};
