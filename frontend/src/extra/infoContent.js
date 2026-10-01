// Storage Setting
export const digitalOceanContent = [
    {
        label: "Endpoint",
        description: "Tells your app where to connect to your Space for uploads/downloads.",
    },
    {
        label: "Host Name",
        description: "Defines the base URL for serving files from your Space region.",
    },
    {
        label: "Secret Key",
        description: "Secures access to your files. Keep this private.",
    },
    {
        label: "Access Key",
        description: "Works with Secret Key to authenticate file requests.",
    },
    {
        label: "Bucket Name",
        description: "Specifies which Space stores your uploaded files.",
    },
    {
        label: "Region",
        description: "Decides the data center (e.g., blr1) — affects speed and latency.",
    },
];

export const awsContent = [
    {
        label: "Endpoint",
        description: "Connects your app to AWS S3 for file storage.",
    },
    {
        label: "Host Name",
        description: "Used to generate URLs for accessing stored files.",
    },
    {
        label: "Access Key",
        description: "Identifies your AWS account when making storage requests.",
    },
    {
        label: "Secret Key",
        description: "Secures those requests. Keep this hidden.",
    },
    {
        label: "Bucket Name",
        description: "Defines which S3 bucket your files are stored in.",
    },
    {
        label: "Region",
        description: "Specifies bucket’s location (e.g., ap-south-1). Impacts latency & costs.",
    },
];

export const storageOptionContent = [
    {
        label: "Local",
        description: "Stores files on your own server. Easy setup but limited space.",
    },
    {
        label: "AWS S3",
        description: "Scalable storage from Amazon. Best for large-scale apps.",
    },
    {
        label: "DigitalOcean Space",
        description: "Affordable S3-compatible storage. Good for small to medium apps.",
    },
];


// Payment Setting 
export const razorpayContent = [
    {
        label: "Razorpay",
        description: "Toggle to enable or disable Razorpay as a payment method.",
    },
    {
        label: "Razorpay Id",
        description: (
            <>
                Public Key ID for Razorpay integration.{" "}
                <a
                    href="https://dashboard.razorpay.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0d6efd", textDecoration: "underline" }}
                >
                    Get it from Razorpay Dashboard
                </a>
            </>
        ),
    },
    {
        label: "Razorpay Secret Key",
        description: (
            <>
                Secret API key paired with the Key ID for secure transactions.{" "}
                <a
                    href="https://dashboard.razorpay.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0d6efd", textDecoration: "underline" }}
                >
                    Manage it in Razorpay Dashboard
                </a>
            </>
        ),
    },
];

export const stripeContent = [
    {
        label: "Stripe",
        description: "Toggle to enable or disable Stripe as a payment method.",
    },
    {
        label: "Stripe Publishable Key",
        description: (
            <>
                Public API key for Stripe payments. Required for client-side requests.{" "}
                <a
                    href="https://dashboard.stripe.com/apikeys"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0d6efd", textDecoration: "underline" }}
                >
                    Get it from Stripe Dashboard
                </a>
            </>
        ),
    },
    {
        label: "Stripe Secret Key",
        description: (
            <>
                Secret API key for server-side requests. Keep this key private.{" "}
                <a
                    href="https://dashboard.stripe.com/apikeys"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0d6efd", textDecoration: "underline" }}
                >
                    Manage it in Stripe Dashboard
                </a>
            </>
        ),
    },
];

export const googlePlayContent = [
    {
        label: "Google Play",
        description: (
            <>
                Toggle to enable or disable Google Play billing for in-app purchases.{" "}
                <a
                    href="https://developer.android.com/google/play/billing"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0d6efd", textDecoration: "underline" }}
                >
                    Learn more at Google Play Billing Docs
                </a>
            </>
        ),
    },
];

export const flutterWaveContent = [
    {
        label: "Flutterwave",
        description: "Enable or disable Flutterwave as a payment method.",
    },
    {
        label: "Flutterwave ID",
        description: (
            <>
                API key for Flutterwave integration.{" "}
                <a
                    href="https://dashboard.flutterwave.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0d6efd", textDecoration: "underline" }}
                >
                    Get it from Flutterwave Dashboard
                </a>
            </>
        ),
    },
];

