export const baseURL: string = process.env.NEXT_PUBLIC_BASE_URL || "https://shortie.sarstage.online/api/";
export const secretKey: string = process.env.NEXT_PUBLIC_SECRET_KEY || "5TIvw5cpc0";
export const projectName: string = process.env.NEXT_PUBLIC_PROJECT_NAME || "Shortie";

// Standalone Mode: Set to true to run fully offline / without database for preview.
export const isStandaloneMode: boolean =
  process.env.NEXT_PUBLIC_STANDALONE !== undefined
    ? process.env.NEXT_PUBLIC_STANDALONE === "true"
    : false;
