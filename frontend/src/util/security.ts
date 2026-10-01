import { secretKey } from "./config";
import { setToast } from "./toastServices";

const fallbackHash = (str: string): string => {
  let hash1 = 0x811c9dc5; 
  let hash2 = 5381;       
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash1 ^= char;
    hash1 = Math.imul(hash1, 0x01000193);
    hash2 = ((hash2 << 5) + hash2) + char;
    hash2 = hash2 & hash2; // Convert to 32bit integer
  }
  
  // Combine hashes and format to hex string
  const hex1 = (hash1 >>> 0).toString(16).padStart(8, "0");
  const hex2 = (hash2 >>> 0).toString(16).padStart(8, "0");
  
  return hex1 + hex2;
};

/**
 * @param permissions The permissions array to hash
 * @param loginType The loginType string to hash
 * @returns A promise that resolves to the hex string hash
 */
export const generatePermissionHash = async (permissions: any[], loginType?: string): Promise<string> => {
  try {
    const data = JSON.stringify({
      permissions: permissions || [],
      loginType: loginType || ""
    });
    // We add the secretKey to make it a signature-like hash (HMAC-lite)
    const message = data + secretKey;

    if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      return hashHex;
    } else {
      return fallbackHash(message);
    }
  } catch (error) {
    console.error("Hash generation failed:", error);
    try {
      const data = JSON.stringify({
        permissions: permissions || [],
        loginType: loginType || ""
      });
      return fallbackHash(data + secretKey);
    } catch (fallbackError) {
      console.error("Critical fallback hashing failure:", fallbackError);
      return "";
    }
  }
};

/**
 * Validates the session integrity by comparing stored hash with recomputed hash.
 * If tampering is detected, it clears the session and redirects to login.
 */
export const validateSessionIntegrity = async (): Promise<boolean> => {
  if (typeof window === "undefined") return true;

  const isAuth = sessionStorage.getItem("isAuth") === "true";
  const loginType = sessionStorage.getItem("loginType") || "";

  // Only validate for authenticated sessions.
  if (!isAuth) return true;

  const storedHash = sessionStorage.getItem("permissionsHash");
  const storedPermissionsStr = sessionStorage.getItem("permissions") || "[]";
  let permissions = [];
  
  try {
    permissions = JSON.parse(storedPermissionsStr);
  } catch (e) {
    console.error("Failed to parse permissions from sessionStorage", e);
    logoutOnTamper();
    return false;
  }

  // Recompute hash using both permissions and loginType
  const currentHash = await generatePermissionHash(permissions, loginType);

  if (storedHash !== currentHash) {
    console.warn("Session tampering detected! Hashes do not match.");
    logoutOnTamper();
    return false;
  }

  // Validate flag integrity from localStorage
  const storedFlag = localStorage.getItem("flag");
  const storedFlagHash = localStorage.getItem("flagHash");

  if (storedFlag !== null && storedFlagHash !== null) {
    const computedFlagHash = await generatePermissionHash([storedFlag], "flag");
    if (storedFlagHash !== computedFlagHash) {
      console.warn("Flag tampering detected! Flag hashes do not match.");
      logoutOnTamper();
      return false;
    }
  }

  return true;
};

/**
 * Clears session and redirects to login with a warning.
 */
export const logoutOnTamper = () => {
  if (typeof window !== "undefined") {
    sessionStorage.clear();
    localStorage.removeItem("flag");
    localStorage.removeItem("flagHash");
    // Redirect to login page
    // We use window.location.href to ensure the app state is fully reset
    window.location.href = "/?tamper=true";
  }
};
