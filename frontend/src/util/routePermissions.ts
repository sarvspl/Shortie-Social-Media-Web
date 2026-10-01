/**
 * Mapping between application routes and their corresponding module names.
 * This is used for route-level permission validation.
 */
export const routeModuleMapping: Record<string, string> = {
  "/settings": "Setting",
  "/settings/ads": "Setting",
  "/settings/storage": "Setting",
  "/settings/payment": "Setting",
  "/settings/reports": "Setting",
  "/settings/profile": "Setting",
  "/settings/currency": "Setting",
  "/settings/profilemanagement": "Setting",
  "/settings/settingPage": "Setting",
  "/settings/withdraw": "Setting",
  "/banner": "Recharge Banner",
  "/giftPage": "Gift",
  "/reactions": "Reaction",
  "/hashTagTable": "Hashtag",
  "/userTable": "User",
  "/viewProfile": "User",
  "/verificationRequestTable": "Verification Request",
  "/language": "Language",
  "/withdrawRequest": "Withdraw Request",
  "/support": "Support Request",
  "/reportType": "Report",
  "/coinPlan": "Coin Plan",
  "/order-history": "Order History",
  "/CoinPlanHistory": "Order History",
  "/songTable": "Song",
  "/postTable": "Post",
  "/story": "Story",
  "/videoTable": "Videos",
  "/liveVideo": "Live Video",
  "/roles": "Access Role",
  "/staff": "Staff",
};

/**
 * Routes that are always allowed for authenticated users.
 */
export const alwaysAllowedRoutes = ["/dashboard", "/owner"];

/**
 * Routes that are public and don't require authentication.
 */
export const publicRoutes = ["/", "/forgotPassword", "/Registration", "/share"];