export const paystackContent = [
    {
        label: "Paystack",
        description: "Toggle to enable or disable Paystack as a payment method.",
    },
    {
        label: "Paystack Public Key",
        description: (
            <>
                Public API key for Paystack payments. Required for client-side requests.{" "}
                <a
                    href="https://dashboard.paystack.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0d6efd", textDecoration: "underline" }}
                >
                    Get it from Paystack Dashboard
                </a>
            </>
        ),
    },
    {
        label: "Paystack Secret Key",
        description: (
            <>
                Secret API key for server-side requests. Keep this key private.{" "}
                <a
                    href="https://dashboard.paystack.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0d6efd", textDecoration: "underline" }}
                >
                    Manage it in Paystack Dashboard
                </a>
            </>
        ),
    },
];

export const paypalContent = [
    {
        label: "PayPal",
        description: "Toggle to enable or disable PayPal as a payment method.",
    },
    {
        label: "PayPal Client Id",
        description: (
            <>
                Client ID for PayPal integration. Used for identifying your application.{" "}
                <a
                    href="https://developer.paypal.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0d6efd", textDecoration: "underline" }}
                >
                    Get it from PayPal Developer Dashboard
                </a>
            </>
        ),
    },
    {
        label: "PayPal Secret Key",
        description: (
            <>
                Secret key paired with the Client ID for secure transactions. Keep this private.{" "}
                <a
                    href="https://developer.paypal.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0d6efd", textDecoration: "underline" }}
                >
                    Manage it in PayPal Developer Dashboard
                </a>
            </>
        ),
    },
];

export const cashfreeContent = [
    {
        label: "Cashfree",
        description: "Toggle to enable or disable Cashfree as a payment method.",
    },
    {
        label: "Cashfree Client Id",
        description: (
            <>
                Client ID for Cashfree integration. Used for API authentication.{" "}
                <a
                    href="https://merchant.cashfree.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0d6efd", textDecoration: "underline" }}
                >
                    Get it from Cashfree Merchant Dashboard
                </a>
            </>
        ),
    },
    {
        label: "Cashfree Client Secret",
        description: (
            <>
                Client Secret paired with the Client ID for secure API calls. Keep this private.{" "}
                <a
                    href="https://merchant.cashfree.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0d6efd", textDecoration: "underline" }}
                >
                    Manage it in Cashfree Merchant Dashboard
                </a>
            </>
        ),
    },
];

// Ads Setting
export const androidAdsContent = [
    {
        label: "Android Google Reward",
        description: "Ad unit ID for rewarded ads on Android (users watch ads to earn rewards).",
    },
    {
        label: "Android Google Native",
        description: "Ad unit ID for native ads on Android (blend into app content).",
    },
    {
        label: "Android Google Native Video",
        description: "Ad unit ID for native video ads on Android (video ads integrated into app content).",
    },
];

export const iosAdsContent = [
    {
        label: "iOS Google Reward",
        description: "Ad unit ID for rewarded ads on iOS (users watch ads to earn rewards).",
    },
    {
        label: "iOS Google Native",
        description: "Ad unit ID for native ads on iOS (seamlessly integrated with UI).",
    },
    {
        label: "iOS Google Native Video",
        description: "Ad unit ID for native video ads on iOS (video ads integrated into app content).",
    },
];

export const globalAdsContent = [
    {
        label: "Google Ads Master Switch",
        description: "Toggle to enable or disable all Google Ads placements across the application.",
    },
];

export const adPositionContent = [
    {
        label: "Ad position in video",
        description: "Enable ads to be shown during video playback.",
    },
    {
        label: "Ad position in Feed",
        description: "Enable ads to be displayed within the content feed.",
    },
    {
        label: "Ad position in chat",
        description: "Enable ads to be displayed in the chat interface.",
    },
    {
        label: "Live streaming back button ad",
        description: "Enable ads to be shown when users click the back button from a live stream.",
    },
    {
        label: "Chat back button ads",
        description: "Enable ads to be shown when users click the back button from a chat.",
    },
];

export const adFrequencyContent = [
    {
        label: "Ad Frequency",
        description: "Define how many videos a user can watch before an ad is displayed to them. For example, setting this to 3 means an ad will be shown after every 3rd video.",
    },
];

// General Setting

export const resendApiSetting = [
    {
        label: "Resend Api Key",
        description: (
            <>
                Enter your Resend API key to enable email services in the application.
                This key is used to send emails such as OTP verification, password
                reset links, notifications, and other system emails.
                {" "}
                <a
                    href="https://resend.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                >
                    Get it from Resend Dashboard
                </a>
                .
            </>
        ),
    },
];

