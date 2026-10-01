import useClearSessionStorageOnPopState from "@/extra/ClearStorage";
import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import { getDefaultCurrency } from "@/store/currencySlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { getwithdrawRequest } from "@/store/withdrawRequestSlice";
import { usePermission } from "@/hooks/usePermission";
import { baseURL } from "@/util/config";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
// import userImage from "../../assets/images/8.jpg";
import noImage from "../../assets/images/user.png";
import Searching from "@/extra/Searching";
import { IconCopy } from "@tabler/icons-react";
import { toast } from "react-toastify";

const AcceptedRequest = (props) => {
  const { acceptedData, totalAcceptedData } = useSelector(
    (state: RootStore) => state.withdrawRequest,
  );

  const { currency } = useSelector((state: RootStore) => state.currency);

  const dispatch = useAppDispatch();

  const { startDate, endDate } = props;

  const { can } = usePermission();

  const canEdit = can("Withdraw Request", "Edit");
  const canDelete = can("Withdraw Request", "Delete");
  const canList = can("Withdraw Request", "List");

  const [page, setPage] = useState(1);
  const [showURLs, setShowURLs] = useState([]);

  const [size, setSize] = useState(10);
  const [data, setData] = useState([]);
  const [defaultCurrency, setDefaultCurrency] = useState<any>({});
  const [search, setSearch] = useState<string>("");

  useClearSessionStorageOnPopState("multiButton");

  useEffect(() => {
      let payload: any = {
        type: 2,
        start: page,
        limit: size,
        startDate: startDate,
        endDate: endDate,
        search: search ?? "",
      };
      dispatch(getwithdrawRequest(payload));
      dispatch(getDefaultCurrency());
  }, [dispatch, page, size, startDate, endDate, search]);

  useEffect(() => {
    setData(acceptedData);
    setDefaultCurrency(currency);
  }, [acceptedData, currency]);

  useEffect(() => {
    setPage(1);
  }, [search]);

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

  const ManageUserData = [
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
      Header: "Username",
      body: "userName",
      Cell: ({ row, index }) => (
        <div
          className="d-flex align-items-center username-cell-responsive "
          style={{ cursor: "pointer", paddingLeft: "20%" }}
        >
          <img
            src={row?.user?.image === "" ? "/images/8.jpg" : row?.user?.image}
            width="40px"
            height="40px"
            onError={(e) => {
              e.currentTarget.src = "/images/user.png";
            }}
          />
          <div className="text-start">
            <div
              className="text-capitalize  ms-3 cursorPointer text-nowrap"
              style={{ color: "#5f6870", fontWeight: 400 }}
            >
              {row?.user?.name}
              <IconCopy
                size={16}
                className="ms-1"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(row?.user?.name);
                }}
              />
            </div>
            <div
              className="text-capitalize  ms-3 cursorPointer text-nowrap"
              style={{ color: "#5f6870", fontWeight: 400 }}
            >
              {row?.user?.userName}
              <IconCopy
                size={16}
                className="ms-1"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(row?.user?.userName);
                }}
              />
            </div>
            <div
              className="text-capitalize  ms-3 cursorPointer text-nowrap"
              style={{ color: "#495057", fontWeight: 400 }}
            >
              {row?.user?.uniqueId}
              <IconCopy
                size={16}
                className="ms-1"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(row?.user?.uniqueId);
                }}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      Header: "Unique ID",
      body: "uniqueId",
      Cell: ({ row }: { row: any }) => (
        <span
          className="text-capitalize"
          style={{ color: "#495057", fontWeight: 400 }}
        >
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
      Header: `Request amount(${defaultCurrency?.symbol ? defaultCurrency?.symbol : ""})`,
      body: "requestAmount",
      Cell: ({ row }) => (
        <span className="text-lowercase cursorPointer">
          {row?.amount} {defaultCurrency?.symbol}
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
            paddingLeft: "20%",
            gap: "5px",
          }}
        >
          <img src="/images/coin.png" width="18px" height="18px" />

          <span className="text-capitalize">{row?.coin}</span>
        </div>
      ),
    },
    {
      Header: "Payment gateway",
      body: "paymentGateway",
      Cell: ({ row }) => <span>{row?.paymentGateway}</span>,
    },
    {
      Header: "Date",
      body: "createdAt",
      Cell: ({ row }) => <span>{row?.acceptOrDeclineDate}</span>,
    },
  ];

  return (
    <>
      <div className="user-table real-user mb-3">
        <div className="user-table-top withdraw-request-top">
          <div className="row align-items-start">
            <div className="">
              <h5
                style={{
                  fontWeight: "500",
                  fontSize: "20px",
                  marginBottom: "5px",
                  marginTop: "5px",
                }}
              >
                Accepted Withdraw Request
              </h5>
            </div>
          </div>

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
        {canList && (
          <>
            <Table
              data={data}
              mapData={ManageUserData}
              serverPerPage={size}
              serverPage={page}
              type={"server"}
            />
            <Pagination
              type={"server"}
              activePage={page}
              rowsPerPage={size}
              userTotal={totalAcceptedData}
              setPage={setPage}
              handleRowsPerPage={handleRowsPerPage}
              handlePageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </>
  );
};

export default AcceptedRequest;
