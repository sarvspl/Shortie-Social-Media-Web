// Standalone / Offline Mock Service for Shortie Admin Panel
// Allows the admin panel to run standalone on cPanel or local preview without requiring a backend or database.

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
    email: "alex@example.com",
    gender: "male",
    country: "United States",
    isBlock: false,
    isVerified: true,
    isFake: false,
    coin: 450,
    image: "/images/noImage.png",
    createdAt: "2026-09-20T10:00:00.000Z",
  },
  {
    _id: "usr_102",
    name: "Sarah Williams",
    userName: "sarah_w",
    email: "sarah@example.com",
    gender: "female",
    country: "United Kingdom",
    isBlock: false,
    isVerified: true,
    isFake: false,
    coin: 820,
    image: "/images/noImage.png",
    createdAt: "2026-09-22T12:30:00.000Z",
  },
  {
    _id: "usr_103",
    name: "Michael Brown",
    userName: "mike_b",
    email: "mike@example.com",
    gender: "male",
    country: "Canada",
    isBlock: false,
    isVerified: false,
    isFake: false,
    coin: 150,
    image: "/images/noImage.png",
    createdAt: "2026-09-25T14:15:00.000Z",
  },
  {
    _id: "usr_104",
    name: "Elena Rostova",
    userName: "elena_r",
    email: "elena@example.com",
    gender: "female",
    country: "Germany",
    isBlock: false,
    isVerified: true,
    isFake: false,
    coin: 1200,
    image: "/images/noImage.png",
    createdAt: "2026-09-28T08:45:00.000Z",
  },
];

export const samplePosts = [
  {
    _id: "post_101",
    caption: "Welcome to Shortie! Exciting new updates rolling out soon #viral #community",
    postImage: "/images/loginimage2.png",
    userId: { _id: "usr_101", name: "Alex Johnson", userName: "alex_j", image: "/images/noImage.png" },
    likes: 142,
    comments: 18,
    isFake: false,
    createdAt: "2026-09-28T09:00:00.000Z",
  },
  {
    _id: "post_102",
    caption: "Sunset photography session by the beach 🌅 #photography #vibes",
    postImage: "/images/loginimage2.png",
    userId: { _id: "usr_102", name: "Sarah Williams", userName: "sarah_w", image: "/images/noImage.png" },
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
    userId: { _id: "usr_102", name: "Sarah Williams", userName: "sarah_w", image: "/images/noImage.png" },
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
    userId: { _id: "usr_103", name: "Michael Brown", userName: "mike_b", image: "/images/noImage.png" },
    likes: 512,
    comments: 61,
    views: 2450,
    isFake: false,
    createdAt: "2026-09-30T15:20:00.000Z",
  },
];

export const sampleSettings = {
  _id: "setting_standalone_1",
  appName: "Shortie",
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
  if (normalizedUrl.includes("profile")) {
    return {
      status: true,
      message: "Profile loaded",
      data: {
        _id: "standalone_admin_id",
        name: "Admin",
        email: "admin@gmail.com",
        role: "admin",
        flag: true,
        image: "/images/noImage.png",
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
      data: { _id: "curr_1", name: "US Dollar", symbol: "$", currencyCode: "USD", isDefault: true },
    };
  }

  if (normalizedUrl.includes("currency")) {
    return {
      status: true,
      message: "Success",
      data: [
        { _id: "curr_1", name: "US Dollar", symbol: "$", currencyCode: "USD", isDefault: true, countryCode: "US" },
      ],
    };
  }

  // Users
  if (normalizedUrl.includes("user")) {
    return {
      status: true,
      message: "Success",
      data: sampleUsers,
      total: sampleUsers.length,
      realUsers: sampleUsers,
      totalRealUser: sampleUsers.length,
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
      total: sampleVideos.length,
      video: sampleVideos,
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

  // Coin Plan
  if (normalizedUrl.includes("coinplan")) {
    return {
      status: true,
      message: "Success",
      data: sampleCoinPlans,
      total: sampleCoinPlans.length,
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