// export const zegoSetting = [
//     {
//         label: "Zego AppId",
//         description: (
//             <>
//                 Unique numeric ID for your ZegoCloud application.{" "}
//                 <a
//                     href="https://console.zegocloud.com/"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500"
//                 >
//                     Get it from Zego Console
//                 </a>
//                 .
//             </>
//         ),
//     },
//     {
//         label: "Zego App SignIn",
//         description: (
//             <>
//                 Security signature string used to authenticate with Zego services.{" "}
//                 <a
//                     href="https://docs.zegocloud.com/"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500"
//                 >
//                     Learn how to generate it
//                 </a>
//                 .
//             </>
//         ),
//     },
//     {
//         label: "Zego Server Secret",
//         description: (
//             <>
//                 Secret key for generating authentication tokens on your backend server.{" "}
//                 <a
//                     href="https://docs.zegocloud.com/article/14802"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500"
//                 >
//                     See Zego token generation guide
//                 </a>
//                 .
//             </>
//         ),
//     },
// ];

// export const shortsEffectSetting = [
//     {
//         label: "Shorts Effect Setting",
//         description: (
//             <>
//                 Customize visual effects for your short videos, including filters,
//                 transitions, and special effects.{" "}
//                 <a
//                     href="https://yourdocs.example.com/shorts-effects"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500"
//                 >
//                     Learn more
//                 </a>
//                 .
//             </>
//         ),
//     },
//     {
//         label: "Filter Intensity",
//         description: (
//             <>
//                 Adjust the strength of applied filters to make your videos subtle or vivid.{" "}
//                 <a
//                     href="https://yourdocs.example.com/filter-intensity"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500"
//                 >
//                     Guide
//                 </a>
//                 .
//             </>
//         ),
//     },
//     {
//         label: "Transition Speed",
//         description: (
//             <>
//                 Control the speed of scene transitions in your short videos. Faster transitions create more dynamic effects.{" "}
//                 <a
//                     href="https://yourdocs.example.com/transition-speed"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500"
//                 >
//                     Details
//                 </a>
//                 .
//             </>
//         ),
//     },
// ];

// export const waterMarkSetting = [
//     {
//         label: "Watermark Text",
//         description: (
//             <>
//                 Enter the text you want to appear as a watermark on your videos.{" "}
//                 <a
//                     href="https://yourdocs.example.com/watermark-text"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500"
//                 >
//                     Learn more
//                 </a>
//                 .
//             </>
//         ),
//     },
//     {
//         label: "Watermark Position",
//         description: (
//             <>
//                 Choose where the watermark appears on your videos: top-left, top-right, bottom-left, or bottom-right.{" "}
//                 <a
//                     href="https://yourdocs.example.com/watermark-position"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500"
//                 >
//                     Guide
//                 </a>
//                 .
//             </>
//         ),
//     },
//     {
//         label: "Watermark Opacity",
//         description: (
//             <>
//                 Adjust the transparency of the watermark. Lower values make it subtle, higher values make it more visible.{" "}
//                 <a
//                     href="https://yourdocs.example.com/watermark-opacity"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500"
//                 >
//                     Details
//                 </a>
//                 .
//             </>
//         ),
//     },
//     {
//         label: "Watermark Size",
//         description: (
//             <>
//                 Set the size of the watermark text or image. Bigger sizes are more prominent.{" "}
//                 <a
//                     href="https://yourdocs.example.com/watermark-size"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500"
//                 >
//                     Info
//                 </a>
//                 .
//             </>
//         ),
//     },
// ];

export const fakeDataSetting = [
    {
        label: "Fake Data",
        description: "Toggle to enable or disable fake data generation.",
    },
];

export const zegoSetting = [
    {
        label: "Zego AppId",
        description: (
            <>
                Enter the unique numeric App ID of your ZegoCloud application.
                This ID connects your app with Zego's real-time communication
                services such as live streaming, voice, and video calls.
                {" "}
                <a
                    href="https://console.zegocloud.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                >
                    Get it from Zego Console
                </a>
                .
            </>
        ),
    },
    {
        label: "Zego App SignIn",
        description: (
            <>
                Provide the App Sign key from your ZegoCloud project. It is used
                to authenticate the client application when connecting to Zego
                services.
                {" "}
                <a
                    href="https://docs.zegocloud.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                >
                    Learn more
                </a>
                .
            </>
        ),
    },
    {
        label: "Zego Server Secret",
        description: (
            <>
                Enter the server secret key used on the backend to generate
                secure authentication tokens for Zego services such as live
                streaming or real-time communication.
                {" "}
                <a
                    href="https://docs.zegocloud.com/article/14802"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                >
                    Token generation guide
                </a>
                .
            </>
        ),
    },
];


