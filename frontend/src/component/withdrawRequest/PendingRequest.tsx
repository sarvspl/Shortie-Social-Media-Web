import Button from "@/extra/Button";
import Input from "@/extra/Input";
import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import { getDefaultCurrency } from "@/store/currencySlice";
import { RootStore, useAppDispatch } from "@/store/store";
import {
  getwithdrawRequest,
  withdrawRequestAccept,
  withdrawRequestDecline,
} from "@/store/withdrawRequestSlice";
import { usePermission } from "@/hooks/usePermission";
import { baseURL } from "@/util/config";
import { Box, Modal, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import infoImage from "@/assets/images/info.svg";
import {
  IconCircleCheck,
  IconCircleX,
  IconInfoCircle,
} from "@tabler/icons-react";
import CustomButton from "@/extra/Button";
import { permissionError } from "@/util/Alert";
import noImage from "../../assets/images/noImage.png";
import Searching from "@/extra/Searching";
import { IconCopy } from "@tabler/icons-react";
import { toast } from "react-toastify";

const style: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  backgroundColor: "background.paper",
  borderRadius: "5px",
  border: "1px solid #C9C9C9",
  boxShadow: "24px",
  // padding: "19px",
};
interface ErrorState {
  reason: string;
}
const PendingRequest = (props: any) => {
  const { pendingData, totalPendingData } = useSelector(
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
  const [reasonData, setReasonData] = useState("");
  const [openReason, setOpenReason] = useState(false);
  const [isAccept, setIsAccept] = useState(false);
  const [declinedId, setDeclinedId] = useState<string>();
  const [acceptId, setAcceptId] = useState<any>();
  const [openInfo, setOpenInfo] = useState(false);
  const [infoData, setInfodata] = useState<any>();
  const [search, setSearch] = useState<string>("");

  const [error, setError] = useState<ErrorState>({
    reason: "",
  });

  const [size, setSize] = useState(10);
  const [data, setData] = useState([]);
  const [defaultCurrency, setDefaultCurrency] = useState<any>({});

  useEffect(() => {
    let payload: any = {
      type: 1,
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
    setData(pendingData);
    setDefaultCurrency(currency);
  }, [pendingData, currency]);

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

  const handleOpenInfo = (row) => {
    setOpenInfo(true);
    setInfodata(row);
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

    // {
    //   Header: "Username",
    //   body: "userName",
    //   Cell: ({ row, index }) => (
    //     <div
    //       className="d-flex align-items-center "
    //       style={{ cursor: "pointer", paddingLeft: "11%" }}
    //     >
    //       <img
    //         src={row?.user?.image}
    //         width="40px"
    //         height="40px"
    //         onError={(e) => {
    //           e.currentTarget.src = "/images/user.png";
    //         }}
    //       />
    //       <div className="text-start">
    //         <div className="text-capitalize  ms-3 cursorPointer text-nowrap">
    //           {row?.user?.name}
    //         </div>
    //         <div className="text-capitalize  ms-3 cursorPointer text-nowrap">
    //           {row?.user?.uniqueId}
    //         </div>
    //       </div>
    //     </div>
    //   ),
    // },

    {
      Header: "Username",
      body: "userName",
      Cell: ({ row, index }) => (
        <div
          className="d-flex align-items-center username-cell"
          style={{ cursor: "pointer", paddingLeft: "11%" }}
        >
          <img
            className="username-img"
            src={row?.user?.image}
            width="40px"
            height="40px"
            onError={(e) => {
              e.currentTarget.src = "/images/user.png";
            }}
          />

          <div className="text-start username-text">
            <div
              className="text-capitalize ms-3 cursorPointer text-nowrap username-name"
              style={{ color: "#5f6870", fontWeight: 400 }}
            >
              {row?.user?.name}{" "}
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
              className="text-capitalize ms-3 cursorPointer text-nowrap username-name"
              style={{ color: "#5f6870", fontWeight: 400 }}
            >
              {row?.user?.userName}{" "}
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
              className="text-capitalize ms-3 cursorPointer text-nowrap username-id"
              style={{ color: "#495057", fontWeight: 400 }}
            >
              {row?.user?.uniqueId}{" "}
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
            paddingRight: "25%",
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
      Cell: ({ row }) => <span>{row?.requestDate}</span>,
    },

    {
      Header: "Info",
      body: "",
      Cell: ({ row }) => (
        <div className="action-button">
          <CustomButton
            btnIcon={<IconInfoCircle className="text-secondary icon-class" />}
            onClick={() => handleOpenInfo(row)}
          />
        </div>
      ),
    },

    ...(canEdit || canDelete ? [
      {
        Header: "Action",
        body: "action",
        Cell: ({ row }) => (
          <div className="action-button">
            {canEdit && (
              <CustomButton
                btnIcon={<IconCircleCheck className="text-success" />}
                onClick={() => handleEdit(row, "pay")}
              />
            )}
            {canDelete && (
              <CustomButton
                btnIcon={<IconCircleX className="text-danger" />}
                onClick={() => handleDecline(row?._id)}
              />
            )}
          </div>
        ),
      }] : []),
  ];

  const handleEdit = (row: any, type: any) => {
    setIsAccept(true);
    setAcceptId(row?._id);
  };

  const handleCloseReason = () => {
    setOpenReason(false);
  };

  const handleDecline = (id: any) => {
    setOpenReason(true);
    setDeclinedId(id);
  };

  const handleSubmit = () => {

    if (!reasonData) {
      let error = {} as ErrorState;
      if (!reasonData) error.reason = "Reason is required";
      return setError({ ...error });
    } else {
      const reason = {
        reason: reasonData,
      };
      const payload: any = {
        withdrawRequestId: declinedId,
        reason: reasonData,
      };
      dispatch(withdrawRequestDecline(payload));
      handleCloseReason();
    }
  };

  const handleAcceptRequest = () => {


    dispatch(withdrawRequestAccept(acceptId));
    handleIsAccept();
  };

  const handleIsAccept = () => {
    setIsAccept(false);
  };

  const handleCloseInfo = () => {
    setOpenInfo(false);
  };

  return (
    <>
      { }
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
                Pending Withdraw Request
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
              userTotal={totalPendingData}
              setPage={setPage}
              handleRowsPerPage={handleRowsPerPage}
              handlePageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {/* For a Pending Decline a Withdraw request :-  */}
      <Modal
        open={openReason}
        onClose={handleCloseReason}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="">
          <div className="model-header">
            <p className="m-0">Reason</p>
          </div>

          <div className="model-body">
            <form>
              <div
                className="row sound-add-box"
                style={{ overflowX: "hidden" }}
              >
                <div className="col-12 text-about">
                  <label className="label-form">Reason</label>
                  <textarea
                    cols={6}
                    rows={4}
                    className="form-control"
                    value={reasonData}
                    placeholder="Enter reason..."
                    onChange={(e) => {
                      setReasonData(e.target.value);
                      if (!e.target.value) {
                        return setError({
                          ...error,
                          reason: `Reason Is Required`,
                        });
                      } else {
                        return setError({
                          ...error,
                          reason: "",
                        });
                      }
                    }}
                  ></textarea>
                  {error.reason && (
                    <p className="errorMessage">
                      {error.reason && error.reason}
                    </p>
                  )}
                </div>
              </div>
            </form>
          </div>

          <div className="model-footer">
            <div className="p-3 d-flex justify-content-end">
              <Button
                onClick={handleCloseReason}
                btnName={"Close"}
                newClass={"close-model-btn"}
              />
              {canEdit && (
                <Button
                  onClick={handleSubmit}
                  btnName={"Submit"}
                  type={"button"}
                  newClass={"submit-btn"}
                  style={{
                    borderRadius: "0.5rem",
                    width: "88px",
                    marginLeft: "10px",
                  }}
                />
              )}
            </div>
          </div>
        </Box>
      </Modal>

      {/* For a accepted a Withdraw request :-  */}

      <Modal
        open={isAccept}
        onClose={handleIsAccept}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="">
          <div className="model-body">
            <p className="fs-4 fw-medium m-0 my-4 text-center ">
              Would you like to approve the withdraw request?
            </p>
          </div>

          <div className="model-footer">
            <div className="p-3 d-flex justify-content-end">
              <Button
                onClick={handleIsAccept}
                btnName={"Close"}
                newClass={"close-model-btn"}
              />
              {canEdit && (
                <Button
                  onClick={handleAcceptRequest}
                  btnName={"Pay"}
                  type={"button"}
                  newClass={"submit-btn"}
                  style={{
                    borderRadius: "0.5rem",
                    width: "88px",
                    marginLeft: "10px",
                  }}
                />
              )}
            </div>
          </div>
        </Box>
      </Modal>

      {/* For a Info Dialog :- */}

      <Modal
        open={openInfo}
        onClose={handleCloseReason}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="">
          <div className="model-header">
            <p className="m-0">Payment Details Info</p>
          </div>

          <div className="model-body">
            <form>
              <div
                className="row sound-add-box"
                style={{ overflowX: "hidden" }}
              >
                <div className="col-12 ">
                  <div className="col-12  text-about">
                    <Input
                      type={"text"}
                      label={"Payment Gateway"}
                      name={"Payment Gateway"}
                      value={infoData?.paymentGateway}
                      newClass={``}
                      readOnly
                    />
                  </div>

                  {infoData?.paymentDetails?.map((item) => {
                    return (
                      <div className="col-12 mt-1 text-about">
                        <Input
                          type={"text"}
                          label={item?.split(":")[0]}
                          name={"Payment Details"}
                          value={item?.split(":")[1]}
                          newClass={`mt-3`}
                          readOnly
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </form>
          </div>
          <div className="model-footer">
            <div className="p-3 d-flex justify-content-end">
              <Button
                onClick={handleCloseInfo}
                btnName={"Close"}
                newClass={"close-model-btn"}
              />
            </div>
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default PendingRequest;
