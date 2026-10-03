"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAppDispatch } from "@/store/store";
import { setHydrate } from "@/store/adminSlice";
// import { getAllLanguages } from "@/store/languageSlice";

interface AuthCheckProps {
  children: React.ReactNode;
}

const AuthCheck = (props: any) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const validateAndHydrate = async () => {
      // 1. Check for tamper flag in URL (from logoutOnTamper)
      if (router.query.tamper === "true") {
        const { setToast } = await import("@/util/toastServices");
        setToast("error", "Session tampered. Please login again.");
        // Clear query param without refreshing
        router.replace(router.pathname, undefined, { shallow: true });
      }

      // 2. Validate Session Integrity
      const { validateSessionIntegrity } = await import("@/util/security");
      const isValid = await validateSessionIntegrity();
      
      if (!isValid) {
        // validateSessionIntegrity already handles logout and redirect
        return;
      }

      const { routeModuleMapping, alwaysAllowedRoutes, publicRoutes } = await import("@/util/routePermissions");
      const { checkPermission } = await import("@/util/permissionHelper");

      // 3. Hydrate state if valid
      const storedToken = sessionStorage.getItem("token") || "";
      if (storedToken.includes("standalone_signature")) {
        sessionStorage.clear();
        router.push("/");
        return;
      }

      const storedIsAuth = sessionStorage.getItem("isAuth");
      const isAuth = storedIsAuth === "true";

      const admin = JSON.parse(sessionStorage.getItem("admin_") || "{}");
      const loginType = sessionStorage.getItem("loginType") || "";
      const permissions = JSON.parse(sessionStorage.getItem("permissions") || "[]");

      dispatch(setHydrate({ isAuth, admin, loginType, permissions }));

      // 4. Handle Public Routes
      if (publicRoutes.includes(router.pathname)) {
        setIsMounted(true);
        return;
      }

      // 5. Authentication Check
      if (!isAuth) {
        router.push("/");
        return;
      }

      // 6. Route-Level Permission Check
      // Admins have full access
      if (loginType === "admin") {
        setIsMounted(true);
        return;
      }

      // Check if current route is always allowed
      if (alwaysAllowedRoutes.includes(router.pathname)) {
        setIsMounted(true);
        return;
      }

      // Validate permission for the current route
      const moduleName = routeModuleMapping[router.pathname];
      if (moduleName) {
        const hasAccess = checkPermission(admin, loginType, permissions, moduleName, "List");
        if (!hasAccess) {
          const { setToast } = await import("@/util/toastServices");
          setToast("error", "You are not authorized to access this module.");
          router.replace("/dashboard");
          return;
        }
      } else {
        // Check if the path starts with a mapped key (for sub-routes like /settings/ads)
        const mappedKey = Object.keys(routeModuleMapping).find(key => router.pathname.startsWith(key));
        if (mappedKey) {
            const hasAccess = checkPermission(admin, loginType, permissions, routeModuleMapping[mappedKey], "List");
            if (!hasAccess) {
                const { setToast } = await import("@/util/toastServices");
                setToast("error", "You are not authorized to access this module.");
                router.replace("/dashboard");
                return;
            }
        }
      }

      setIsMounted(true);
    };

    validateAndHydrate();

    // Real-time protection: trigger session validation the moment the window gets focus (e.g. returning from DevTools)
    const handleFocus = async () => {
      const { validateSessionIntegrity } = await import("@/util/security");
      await validateSessionIntegrity();
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [dispatch, router]);

  if (!isMounted) {
    return null;
  }

  return <>{props.children}</>;
};

export default AuthCheck;
