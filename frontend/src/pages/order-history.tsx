"use client";

import BannerDialogue from "@/component/banner/BannerDialogue";
import RootLayout from "@/component/layout/Layout";
import Button from "@/extra/Button";
import Pagination from "@/extra/Pagination";
import TrashIcon from "../assets/icons/trashIcon.svg";
import EditIcon from "../assets/icons/EditBtn.svg";
import Table from "@/extra/Table";
import Title from "@/extra/Title";
import ToggleSwitch from "@/extra/ToggleSwitch";
import { activeBanner, deleteBanner, getBanner } from "@/store/bannerSlice";
import { openDialog } from "@/store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { warning } from "@/util/Alert";
import { baseURL } from "@/util/config";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getAdminEarning } from "@/store/adminEarningSlice";
import NewTitle from "../extra/Title";
import Verified from "../assets/images/verified.png";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { getDefaultCurrency } from "@/store/currencySlice";
// import { useNavigate } from "react-router-dom";
import noImage from "../assets/images/user.png";
import CustomButton from "@/extra/Button";
import { IconHistory, IconCopy } from "@tabler/icons-react";
import Searching from "@/extra/Searching";
import { usePermission } from "@/hooks/usePermission";
import { toast } from "react-toastify";

interface BannerData {
    _id: string;
    image: string;
    isActive: false;
}

