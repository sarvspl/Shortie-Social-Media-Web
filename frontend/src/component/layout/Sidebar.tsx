"use client";

import "../../assets/js/custom";
import Navigator from "../../extra/Navigator";

const getJQuery = (): any => {
  if (typeof window !== "undefined") {
    return (window as any).$ || (window as any).jQuery;
  }
  return null;
};

import DownArrow from "../../assets/icons/DownArrow.svg";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
// import { useRouter } from "next/router"; // ✅ Pages Router

import Link from "next/link";
import { warning } from "@/util/Alert";
import { setToast } from "@/util/toast";
import { projectName } from "@/util/config";
import axios from "axios";
import { useAppDispatch } from "@/store/store";
import { logoutApi } from "@/store/adminSlice";
import { usePermission } from "@/hooks/usePermission";
import {
  IconBrandStorybook,
  IconBrowserShare,
  IconCards,
  IconCoins,
  IconCurrencyDollar,
  IconCurrencyRupee,
  IconDatabase,
  IconGift,
  IconHash,
  IconHelpOctagon,
  IconHistory,
  IconHome,
  IconLanguage,
  IconLivePhoto,
  IconLogout,
  IconMoneybag,
  IconMoodTongueWink2,
  IconMusic,
  IconReport,
  IconSettings,
  IconShieldLock,
  IconUser,
  IconUserCircle,
  IconUserQuestion,
  IconUserScan,
  IconUserShield,
  IconVideo,
} from "@tabler/icons-react";

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const dispatch = useAppDispatch();
  const { can } = usePermission();

  const handleLogout = () => {
    handleCloseFunction();
    const data = warning(["Cancel", "Yes"], "Are you sure you want to logout?");
    data
      .then((logout: any) => {
        if (logout) {
          setToast("success", "Logout Successfully");

          // 1. CLEAR AUTH STATE BEFORE ANY RENDER
          sessionStorage.clear();

          // 2. FORCE AUTH STATE UPDATE
          dispatch(logoutApi());

          // 3. IMMEDIATE NAVIGATION
          router.replace("/");
        }
      })
      .catch((err: any) => console.log(err));
  };

  const handleCloseFunction = () => {
    let dialogueData_ = {
      dialogue: false,
    };
    localStorage.setItem("dialogueData", JSON.stringify(dialogueData_));
    localStorage.removeItem("multiButton");

    // Close mobile sidebar when link is clicked
    const $sideBar = $(".sideBar");
    if ($sideBar.hasClass("mobSidebar")) {
      $sideBar.removeClass("mobSidebar").addClass("webSidebar");
      $(".mainNavbar").removeClass("mobNav").addClass("webNav");
      $(".comShow").removeClass("mobCom").addClass("webCom");
      $(".sideBarTitle").removeClass("hidden");
      $(".sideBarLogo a").removeClass("justify-content-center");
      $(".mainAdmin").removeClass("mobAdmin");
      $(".fa-angle-right").removeClass("rotated toggleIcon");
      $(".mobSidebar-bg").removeClass("responsive-bg");
    }
  };

  const generalArray = [
    // {
    //   name: "Setting",
    //   path: "/settingPage",

    //   navIcon: <IconSettings />,
    //   onClick: handleCloseFunction,
    // },
    {
      name: "Setting",
      path: "/settings",
      path2: "/settings/ads",
      path3: "/settings/storage",
      path4: "/settings/payment",
      path5: "/settings/reports",
      path6: "/settings/profile",
      path7: "/settings/currency",
      path8: "/settings/profilemanagement",
      path9: "/settings/settingPage",
      path10: "/settings/withdraw",
      navIcon: <IconSettings />,
      onClick: handleCloseFunction,
    },
    // {
    //   name: "Profile",
    //   path: "/owner",

    //   onClick: handleCloseFunction,
    //   navIcon: <IconUserCircle />,
    // },

    {
      name: "Logout",
      navIcon: <IconLogout />,
      onClick: handleLogout,
    },
  ].filter((item: any) => {
    // sirf Settings par condition apply hogi
    if (item.name === "Setting") {
      return can(item.name, "List");
    }
    // Logout hamesha show hoga
    return true;
  });

  const dashBoardList = [
    {
      name: "Dashboard",
      path: "/dashboard",
      navIcon: <IconHome />,
      onClick: handleCloseFunction,
    },
  ];

  const contentList = [
    {
      name: "Recharge Banner",
      path: "/banner",
      navIcon: <IconCards />,
      onClick: handleCloseFunction,
    },
    {
      name: "Gift",
      path: "/giftPage",
      onClick: handleCloseFunction,
      navIcon: <IconGift />,
    },

    {
      name: "Reaction",
      path: "/reactions",
      navIcon: <IconMoodTongueWink2 />,
      onClick: handleCloseFunction,
    },
    {
      name: "Hashtag",
      path: "/hashTagTable",
      navIcon: <IconHash />,
      onClick: handleCloseFunction,
    },
  ].filter((item: any) => can(item.name, "List"));

  const userList = [
    {
      name: "User",
      path: "/userTable",
      path2: "/viewProfile",
      navIcon: <IconUser />,

      onClick: handleCloseFunction,
    },
    {
      name: "Verification Request",
      path: "/verificationRequestTable",
      navIcon: <IconUserScan />,
      onClick: handleCloseFunction,
    },
  ].filter((item: any) => can(item.name, "List"));

  const languageList = [
    {
      name: "Language",
      path: "/language",
      navIcon: <IconLanguage />,
      onClick: handleCloseFunction,
    },
  ].filter((item: any) => can(item.name, "List"));

  const financeList = [
    // {
    //   name: "Currency",
    //   path: "/currency",
    //   navIcon: <IconCurrencyDollar />,
    //   onClick: handleCloseFunction,
    // },
    {
      name: "Withdraw Request",
      path: "/withdrawRequest",
      navIcon: <IconUserQuestion />,
      onClick: handleCloseFunction,
    },
  ].filter((item: any) => can(item.name, "List"));

  const reportList = [
    {
      name: "Support Request",
      path: "/support",
      navIcon: <IconHelpOctagon />,
      onClick: handleCloseFunction,
    },
    {
      name: "Report",
      path: "/reportType",
      navIcon: <IconReport />,
      onClick: handleCloseFunction,
    },
  ].filter((item: any) => can(item.name, "List"));

  const packageList = [
    {
      name: "Coin Plan",
      path: "/coinPlan",
      navIcon: <IconCoins />,
      onClick: handleCloseFunction,
    },
    {
      name: "Order History",
      path: "/order-history",
      path2: "/CoinPlanHistory",
      navIcon: <IconHistory />,
      onClick: handleCloseFunction,
    },
  ].filter((item: any) => can(item.name, "List"));

  const socialList = [
    {
      name: "Song",
      path: "/songTable",
      navIcon: <IconMusic />,
      onClick: handleCloseFunction,
    },
    {
      name: "Post",
      path: "/postTable",
      navIcon: <IconBrowserShare />,

      onClick: handleCloseFunction,
    },
    {
      name: "Story",
      path: "/story",
      navIcon: <IconBrandStorybook />,
      onClick: handleCloseFunction,
    },
    {
      name: "Videos",
      path: "/videoTable",
      navIcon: <IconVideo />,
      onClick: handleCloseFunction,
    },

    {
      name: "Live Video",
      path: "/liveVideo",
      navIcon: <IconLivePhoto />,
      onClick: handleCloseFunction,
    },
  ].filter((item: any) => can(item.name, "List"));

  const staffArray = [
    {
      name: "Access Role",
      path: "/roles",
      navIcon: <IconShieldLock className="cursorPointer" />,
      onClick: handleCloseFunction,
    },
    {
      name: "Staff",
      path: "/staff",
      navIcon: <IconUserShield className="cursorPointer" />,
      onClick: handleCloseFunction,
    },
  ].filter((item: any) => can(item.name, "List"));

  const [totalPage, setTotalPage] = useState(20);

  useEffect(() => {
    const $ = getJQuery();
    if (!$) return;
    const mediaQuery = window.matchMedia("(max-width: 820px)");
    if (mediaQuery?.matches) {
      $(".sideBar.mobSidebar").removeClass("mobSidebar");
      $(".sideBar").addClass("webSidebar");
    }
    $(".mobSidebar-bg").removeClass("responsive-bg");
  }, []);

  return (
    <>
      <Script totalPage={totalPage} />
      <div className="mainSidebar">
        <div className="sideBar webSidebar">
          <div className="sideBarLogo">
            <Link
              href="/dashboard"
              className="d-flex align-items-center cursor-pointer"
            >
              <img src="/images/noImage.png" alt="logo" width={35} />
              <span className="fs-4 fw-semibold projectNameText">
                {projectName}
              </span>
            </Link>
          </div>
          {/* ======= Navigation ======= */}
          <div className="navigation">
            {/* Dashboard */}
            {dashBoardList?.length > 0 && (
              <>
                <p className="sideBarTitle sideBarSectionTitle">Dashboard</p>
                <nav className="sideBarNav">
                  {dashBoardList.map((res: any) => {
                    return (
                      <Navigator
                        key={res.name}
                        name={res?.name}
                        path={res?.path}
                        path2={res?.path2}
                        path3={res?.path3}
                        path4={res?.path4}
                        path5={res?.path5}
                        path6={res?.path6}
                        path7={res?.path7}
                        path8={res?.path8}
                        path9={res?.path9}
                        navIcon={res?.navIcon}
                        navIconImg={res?.navIconImg}
                        navSVG={res?.navSVG}
                        onClick={res?.onClick && res?.onClick}
                      />
                    );
                  })}
                </nav>
              </>
            )}

            {/* User Management */}
            {userList?.length > 0 && (
              <>
                <p className="sideBarTitle sideBarSectionTitle">
                  User Management
                </p>
                <nav className="sideBarNav">
                  {userList.map((res: any) => {
                    return (
                      <Navigator
                        key={res.name}
                        name={res?.name}
                        path={res?.path}
                        path2={res?.path2}
                        navIcon={res?.navIcon}
                        navIconImg={res?.navIconImg}
                        navSVG={res?.navSVG}
                        onClick={res?.onClick && res?.onClick}
                      >
                        {res?.subMenu &&
                          res?.subMenu?.map((subMenu: any) => {
                            return (
                              <Navigator
                                key={subMenu.subName}
                                subName={subMenu.subName}
                                subPath={subMenu.subPath}
                                subPath2={subMenu.subPath2}
                                onClick={handleCloseFunction}
                              />
                            );
                          })}
                      </Navigator>
                    );
                  })}
                </nav>
              </>
            )}

            {/* role and staff */}
            {staffArray?.length > 0 && (
              <>
                <p className="sideBarTitle sideBarSectionTitle">
                  Staff Management
                </p>
                <nav className="sideBarNav">
                  {staffArray.map((res: any) => {
                    return (
                      <Navigator
                        key={res.name}
                        name={res?.name}
                        path={res?.path}
                        path2={res?.path2}
                        navIcon={res?.navIcon}
                        navIconImg={res?.navIconImg}
                        navSVG={res?.navSVG}
                        onClick={res?.onClick && res?.onClick}
                      >
                        {res?.subMenu &&
                          res?.subMenu?.map((subMenu: any) => {
                            return (
                              <Navigator
                                key={subMenu.subName}
                                subName={subMenu.subName}
                                subPath={subMenu.subPath}
                                subPath2={subMenu.subPath2}
                                onClick={handleCloseFunction}
                              />
                            );
                          })}
                      </Navigator>
                    );
                  })}
                </nav>
              </>
            )}

            {/* Content List */}
            {contentList?.length > 0 && (
              <>
                <p className="sideBarTitle sideBarSectionTitle">
                  Content Management
                </p>
                <nav className="sideBarNav">
                  {contentList.map((res: any) => {
                    return (
                      <Navigator
                        key={res.name}
                        name={res?.name}
                        path={res?.path}
                        path2={res?.path2}
                        navIcon={res?.navIcon}
                        navIconImg={res?.navIconImg}
                        navSVG={res?.navSVG}
                        onClick={res?.onClick && res?.onClick}
                      >
                        {res?.subMenu &&
                          res?.subMenu?.map((subMenu: any) => {
                            return (
                              <Navigator
                                key={subMenu.subName}
                                subName={subMenu.subName}
                                subPath={subMenu.subPath}
                                subPath2={subMenu.subPath2}
                                onClick={handleCloseFunction}
                              />
                            );
                          })}
                      </Navigator>
                    );
                  })}
                </nav>
              </>
            )}

            {/* Social List */}
            {socialList?.length > 0 && (
              <>
                <p className="sideBarTitle sideBarSectionTitle">Social Media</p>
                <nav className="sideBarNav">
                  {socialList.map((res: any) => {
                    return (
                      <Navigator
                        key={res.name}
                        name={res?.name}
                        path={res?.path}
                        path2={res?.path2}
                        navIcon={res?.navIcon}
                        navIconImg={res?.navIconImg}
                        navSVG={res?.navSVG}
                        onClick={res?.onClick && res?.onClick}
                      >
                        {res?.subMenu &&
                          res?.subMenu?.map((subMenu: any) => {
                            return (
                              <Navigator
                                key={subMenu.subName}
                                subName={subMenu.subName}
                                subPath={subMenu.subPath}
                                subPath2={subMenu.subPath2}
                                onClick={handleCloseFunction}
                              />
                            );
                          })}
                      </Navigator>
                    );
                  })}
                </nav>
              </>
            )}

            {/* Finance List */}
            {financeList?.length > 0 && (
              <>
                <p className="sideBarTitle sideBarSectionTitle">Finance</p>
                <nav className="sideBarNav">
                  {financeList.map((res: any) => {
                    return (
                      <Navigator
                        key={res.name}
                        name={res?.name}
                        path={res?.path}
                        path2={res?.path2}
                        navIcon={res?.navIcon}
                        navIconImg={res?.navIconImg}
                        navSVG={res?.navSVG}
                        onClick={res?.onClick && res?.onClick}
                      >
                        {res?.subMenu &&
                          res?.subMenu?.map((subMenu: any) => {
                            return (
                              <Navigator
                                key={subMenu.subName}
                                subName={subMenu.subName}
                                subPath={subMenu.subPath}
                                subPath2={subMenu.subPath2}
                                onClick={handleCloseFunction}
                              />
                            );
                          })}
                      </Navigator>
                    );
                  })}
                </nav>
              </>
            )}

            {/* Packages */}
            {packageList?.length > 0 && (
              <>
                <p className="sideBarTitle sideBarSectionTitle">Packages</p>
                <nav className="sideBarNav">
                  {packageList.map((res: any) => {
                    return (
                      <Navigator
                        key={res.name}
                        name={res?.name}
                        path={res?.path}
                        path2={res?.path2}
                        navIcon={res?.navIcon}
                        navIconImg={res?.navIconImg}
                        navSVG={res?.navSVG}
                        onClick={res?.onClick && res?.onClick}
                      >
                        {res?.subMenu &&
                          res?.subMenu?.map((subMenu: any) => {
                            return (
                              <Navigator
                                key={subMenu.subName}
                                subName={subMenu.subName}
                                subPath={subMenu.subPath}
                                subPath2={subMenu.subPath2}
                                onClick={handleCloseFunction}
                              />
                            );
                          })}
                      </Navigator>
                    );
                  })}
                </nav>
              </>
            )}

            {/* Language Management */}
            {languageList?.length > 0 && (
              <>
                <p className="sideBarTitle sideBarSectionTitle">
                  Language Management
                </p>
                <nav className="sideBarNav">
                  {languageList.map((res: any) => {
                    return (
                      <Navigator
                        key={res.name}
                        name={res?.name}
                        path={res?.path}
                        path2={res?.path2}
                        navIcon={res?.navIcon}
                        navIconImg={res?.navIconImg}
                        navSVG={res?.navSVG}
                        onClick={res?.onClick && res?.onClick}
                      >
                        {res?.subMenu &&
                          res?.subMenu?.map((subMenu: any) => {
                            return (
                              <Navigator
                                key={subMenu.subName}
                                subName={subMenu.subName}
                                subPath={subMenu.subPath}
                                subPath2={subMenu.subPath2}
                                onClick={handleCloseFunction}
                              />
                            );
                          })}
                      </Navigator>
                    );
                  })}
                </nav>
              </>
            )}

            {/* Reports & Requests */}
            {reportList?.length > 0 && (
              <>
                <p className="sideBarTitle sideBarSectionTitle">
                  Reports & Requests
                </p>
                <nav className="sideBarNav">
                  {reportList.map((res: any) => {
                    return (
                      <Navigator
                        key={res.name}
                        name={res?.name}
                        path={res?.path}
                        path2={res?.path2}
                        navIcon={res?.navIcon}
                        navIconImg={res?.navIconImg}
                        navSVG={res?.navSVG}
                        onClick={res?.onClick && res?.onClick}
                      >
                        {res?.subMenu &&
                          res?.subMenu?.map((subMenu: any) => {
                            return (
                              <Navigator
                                key={subMenu.subName}
                                subName={subMenu.subName}
                                subPath={subMenu.subPath}
                                subPath2={subMenu.subPath2}
                                onClick={handleCloseFunction}
                              />
                            );
                          })}
                      </Navigator>
                    );
                  })}
                </nav>
              </>
            )}

            {/* Genral */}
            {generalArray?.length > 0 && (
              <>
                <p className="sideBarTitle sideBarSectionTitle">System</p>
                <nav className="sideBarNav">
                  {(totalPage > 0
                    ? generalArray.slice(0, totalPage)
                    : generalArray
                  ).map((res: any) => {
                    return (
                      <Navigator
                        key={res.name}
                        name={res?.name}
                        path={res?.path}
                        path2={res?.path2}
                        path3={res?.path3}
                        path4={res?.path4}
                        path5={res?.path5}
                        path6={res?.path6}
                        path7={res?.path7}
                        path8={res?.path8}
                        path9={res?.path9}
                        path10={res?.path10}
                        navIcon={res?.navIcon}
                        navIconImg={res?.navIconImg}
                        navSVG={res?.navSVG}
                        onClick={res?.onClick && res?.onClick}
                      >
                        {res?.subMenu &&
                          res?.subMenu?.map((subMenu: any) => {
                            return (
                              <Navigator
                                key={subMenu.subName}
                                subName={subMenu.subName}
                                subPath={subMenu.subPath}
                                subPath2={subMenu.subPath2}
                                onClick={subMenu.onClick}
                              />
                            );
                          })}
                      </Navigator>
                    );
                  })}
                </nav>
              </>
            )}

            {/* <div
              className="boxCenter mt-2"
              onClick={() => setTotalPage(navBarArray.length)}
            >
              <img
                src={DownArrow}
                alt="DownArrow"
                style={{ transition: "0.5s" }}
                className={`text-center mx-auto cursor ${
                  totalPage === navBarArray.length && "d-none"
                }`}
              />
            </div> */}
          </div>
        </div>
      </div>
      <div>{children}</div>
    </>
  );
};