export const apiKeySetting = [
    {
        label: "Open AI Key",
        description: (
            <>
                Enter your OpenAI API key to enable AI-powered features in the
                application such as automated responses, AI tools, or smart content generation.
            </>
        ),
    },
    {
        label: "Resend API Key",
        description: (
            <>
                Provide the Resend API key used for sending transactional emails
                such as OTP verification, notifications, and account-related emails.
            </>
        ),
    },
    {
        label: "Android License Key",
        description: (
            <>
                Enter the Android license key required to activate third-party SDKs
                or services used in the Android version of the application.
            </>
        ),
    },
    {
        label: "iOS License Key",
        description: (
            <>
                Provide the iOS license key required to enable SDK features
                or services used in the iOS version of the application.
            </>
        ),
    },
];

export const shortsEffectSetting = [
    {
        label: "PK End Time (In Seconds)",
        description: (
            <>
                Set the duration of PK sessions in seconds. Once this time expires,
                the PK battle between users will automatically end.
            </>
        ),
    },
    {
        label: "Shorts Duration",
        description: (
            <>
                Define the maximum duration allowed for short videos in seconds.
                Users will not be able to upload or record shorts longer than this limit.
            </>
        ),
    },
    {
        label: "Watermark",
        description: (
            <>
                Enable or disable the watermark on videos. When active, a watermark
                will appear on uploaded or recorded videos in the application.
            </>
        ),
    },
];

export const waterMarkSetting = [
    {
        label: "Water Mark Status",
        description: (
            <>
                Enable or disable the watermark feature for media content in the
                application. When active, a watermark will be applied to images or
                videos to protect content from unauthorized use or copying.
            </>
        ),
    },
];


export const featureToggleSetting = [
    {
        label: "Fake Data",
        description: (
            <>
                Enable or disable fake data generation in the application. When enabled,
                the system will display dummy or sample data instead of real user data.
                This is useful for testing, development, or demo environments.
            </>
        ),
    },
    {
        label: "Effects State",
        description: (
            <>
                Enable or disable video effects in the application. When active,
                users will be able to apply filters and visual effects while
                creating or editing videos.
            </>
        ),
    },
];

export const deeplinkSettingContent = [
    {
        label: "Android Asset Links",
        description: (
            <>
                Enter the Android asset links configuration for your application. This
                allows you to verify ownership of your website and enable deep linking
                for Android devices. The format should be a JSON array of objects,
                each containing a "relation" array and a "target" object.
            </>
        ),
    },
    {
        label: "Apple App Site Association",
        description: (
            <>
                Provide the Apple App Site Association (AASA) configuration for your
                application. This JSON object enables universal links on iOS devices,
                allowing your app to open directly when a user taps a link to your
                website.
            </>
        ),
    },
];


// export const firebaseNotificationSetting = [
//     {
//         label: "Enable Notifications",
//         description: (
//             <>
//                 Toggle to enable or disable push notifications in your app.{" "}
//                 <a
//                     href="https://firebase.google.com/docs/cloud-messaging"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500"
//                 >
//                     Learn more
//                 </a>
//                 .
//             </>
//         ),
//     },
//     {
//         label: "Server Key / API Key",
//         description: (
//             <>
//                 Enter your Firebase Cloud Messaging server key or API key to authenticate notifications.{" "}
//                 <a
//                     href="https://console.firebase.google.com/"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500"
//                 >
//                     Firebase Console
//                 </a>
//                 .
//             </>
//         ),
//     },
//     {
//         label: "Notification Sound",
//         description: (
//             <>
//                 Select the default sound to play when a notification is received.{" "}
//                 <a
//                     href="https://firebase.google.com/docs/cloud-messaging/android/send-message"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500"
//                 >
//                     Guide
//                 </a>
//                 .
//             </>
//         ),
//     },
//     {
//         label: "Notification Channel",
//         description: (
//             <>
//                 Choose the channel or category for notifications (Android only). Helps organize notifications.{" "}
//                 <a
//                     href="https://firebase.google.com/docs/cloud-messaging/android/receive"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500"
//                 >
//                     Details
//                 </a>
//                 .
//             </>
//         ),
//     },
// ];

export const firebaseNotificationSetting = [
    {
        label: "Private Key JSON",
        description: (
            <>
                Paste the Firebase Service Account Private Key JSON here. This key is
                used by the server to authenticate with Firebase Cloud Messaging (FCM)
                and send push notifications to mobile applications.
                {" "}
                <a
                    href="https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                >
                    Generate it from Firebase Console
                </a>
                .
            </>
        ),
    },
];