const AdminEarnings = () => {
    // const navigate = useNavigate();
    const router = useRouter();
    const { can } = usePermission();

    const canEdit = can("Order-History", "Edit");
    const canDelete = can("Order-History", "Delete");
    const canList = can("Order-History", "List");

    const { adminEarnings, totalEarning, totalOrder } = useSelector(
        (state: RootStore) => state.adminEarning,
    );
    const [startDate, setStartDate] = useState<string | Date>("All");
    const [endDate, setEndDate] = useState<string | Date>("All");
    const [showURLs, setShowURLs] = useState([]);
    const { currency } = useSelector((state: any) => state.currency);

    const handlePageChange = (pageNumber: number) => {
        setPage(pageNumber);
    };

    const handleRowsPerPage = (value: number) => {
        setPage(1);
        setSize(value);
    };

    const startDateFormat = (startDate: string | Date): string => {
        return startDate && dayjs(startDate).isValid()
            ? dayjs(startDate).format("YYYY-MM-DD")
            : "All";
    };

    const endDateFormat = (endDate: string | Date): string => {
        return endDate && dayjs(endDate).isValid()
            ? dayjs(endDate).format("YYYY-MM-DD")
            : "All";
    };

    const dispatch = useAppDispatch();

    const [data, setData] = useState<any[]>([]);
    const [rowsPerPage, setRowsPerPage] = useState<number>(20);
    const [page, setPage] = useState<any>(1);
    const [size, setSize] = useState(10);
    const [search, setSearch] = useState<string>("");
    const [paymentGateway, setPaymentGateway] = useState<string>("");

    useEffect(() => {
        const payload = {
            startDate,
            endDate,
            page,
            size,
            search: search ?? "",
            paymentGateway
        };
        dispatch(getAdminEarning(payload));
    }, [dispatch, startDate, endDate, page, size, search, paymentGateway]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    useEffect(() => {
        dispatch(getDefaultCurrency());
    }, []);

    useEffect(() => {
        setData(adminEarnings);
    }, [adminEarnings]);

    const handleChangePage = (event: any, newPage: any) => {
        setPage(newPage);
    };

    const handleDeleteBanner = (row: any) => {
        const data = warning();
        data
            .then((res) => {
                if (res) {
                    dispatch(deleteBanner(row?._id));
                }
            })
            .catch((err) => console.log(err));
    };

    const handleOpen = (row) => {
        router.push(`/CoinPlanHistory?userId=${row._id}&userName=${row.name}`);
        // localStorage.setItem("adminEarningHistoryData", JSON.stringify(row));
    };

    const copyToClipboard = (Text) => {
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

    const fallbackCopy = (text) => {
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
            Header: "No",
            body: "no",
            Cell: ({ index }) => (
                <span className="  text-nowrap">
                    {(page - 1) * size + parseInt(index) + 1}
                </span>
            ),
        },
        {
            Header: "User Name",
            body: "fullName",
            Cell: ({ row, index }) => (
                <div
                    className="d-flex align-items-center justify-content-center"
                    style={{ cursor: "pointer", paddingLeft: "11%" }}
                >
                    <div style={{ width: "60px", textAlign: "center" }}>
                        <img
                            src={row?.image}
                            width="40px"
                            height="40px"
                            style={{ borderRadius: "50%" }}
                            onError={(e) => {
                                e.currentTarget.src = "/images/user.png";
                            }}
                        />
                    </div>
                    <div style={{ width: "200px", textAlign: "start" }}>
                        <div
                            className="text-capitalize   cursorPointer text-nowrap"
                            style={{ color: "#5f6870", fontWeight: 400 }}
                        >
                            {row?.name}
                            <IconCopy
                                size={16}
                                className="ms-1"
                                style={{ cursor: "pointer" }}
                                onClick={() => copyToClipboard(row?.name)}
                            />
                        </div>
                        <div
                            className="text-capitalize   cursorPointer text-nowrap"
                            style={{ color: "#5f6870", fontWeight: 400 }}
                        >
                            {row?.userName}
                            <IconCopy
                                size={16}
                                className="ms-1"
                                style={{ cursor: "pointer" }}
                                onClick={() => copyToClipboard(row?.userName)}
                            />
                        </div>
                        <div
                            className="text-capitalize   cursorPointer text-nowrap"
                            style={{ color: "#495057", fontWeight: 400 }}
                        >
                            {row?.uniqueId}
                            <IconCopy
                                size={16}
                                className="ms-1"
                                style={{ cursor: "pointer" }}
                                onClick={() => copyToClipboard(row?.uniqueId)}
                            />
                        </div>
                    </div>
                </div>
            ),
        },

        {
            Header: "Transaction Id",
            body: "transactionId",
            Cell: ({ row }) => (
                <span className="text-capitalize">{row?.transactionId}
                    <IconCopy
                        size={16}
                        className="ms-1"
                        style={{ cursor: "pointer" }}
                        onClick={() => copyToClipboard(row?.transactionId)}
                    />
                </span>
            ),
        },



        {
            Header: "Coin",
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
            Header: `Total Amount (${currency?.symbol})`,
            body: "totalAmountSpent",
            Cell: ({ row }) => (
                <span className="text-capitalize">
                    {row?.amount} {currency?.symbol}
                </span>
            ),
        },

        {
            Header: "Payment Gateway",
            body: "paymentGateway",
            Cell: ({ row }) => (
                <span className="text-capitalize">{row?.paymentGateway}</span>
            ),
        },
        {
            Header: "Date",
            body: "createdAt",
            Cell: ({ row }) => (
                <span className="text-capitalize">
                    {dayjs(row.createdAt).format("DD-MM-YYYY , hh:mm:ss A")}
                </span>
            ),
        },

    ];

    return (
        <>
            <div className={`userTable`} style={{ padding: "20px" }}>
                <div className="dashboardHeader primeHeader mb-3 p-0">
                    <NewTitle
                        dayAnalyticsShow={true}
                        setEndDate={setEndDate}
                        setStartDate={setStartDate}
                        startDate={startDate}
                        endDate={endDate}
                        titleShow={true}
                    />
                </div>

                <div className="d-flex justify-content-end"></div>

                <div className=" user-table">
                    <div className="user-table-top orderhistory-table-top">
                        <div className="d-flex flex-column flex-md-row justify-content-between w-100 align-items-start align-items-md-center gap-3">
                            <h5
                                className="text-nowrap"
                                style={{
                                    fontWeight: "500",
                                    fontSize: "20px",
                                    marginTop: "5px",
                                    marginBottom: "4px",
                                }}
                            >
                                Order History Table
                            </h5>
                            <div className="d-flex flex-column flex-md-row gap-3 w-100 w-md-auto justify-content-md-end align-items-stretch align-items-md-center">
                                <div className="report-filter-select" style={{ width: "100%", maxWidth: "200px" }}>
                                    <select
                                        className="form-select text-capitalize"
                                        value={paymentGateway}
                                        style={{ height: "40px", cursor: "pointer" }}
                                        onChange={(e) => {
                                            setPaymentGateway(e.target.value);
                                            setPage(1);
                                        }}
                                    >
                                        <option value="">All</option>
                                        <option value="In App Purchase">In-App Purchase</option>
                                        <option value="Razorpay">Razorpay</option>
                                        <option value="Stripe">Stripe</option>
                                        <option value="Flutterwave">Flutterwave</option>
                                        <option value="PayPal">PayPal</option>
                                        <option value="Paystack">Paystack</option>
                                        <option value="Cashfree">Cashfree</option>
                                    </select>
                                </div>
                                <div className="mobile-search-width" style={{ width: "100%", maxWidth: "300px" }}>
                                    <Searching
                                        placeholder="Search by Name, Username..."
                                        type="server"
                                        setSearchData={setSearch}
                                        searchValue={search}
                                        actionShow={false}
                                        button={false}
                                        newClass=""
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <>
                        <div className="d-flex  justify-content-end align-items-center gap-2 p-3 ">
                            <h4
                                className="text-success mb-0"
                                style={{
                                    fontWeight: "500",
                                    fontSize: "15px",
                                    whiteSpace: "nowrap",
                                    paddingRight: "20px",
                                }}
                            >
                                {/* Total Order History : {currency.symbol}
              {totalEarning} */}
                                Total Order History : {currency?.symbol || "$"}
                                {totalEarning || 0}
                            </h4>
                        </div>
                        <Table
                            data={data}
                            mapData={earningTable}
                            serverPerPage={size}
                            serverPage={page}
                            type={"server"}
                        />
                        <div className="mt-3 text-red-100">
                            <Pagination
                                type={"server"}
                                activePage={page}
                                rowsPerPage={size}
                                userTotal={totalOrder}
                                setPage={setPage}
                                // setData={setData}
                                // data={data}
                                actionShow={false}
                                handleRowsPerPage={handleRowsPerPage}
                                handlePageChange={handlePageChange}
                            />
                        </div>
                    </>
                </div>
            </div>
        </>
    );
};
AdminEarnings.getLayout = function getLayout(page: React.ReactNode) {
    return <RootLayout>{page}</RootLayout>;
};
export default AdminEarnings;