export default Sidebar;

// export const Script = (props: any) => {
//   useEffect(() => {
//     const handleClick = (event: any) => {
//       const target = $(event.currentTarget);
//       const submenu = target.next(".subMenu");

//       $(".subMenu").not(submenu).slideUp();
//       submenu.slideToggle();

//       // Toggle rotation class on the clicked icon
//       target.children("i").toggleClass("rotate90");

//       // Remove rotation class from other icons
//       $(".mainMenu > li > a > i")
//         .not(target.children("i"))
//         .removeClass("rotate90");
//     };

//     const handleToggle = () => {
//       $(".mainNavbar").toggleClass("mobNav webNav");
//       $(".sideBar").toggleClass("mobSidebar webSidebar");
//       $(".comShow").toggleClass("mobCom webCom");
//       $(".sideBarTitle").toggleClass("hidden");
//       $(".sideBarLogo a").toggleClass("justify-content-center");

//       // $(".mobSidebar-bg").toggleClass("responsive-bg ");
//       $(".mainAdmin").toggleClass("mobAdmin");
//       $(".fa-angle-right").toggleClass("rotated toggleIcon");

//       var checkClass = $(".sideBar").hasClass("mobSidebar");
//       if (checkClass) {
//         var mobSidebarBg = document.querySelector(".mobSidebar-bg");
//         mobSidebarBg && mobSidebarBg.classList.add("responsive-bg");
//       } else {
//         $(".mobSidebar-bg").removeClass("responsive-bg");
//       }
//     };
//     $(".subMenu").hide();
//     $(".mainMenu > li > a").on("click", handleClick);
//     $(".navToggle").on("click", handleToggle);

