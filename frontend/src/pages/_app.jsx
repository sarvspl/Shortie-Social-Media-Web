"use client";
import { Providers } from "@/Provider";
import "@/assets/css/dateRange.css";
import "@/assets/css/default.css";
import "@/assets/css/custom.css";
import "@/assets/css/responsive.css";
import "@/assets/css/style.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { baseURL, secretKey } from "@/util/config";
import Loader from "../extra/Loader";
import AuthCheck from "./AuthCheck";

export default function App({ Component, pageProps, router }) {
  const getToken =
    typeof window !== "undefined" && sessionStorage.getItem("token");
  const getLayout = Component.getLayout || ((page) => page);
  axios.defaults.baseURL = baseURL;
  axios.defaults.headers.common["key"] = secretKey;
  axios.defaults.headers.common["Authorization"] = getToken
    ? `${getToken}`
    : "";

  const publicRoutes = ["/", "/forgotPassword", "/Registration", "/share"];
  const isPublicRoute = publicRoutes.includes(router.pathname);

  let content = null;
  
  // BLOCK PROTECTED UI RENDER
  // If no token and it's a protected route, do NOT render the dashboard layout
  if (!getToken && !isPublicRoute && typeof window !== "undefined") {
    content = null;
  } else {
    content = getLayout(
      <Providers>
        <AuthCheck>
          <Component {...pageProps} />
          <Loader />
        </AuthCheck>
      </Providers>
    );
  }

  return (
    <>
      <ToastContainer />
      {content}
    </>
  );
}
