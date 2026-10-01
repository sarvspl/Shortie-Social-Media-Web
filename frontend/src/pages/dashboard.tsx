"use client";
import { getActiveInactiveUser } from "@/store/dashSlice";
import { useAppDispatch } from "@/store/store";
import {
  IconBrowserShare,
  IconClipboardList,
  IconListCheck,
  IconMusicStar,
  IconUserHeart,
  IconUsers,
  IconUserShield,
  IconVideo,
} from "@tabler/icons-react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import RootLayout from "../component/layout/Layout";
import NewTitle from "../extra/Title";
import {
  dashboardCount,
  getChartPost,
  getChartUser,
  getChartVideo,
} from "../store/dashSlice";
import { permissionError } from "@/util/Alert";

const Dashboard = (props) => {
  const {
    dashCount,
    chartAnalyticOfVideos,
    chartAnalyticOfPosts,
    chartAnalyticOfUsers,
    activeUser,
    inActiveUser,
    totalUser,
  } = useSelector((state: any) => state.dashboard);

  const { loginType, permissions } = useSelector((state: any) => state.admin);

  const router = useRouter();
  const dispatch = useAppDispatch();

  let label = [];
  let dataPost = [];
  let dataVideo = [];
  let dataUser = [];

  const [startDate, setStartDate] = useState<string>("All");
  const [endDate, setEndDate] = useState<string>("All");

  useEffect(() => {
    let payload: any = {
      startDate: startDate,
      endDate: endDate,
    };
    dispatch(dashboardCount(payload));
  }, [dispatch, startDate, endDate]);

  useEffect(() => {
    let payload: any = {
      startDate: startDate,
      endDate: endDate,
      type: "Post",
    };
    dispatch(getChartPost(payload));
  }, [dispatch, startDate, endDate]);

  useEffect(() => {
    let payload: any = {
      startDate: startDate,
      endDate: endDate,
      type: "Video",
    };
    dispatch(getChartVideo(payload));
  }, [dispatch, startDate, endDate]);

  useEffect(() => {
    let payload: any = {
      startDate: startDate,
      endDate: endDate,
      type: "User",
    };
    dispatch(getChartUser(payload));
  }, [dispatch, startDate, endDate]);

  useEffect(() => {
    let payload: any = {
      startDate: startDate,
      endDate: endDate,
    };
    dispatch(getActiveInactiveUser(payload));
  }, [dispatch, startDate, endDate]);

  const userMap: { [key: string]: number } = {};
  const videoMap: { [key: string]: number } = {};
  const postMap: { [key: string]: number } = {};
  const allDatesSet = new Set<string>();

  chartAnalyticOfUsers?.forEach((data_: any) => {
    const newDate = data_?._id;
    if (newDate) {
      userMap[newDate] = data_?.count || 0;
      allDatesSet.add(newDate);
    }
  });

  chartAnalyticOfVideos?.forEach((data_: any) => {
    const newDate = data_?._id;
    if (newDate) {
      videoMap[newDate] = data_?.count || 0;
      allDatesSet.add(newDate);
    }
  });

  chartAnalyticOfPosts?.forEach((data_: any) => {
    const newDate = data_?._id;
    if (newDate) {
      postMap[newDate] = data_?.count || 0;
      allDatesSet.add(newDate);
    }
  });

  label = Array.from(allDatesSet).sort(
    (a: any, b: any) => new Date(a).getTime() - new Date(b).getTime()
  );

  dataUser = label.map((date) => userMap[date] || 0);
  dataVideo = label.map((date) => videoMap[date] || 0);
  dataPost = label.map((date) => postMap[date] || 0);

  const totalSeries = {
    labels: label,
    dataSet: [
      {
        name: "Total User",
        data: dataUser,
      },
      {
        name: "Total Video",
        data: dataVideo,
      },
      {
        name: "Total Short",
        data: dataPost,
      },
    ],
  };
  const optionsTotal: ApexOptions = {
    chart: {
      type: "area",
      stacked: false,
      height: "200px",
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 0,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100, 100, 100],
      },
    },
    yaxis: {
      show: true,
      labels: {
        style: {
          colors: "#3e3e3e",
          fontSize: "12px",
        }
      }
    },
    xaxis: {
      categories: label,
      labels: {
        rotate: -45,
        rotateAlways: true,
        style: {
          colors: "#3e3e3e",
          fontSize: "11px",
        }
      },
    },
    grid: {
      padding: {
        bottom: 15,
        left: 15,
        right: 15,
      }
    },
    tooltip: {
      shared: true,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      offsetX: -10,
    },
    colors: ["#8B82FC", "#786D81", "#be73f6"],
  };

  const optionsGradient: ApexOptions = {
    chart: {
      height: 400,
      width: 200,
      type: "radialBar",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: 0,
        endAngle: 365,
        hollow: {
          margin: 0,
          size: "55%",
          background: "#fff",
          image: undefined,
          imageOffsetX: 0,
          imageOffsetY: 0,
          position: "front",
          dropShadow: {
            enabled: false,
            top: 3,
            left: 0,
            blur: 4,
            opacity: 0.24,
          },
        },
        track: {
          background: "#8B82FC", // Change the background color here
          strokeWidth: "90%",
          margin: 0, // margin is in pixels
          dropShadow: {
            enabled: false,
            top: -3,
            left: 0,
            blur: 4,
            opacity: 0.35,
          },
        },
        dataLabels: {
          show: true,
          name: {
            show: true,
            fontFamily: undefined,
            fontWeight: 700,
            fontSize: "17px",
            color: "#404040",
            offsetY: -10,
          },
          value: {
            formatter: function (val: any) {
              return parseInt(val) + "%";
            },
            color: "#9B7FF8",
            fontWeight: 600,
            fontSize: "30px",
            show: true,
          },
        },
      },
    },
    labels: ["Active User"],
    fill: {
      type: "solid",
      colors: ["#be73f6"],
    },
    stroke: {
      lineCap: "round",
    },
    states: {
      hover: {
        filter: {
          type: "none", // Disables the hover effect
        },
      },
    },
  };

  // Log the chartAnalyticOfUsers array to check its contents

  // Function to check if a value is a valid number
  const isValidNumber = (value: any) =>
    typeof value === "number" && !isNaN(value);

  // Calculate activeUserData
  const activeUserData =
    chartAnalyticOfUsers?.reduce((acc, obj) => {
      const count = obj?.count;
      return isValidNumber(count) ? acc + count : acc;
    }, 0) || 0;

  // Calculate userData
  const userData =
    chartAnalyticOfUsers?.reduce((acc, obj) => {
      const count = obj?.count;
      return isValidNumber(count) ? acc + count : acc;
    }, 0) || 0;

  // Calculate percentage
  const percentage =
    activeUserData && userData ? (activeUserData / userData) * 100 : 0;

  // Create the series data
  const activePercentageofUser = activeUser
    ? (activeUser / totalUser) * 100
    : 0;
  const seriesGradient = [activePercentageofUser];

  const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

  const CustomeCard = ({ link, title, count, icon, onClickAction, module }: any) => {
    const handleRedirect = () => {
      if (loginType === "staff") {
        const modulePermission = permissions.find((p: any) => p.module === module);
        if (!modulePermission || !modulePermission.actions.includes("List")) {
          return permissionError();
        }
      }

      if (onClickAction) onClickAction();
      router.push(link);
    };

    return (
      <div
        className="col-12 col-xl-3 col-md-6 col-lg-6"
        onClick={handleRedirect}
      >
        <div className="card">
          <div className="card-content cursor-pointer">
            <div className="card-body p-4">
              <div className="align-content-center d-flex justify-content-between media align-items-center">
                <div className="media-body text-left" style={{ minWidth: 0 }}>
                  <h3 className="warning m-0">{count}</h3>
                  <span className="fw-medium d-block text-truncate ">
                    {title}
                  </span>
                </div>
                <div className="align-self-center dashboardIconBg">{icon}</div>
              </div>
              <div className="progress mt-2 mb-0" style={{ height: 7 }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: "50%" }}
                  aria-valuenow={50}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="dashboard " style={{ padding: "15px", marginTop: "0px" }}>
        <div className="dashboardHeader primeHeader !mb-0 !p-0">
          <h4 className="heading-dashboard fw-semibold d-block">
            Welcome Admin !
          </h4>
          {/* <h6 className="">Dashboard</h6> */}
          <NewTitle
            dayAnalyticsShow={true}
            setEndDate={setEndDate}
            setStartDate={setStartDate}
            startDate={startDate}
            endDate={endDate}
            titleShow={true}
            name={`Dashboard`}
          />
        </div>

        <div className="dashBoardMain px-4 mt-4">
          <div className="row  mt-2">
            <CustomeCard
              link={"/userTable"}
              title={"Total User"}
              module="User"
              count={dashCount?.totalUsers ? dashCount?.totalUsers : 0}
              onClickAction={() => {
                if (typeof window !== "undefined") {
                  localStorage.setItem("multiButton", JSON.stringify("Real User"));
                }
              }}
              icon={
                <IconUsers
                  className=""
                  style={{
                    width: "48px",
                    height: "48px",
                    color: "#8A82FB",
                  }}
                />
              }
            />
            <CustomeCard
              link={"/userTable"}
              title={"Total Active User"}
              module="User"
              count={
                dashCount?.totalActiveUsers ? dashCount?.totalActiveUsers : 0
              }
              onClickAction={() => {
                if (typeof window !== "undefined") {
                  localStorage.setItem("multiButton", JSON.stringify("Real User"));
                }
              }}
              icon={
                <IconUserHeart
                  className=""
                  style={{
                    width: "48px",
                    height: "48px",
                    color: "#8A82FB",
                  }}
                />
              }
            />
            <CustomeCard
              link={"/userTable"}
              title={"Total Verified User"}
              module="User"
              count={
                dashCount?.totalVerifiedUsers
                  ? dashCount?.totalVerifiedUsers
                  : 0
              }
              onClickAction={() => {
                if (typeof window !== "undefined") {
                  localStorage.setItem("multiButton", JSON.stringify("Verified User"));
                }
              }}
              icon={
                <IconUserShield
                  className=""
                  style={{
                    width: "48px",
                    height: "48px",
                    color: "#8A82FB",
                  }}
                />
              }
            />
            <CustomeCard
              link={"/verificationRequestTable"}
              title={"Total Verification Request"}
              module="Verification Request"
              count={
                dashCount?.totalVerificationRequests
                  ? dashCount?.totalVerificationRequests
                  : 0
              }
              icon={
                <IconListCheck
                  className=""
                  style={{
                    width: "48px",
                    height: "48px",
                    color: "#8A82FB",
                  }}
                />
              }
            />

            <CustomeCard
              link={"/postTable"}
              title={"Total Post"}
              module="Post"
              count={dashCount?.totalPosts ? dashCount?.totalPosts : 0}
              icon={
                <IconBrowserShare
                  className=""
                  style={{
                    width: "48px",
                    height: "48px",
                    color: "#8A82FB",
                  }}
                />
              }
            />

            <CustomeCard
              link={"/videoTable"}
              title={"Total Video"}
              module="Videos"
              count={dashCount?.totalVideos ? dashCount?.totalVideos : 0}
              icon={
                <IconVideo
                  className=""
                  style={{
                    width: "48px",
                    height: "48px",
                    color: "#8A82FB",
                  }}
                />
              }
            />

            <CustomeCard
              link={"/songTable"}
              title={"Total Song"}
              module="Song"
              count={dashCount?.totalSongs ? dashCount?.totalSongs : 0}
              icon={
                <IconMusicStar
                  className=""
                  style={{
                    width: "48px",
                    height: "48px",
                    color: "#8A82FB",
                  }}
                />
              }
            />

            <CustomeCard
              link={"/reportType"}
              title={"Total Report"}
              module="Report"
              count={dashCount?.totalReports ? dashCount?.totalReports : 0}
              icon={
                <IconClipboardList
                  className=""
                  style={{
                    width: "48px",
                    height: "48px",
                    color: "#8A82FB",
                  }}
                />
              }
            />
          </div>
          <div className="dashboard-analytics">
            <h6>Data Analytics</h6>
            <div className="row dashboard-chart justify-content-between">
              <div
                className="col-lg-8 col-md-12 col-sm-12 mt-lg-0 mt-4 dashboard-chart-box"
                style={{ position: "relative" }}
              >
                <div
                  id="chart"
                  className="dashboard-user-count"
                  style={{ height: "100%" }}
                >
                  <div className="date-range-picker mb-2 pb-2"></div>
                  <div className="">
                    <Chart
                      options={optionsTotal}
                      series={
                        totalSeries.dataSet.length > 1
                          ? totalSeries.dataSet
                          : [{ data: [] }]
                      }
                      type="area"
                      height={450}
                    />
                  </div>
                  <span
                    style={{
                      position: "absolute",
                      top: "46%",
                      right: "40%",
                      fontWeight: "500",
                    }}
                  ></span>
                </div>
              </div>
              <div className="col-lg-4 col-md-12 col-sm-12 mt-3 mt-lg-0 dashboard-total-user">
                <div className="user-activity">
                  <div className="border-bottom p-3">
                    <h6 className="m-0">Total User Activity</h6>
                  </div>
                  <div
                    id="chart"
                    style={{ display: "flex", justifyContent: "center" }}
                    className="p-3"
                  >
                    <Chart
                      options={optionsGradient}
                      series={seriesGradient}
                      type="radialBar"
                      width={450}
                      height={"360px"}
                    />
                  </div>
                  <div className="p-3">
                    <div className="total-user-chart">
                      <span></span>
                      <h5>Total Active User</h5>
                    </div>
                    <div className="total-active-chart">
                      <span></span>
                      <h5>Total Block User</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

Dashboard.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default Dashboard;