export const mediaModerationSetting = [
    {
        label: "Sightengine API User",
        description: (
            <>
                Enter your Sightengine API User ID. This is required to authenticate
                requests to the Sightengine moderation service for analyzing images
                and videos uploaded in the application.
            </>
        ),
    },
    {
        label: "Sightengine API Secret",
        description: (
            <>
                Provide your Sightengine API Secret key. It is used together with the
                API User ID to securely connect with the Sightengine content
                moderation service.
            </>
        ),
    },
    {
        label: "Video Moderation Categories",
        description: (
            <>
                Select the categories that should be checked when users upload videos.
                The system will automatically detect and flag videos that contain
                restricted or inappropriate content such as nudity or adult material.
            </>
        ),
    },
    {
        label: "Image Moderation Categories",
        description: (
            <>
                Select the categories that should be checked when users upload images.
                The moderation system will scan images and flag content that violates
                the selected rules.
            </>
        ),
    },
];


export const loginBonusSetting = [
    {
        label: "Login Bonus",
        description: (
            <>
                Set the amount of bonus reward that users will receive when they log
                into the application. This bonus is typically used to encourage daily
                user activity and engagement within the app.
            </>
        ),
    },
];


// export const coinSetting = [
//     {
//         label: "Enable Coin System",
//         description: (
//             <>
//                 Toggle to enable or disable the in-app coin/reward system.{" "}
//                 <a
//                     href="https://docs.example.com/enable-coin-system"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500"
//                 >
//                     Learn more
//                 </a>
//                 .
//             </>
//         ),
//     },
//     {
//         label: "Coin Earn Rate",
//         description: (
//             <>
//                 Define how users earn coins (e.g., per video watched, per like, or per referral).{" "}
//                 <a
//                     href="https://docs.example.com/coin-earn-rate"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500"
//                 >
//                     Guide
//                 </a>
//                 .
//             </>
//         ),
//     },
//     {
//         label: "Coin Spend Rules",
//         description: (
//             <>
//                 Set rules for spending coins: redeeming for rewards, gifts, or unlocking content.{" "}
//                 <a
//                     href="https://docs.example.com/coin-spend-rules"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500"
//                 >
//                     Details
//                 </a>
//                 .
//             </>
//         ),
//     },
//     {
//         label: "Daily Coin Limit",
//         description: (
//             <>
//                 Define the maximum number of coins a user can earn in a single day.{" "}
//                 <a
//                     href="https://docs.example.com/daily-coin-limit"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500"
//                 >
//                     Info
//                 </a>
//                 .
//             </>
//         ),
//     },
// ];

export const coinSetting = [
    {
        label: "Daily Login Bonus",
        description: (
            <>
                Set the number of coins users receive as a reward for logging into the
                application daily. This helps increase user engagement and retention.
            </>
        ),
    },
    {
        label: "Coin Amount ($)",
        description: (
            <>
                Enter the dollar amount that will be used as the base value for coin
                conversion during withdrawal. This amount represents the real currency equivalent.
            </>
        ),
    },
    {
        label: "Coin Withdrawal",
        description: (
            <>
                Specify how many in-app coins are required to equal the defined dollar
                amount. This determines the conversion rate between coins and real
                money for withdrawals.
            </>
        ),
    },
];

export const appSetting = [

    {
        label: "Privacy Policy Link",
        description: (
            <>
                Provide the URL of your application's Privacy Policy page. This link
                informs users how their data is collected, used, and protected.
            </>
        ),
    },
    {
        label: "Terms & Conditions",
        description: (
            <>
                Add the URL of your Terms and Conditions page. This page defines the
                rules, guidelines, and legal agreements for using your application.
            </>
        ),
    },
    {
        label: "Android App Version",
        description: (
            <>
                Specify the latest version of the Android application. This is used
                to check updates and notify users if a new version is available.
            </>
        ),
    },
    {
        label: "IOS App Version",
        description: (
            <>
                Specify the current version of the iOS application. Users may be
                prompted to update if their installed version is outdated.
            </>
        ),
    },
    {
        label: "Android App Link",
        description: (
            <>
                Provide the download link for the Android application, usually the
                Google Play Store URL.
            </>
        ),
    },
    {
        label: "IOS App Link",
        description: (
            <>
                Provide the download link for the iOS application, usually the
                Apple App Store URL.
            </>
        ),
    },
    {
        label: "Website URL",
        description: (
            <>
                Base website URL used for web redirection / share links (for example, your
                web app domain).
            </>
        ),
    },
];

export const withdrawContent = [
    {
        label: "Minimum Coins",
        description:
            "Define the minimum amount of coins a user needs to reach before they can submit a withdrawal request.",
    },
];
