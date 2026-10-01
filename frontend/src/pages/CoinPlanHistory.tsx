import React, { useEffect, useState } from "react";
import NewTitle from "../extra/Title";
import Table from "../extra/Table";
import Pagination from "../extra/Pagination";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { getUserCoinPlanHistory } from "@/store/adminEarningSlice";
import RootLayout from "@/component/layout/Layout";
import { useRouter } from "next/router";
import { RootStore } from "@/store/store";
import { useAppDispatch } from "@/store/store";
import Searching from "@/extra/Searching";
import { IconCopy } from "@tabler/icons-react";
import { usePermission } from "@/hooks/usePermission";
import { toast } from "react-toastify";

const CoinPlanHistory = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { userId, userName } = router.query;

  const { coinPlanHistory, totalHistory, isLoading } = useSelector(
    (state: RootStore) => state.adminEarning,
  );
  const { can } = usePermission();
  const canList = can("Order-History", "List");

  // const coinPlanHistoryData = location?.state?.data;
  const [data, setData] = useState();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [startDate, setStartDate] = useState("All");
  const [endDate, setEndDate] = useState("All");
  const [search, setSearch] = useState<string>("");
  const { currency } = useSelector((state: any) => state.currency);

  //   let adminEarningHistoryData = null;

  useEffect(() => {
    if (!router.isReady) return;
    if (!userId || Array.isArray(userId)) return;
      dispatch(
        getUserCoinPlanHistory({
          userId,
          page,
          limit: size,
          startDate,
          endDate,
          search: search ?? "",
        }),
      );
  }, [router.isReady, userId, page, size, startDate, endDate, search]);

  //   if (typeof window !== "undefined") {
  //     adminEarningHistoryData = JSON.parse(localStorage.getItem("adminEarningHistoryData")) || null;
  //   }

  // useEffect(() => {
  //     setData(coinPlanHistoryData?.coinPlanPurchase);
  // }, [coinPlanHistoryData?.coinPlanPurchase]);

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };

  const handleRowsPerPage = (value) => {
    setPage(1);
    setSize(value);
  };

  const copyToClipboard = (Text: any) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(Text).then(() => {
        toast.success("Copied to clipboard");
      }).catch(() => {
        fallbackCopy(Text);
      });
    } else {
      fallbackCopy(Text);
    }
  };

  const fallbackCopy = (text: any) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand("copy");
      toast.success("Copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy");
    }
    document.body.removeChild(textarea);
  };

  const earningTable = [
    {
      Header: "NO",
      body: "no",
      Cell: ({ index }) => (
        <span className="  text-nowrap">
          {(page - 1) * size + parseInt(index) + 1}
        </span>
      ),
    },

    {
      Header: "UNIQUEID",
      body: "uniqueId",
      Cell: ({ row }) => (
        <span className="text-capitalize" >
          {row?.uniqueId}
          <IconCopy
            size={16}
            className="ms-1"
            style={{ cursor: "pointer" }}
            onClick={() => copyToClipboard(row?.uniqueId)}
          />
        </span>
      ),
    },
    {
      Header: "COIN",
      body: "coin",
      Cell: ({ row }) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingLeft: "23%",
            gap: "5px",
          }}
        >
          <img src="/images/coin.png" width="18px" height="18px" />

          <span className="text-capitalize">{row?.coin}</span>
        </div>
      ),
    },

    {
      Header: `AMOUNT (${currency?.symbol})`,
      body: "amount",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.amount} {currency?.symbol}
        </span>
      ),
    },
    {
      Header: "PAYMENT GATEWAY",
      body: "paymentGateway",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.paymentGateway}</span>
      ),
    },

    {
      Header: "CREATED AT",
      body: "createdAt",
      Cell: ({ row }) => <span className="text-capitalize">{row.date}</span>,
    },
  ];

  return (
    <div className="userPage withdrawal-page">
      <div className="dashboardHeader primeHeader mb-3 p-0">
        <NewTitle
          dayAnalyticsShow={true}
          titleShow={true}
          setEndDate={setEndDate}
          setStartDate={setStartDate}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
      <div className="payment-setting-box user-table">
        <div className="row align-items-center p-3 ml-1 user-table-top">
          <div className="col-12 col-sm-6">
            <h5
              style={{
                fontWeight: "500",
                fontSize: "20px",
                marginBottom: "0px",
                marginTop: "5px",
                padding: "3px",
              }}
            >
              {`${userName}'s Coin Plan Purchase History`}
            </h5>
          </div>

          <div className="col-12 col-sm-6 d-flex justify-content-end mt-2 mt-sm-0">
            <Searching
              placeholder="Search Here"
              type="server"
              setSearchData={setSearch}
              searchValue={search}
              actionShow={false}
              button={false}
              newClass=""
            />
          </div>
        </div>

        <Table
          data={coinPlanHistory}
          mapData={earningTable}
          serverPerPage={size}
          serverPage={page}
          type="server"
        />

        <div className="mt-3">
          <Pagination
            type={"server"}
            activePage={page}
            actionShow={false}
            rowsPerPage={size}
            userTotal={totalHistory}
            setPage={setPage}
            handleRowsPerPage={handleRowsPerPage}
            handlePageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

CoinPlanHistory.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};
export default CoinPlanHistory;
