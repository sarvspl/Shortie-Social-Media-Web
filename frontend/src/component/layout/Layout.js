"use client";
import { Providers } from "@/Provider";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
// import { useSelector } from "react-redux";
// import { useRouter } from "next/router";
// import NoLanguageModal from "../language/NoLanguageModal";

const LayoutContent = ({ children }) => {
  // const router = useRouter();
  // const { isAuth } = useSelector((state) => state.admin);
  // const { totalLanguages, isLoading } = useSelector((state) => state.language);

  // const showNoLanguageModal =
  //   isAuth &&
  //   !isLoading &&
  //   totalLanguages === 0 &&
  //   router.pathname !== "/language";

  return (
    <div className="mainContainer d-flex w-100">
      <div className="containerLeft">
        <Sidebar />
      </div>
      <div className="containerRight w-100 ">
        <Navbar />
        <div className="mainAdmin ml-4">
          <div className="mobSidebar-bg  d-none"></div>
          <main className="comShow">{children}</main>
        </div>
      </div>
      {/* <NoLanguageModal open={showNoLanguageModal} /> */}
    </div>
  );
};

const RootLayout = ({ children }) => {
  return (
    <Providers>
      <LayoutContent>{children}</LayoutContent>
    </Providers>
  );
};

export default RootLayout;