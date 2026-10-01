import React, { useEffect, useState } from "react";
import Searching from "../../extra/Searching";
import Table from "../../extra/Table";
import Pagination from "../../extra/Pagination";
import { useSelector } from "react-redux";
import { deleteReport, getReport, solvedReport } from "../../store/reportSlice";
import dayjs from "dayjs";
import Button from "../../extra/Button";
import TrashIcon from "../../assets/icons/trashIcon.svg";
import TrueArrow from "../../assets/icons/TrueArrow.svg";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { permissionError, warning } from "../../util/Alert";
import { RootStore, useAppDispatch } from "@/store/store";
import Image from "next/image";
import { baseURL } from "@/util/config";
import useClearSessionStorageOnPopState from "@/extra/ClearStorage";
import { usePermission } from "@/hooks/usePermission";
import { IconCheck, IconX, IconCopy } from "@tabler/icons-react";
import noImage from "../../assets/images/user.png";
import { toast } from "react-toastify";

const UserReport = (props) => {
  const startDate = props?.startDate;
  const endDate = props?.endDate;

  const { userReport, totalUserReport } = useSelector(
    (state: RootStore) => state.report,
  );



  const dispatch = useAppDispatch();
  const { can } = usePermission();

  const canEdit = can("Report", "Edit");
  const canDelete = can("Report", "Delete");
  const canList = can("Report", "List");

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(10);
  const [type, setType] = useState<any>("All");
  const [search, setSearch] = useState<string>("");
  useClearSessionStorageOnPopState("multiButton");

  useEffect(() => {
    let payload: any = {
      start: page,
      limit: size,
      status: type,
      startDate: startDate,
      endDate: endDate,
      type: 3,
      search: search ?? "",
    };
    dispatch(getReport(payload));
  }, [page, size, type, startDate, endDate, search]);

  useEffect(() => {
    setData(userReport);
  }, [userReport]);

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

  const postReportTable = [
    {
      Header: "NO",
      body: "no",
      Cell: ({ index }: { index: number }) => (
        <span className="  text-nowrap">{(page - 1) * size + index + 1}</span>
      ),
    },
    {
      Header: "Reporter User",
      body: "reporterUser",
      Cell: ({ row, index }: { row: any; index: number }) => (
        <div
          className="d-flex align-items-center reporter-user-cell"
          style={{ cursor: "pointer", paddingLeft: "15%" }}
        >
          <img
            src={row?.image}
            width="48px"
            height="48px"
            style={{ objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.src = "/images/user.png";
            }}
          />

          <div className="text-start">
            <div
              className="ms-3 text-nowrap"
              style={{ color: "#6c757d", fontWeight: 500 }}
            >
              {row?.name}
            </div>

            <div
              className="ms-3 text-nowrap"
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
              className="ms-3 text-nowrap"
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
      Header: "Reported User",
      body: "reportedUser",
      Cell: ({ row, index }: { row: any; index: number }) => (
        <div
          className="d-flex align-items-center reporter-user-cell"
          style={{ cursor: "pointer", paddingLeft: "15%" }}
        >
          <img
            src={row?.toUserImage}
            width="48px"
            height="48px"
            style={{ objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.src = "/images/user.png";
            }}
          />

          <div className="text-start">
            <div
              className="ms-3 text-nowrap"
              style={{ color: "#6c757d", fontWeight: 500 }}
            >
              {row?.toUserName}
            </div>

            <div
              className="ms-3 text-nowrap"
              style={{ color: "#5f6870", fontWeight: 400 }}
            >
              {row?.toUserUserName}
              <IconCopy
                size={16}
                className="ms-1"
                style={{ cursor: "pointer" }}
                onClick={() => copyToClipboard(row?.toUserUserName)}
              />
            </div>

            <div
              className="ms-3 text-nowrap"
              style={{ color: "#495057", fontWeight: 400 }}
            >
              {row?.toUserUniqueId}
              <IconCopy
                size={16}
                className="ms-1"
                style={{ cursor: "pointer" }}
                onClick={() => copyToClipboard(row?.toUserUniqueId)}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      Header: "User report reason",
      body: "reportType",
      Cell: ({ row }: { row: any }) => (
        <>{<span className="text-capitalize">{row?.reportReason}</span>}</>
      ),
    },
    {
      Header: "Status",
      body: "status",
      Cell: ({ row }: { row: any }) => (
        <>
          {row?.status === 1 && (
            <span className="text-capitalize badge badge-primary p-2">
              Pending
            </span>
          )}
          {row?.status === 2 && (
            <span className="text-capitalize badge badge-success p-2">
              Solved
            </span>
          )}
        </>
      ),
    },
    {
      Header: "User reported",
      body: "createdAt",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize">
          {row?.createdAt ? dayjs(row?.createdAt).format("DD MMMM YYYY , hh:mm A") : ""}
        </span>
      ),
    },
    ...(canEdit || canDelete ? [
      {
        Header: "Action",
        body: "action",
        Cell: ({ row }: { row: any }) => (
          <div className="action-button">
            {row.status === 2 ? (
              ""
            ) : (
              <>
                {canEdit && (
                  <Button
                    btnIcon={<IconCheck className="text-secondary icon-class" />}
                    onClick={() => handleSolved(row?._id)}
                  />
                )}
              </>
            )}
            {canDelete && (
              <Button
                btnIcon={<IconX className="text-secondary icon-class" />}
                onClick={() => handleDeleteReport(row)}
              />
            )}
          </div>
        ),
      }] : []),
  ];

  const selectType = (type: any) => {
    let payload: any = {
      startDate: "All",
      endDate: "All",
      type: type,
    };
    setType(type);
  };

  const handleFilterData = (filteredData: any) => {
    if (typeof filteredData === "string") {
      setSearch(filteredData);
    } else {
      setData(filteredData);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setPage(pageNumber);
  };

  const handleRowsPerPage = (value: number) => {
    setPage(1);
    setSize(value);
  };

  const handleSolved = (id: any) => {

    const payload: any = {
      reportId: id,
      reportType: 3,
    };
    dispatch(solvedReport(payload));
  };

  const handleDeleteReport = (row: any) => {

    const data = warning();
    data
      .then((logouts: any) => {
        if (logouts) {
          const payload: any = {
            reportId: row?._id,
            reportType: 3,
          };
          dispatch(deleteReport(payload));
        }
      })
      .catch((err: any) => console.log(err));
  };

  return (
    <>
      <div className="">
        <div className=" user-table ">
          {canList && (
            <>
              <div className="user-table-top userreport-table-top">
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
                    User Report
                  </h5>
                  <div className="d-flex flex-column flex-sm-row gap-3 w-100 w-sm-auto justify-content-sm-end align-items-stretch align-items-sm-center">
                    <div className="report-filter-select">
                      <select
                        name=""
                        id=""
                        className="form-select"
                        value={type}
                        onChange={(e) =>
                          selectType(
                            e.target.value === "All"
                              ? "All"
                              : parseInt(e.target.value),
                          )
                        }
                      >
                        <option value="All"> All</option>
                        <option value={1}> Pending</option>
                        <option value={2}> Solved</option>
                      </select>
                    </div>
                    <div className="mobile-search-width">
                      <Searching
                        placeholder={"Search by Name, Username..."}
                        type={"server"}
                        setSearchData={setSearch}
                        searchValue={search}
                        actionShow={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="">
                <Table
                  data={data}
                  mapData={postReportTable}
                  serverPerPage={size}
                  serverPage={page}
                  type={"server"}
                />
                <div className="">
                  <Pagination
                    type={"server"}
                    activePage={page}
                    rowsPerPage={size}
                    userTotal={totalUserReport}
                    setPage={setPage}
                    handleRowsPerPage={handleRowsPerPage}
                    handlePageChange={handlePageChange}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UserReport;
