export const baseURL: string =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5050/"
    : "https://connect.sarstage.online/api/");
export const secretKey: string = process.env.NEXT_PUBLIC_SECRET_KEY || "5TIvw5cpc0";
export const projectName: string = process.env.NEXT_PUBLIC_PROJECT_NAME || "Shortie";

export const isStandaloneMode: boolean = false;