//     return () => {
//       $(".mainMenu > li > a").off("click", handleClick);
//       $(".navToggle").off("click", handleToggle);
//     };
//   }, [props.totalPage]);

//   return null;
// };

export const Script = (props: any) => {
  useEffect(() => {
    const $ = getJQuery();
    if (!$) return;
    const $sideBar = $(".sideBar");
    const $mainNav = $(".mainNavbar");
    const $comShow = $(".comShow");
    const $sideBarTitle = $(".sideBarTitle");
    const $sideBarLogo = $(".sideBarLogo a");
    const $mobSidebarBg = $(".mobSidebar-bg");

    // --- Submenu toggle ---
    const handleClick = (event: any) => {
      const target = $(event.currentTarget);
      const submenu = target.next(".subMenu");

      $(".subMenu").not(submenu).slideUp();
      submenu.slideToggle();

      target.children("i").toggleClass("rotate90");
      $(".mainMenu > li > a > i")
        .not(target.children("i"))
        .removeClass("rotate90");
    };

    // --- Sidebar toggle button ---
    const handleToggle = (event: any) => {
      event.stopPropagation();
      $sideBar.toggleClass("mobSidebar webSidebar");
      $mainNav.toggleClass("mobNav webNav");
      $comShow.toggleClass("mobCom webCom");
      $sideBarTitle.toggleClass("hidden");
      $sideBarLogo.toggleClass("justify-content-center");
      $(".mainAdmin").toggleClass("mobAdmin");
      $(".fa-angle-right").toggleClass("rotated toggleIcon");

      if ($sideBar.hasClass("mobSidebar")) {
        $mobSidebarBg.addClass("responsive-bg");
      } else {
        $mobSidebarBg.removeClass("responsive-bg");
      }
    };

    // --- Close sidebar if clicked outside ---
    const handleOutsideClick = (event: any) => {
      if (
        !$(event.target).closest(".sideBar, .navToggle").length &&
        $sideBar.hasClass("mobSidebar")
      ) {
        closeSidebar();
      }
    };

    // --- Close sidebar function ---
    const closeSidebar = () => {
      $sideBar.removeClass("mobSidebar").addClass("webSidebar");
      $mainNav.removeClass("mobNav").addClass("webNav");
      $comShow.removeClass("mobCom").addClass("webCom");
      $sideBarTitle.removeClass("hidden");
      $sideBarLogo.removeClass("justify-content-center");
      $(".mainAdmin").removeClass("mobAdmin");
      $(".fa-angle-right").removeClass("rotated toggleIcon");
      $mobSidebarBg.removeClass("responsive-bg");
    };

    // --- Close sidebar when any nav link is clicked ---
    const handleNavClick = (event: any) => {
      if ($sideBar.hasClass("mobSidebar")) {
        closeSidebar();
      }
    };

    // --- Initial hide submenus ---
    $(".subMenu").hide();

    // --- Event bindings ---
    $(".mainMenu > li > a").on("click", handleClick);
    $(".navToggle").on("click", handleToggle);
    // Use event delegation for dynamically rendered links
    $(document).on("click", ".mainMenu > li > a, .subMenu a", handleNavClick);
    $(document).on("click", handleOutsideClick);

    // --- Cleanup ---
    return () => {
      $(".mainMenu > li > a").off("click", handleClick);
      $(".navToggle").off("click", handleToggle);
      $(document).off(
        "click",
        ".mainMenu > li > a, .subMenu a",
        handleNavClick,
      );
      $(document).off("click", handleOutsideClick);
    };
  }, [props.totalPage]);

  return null;
};
