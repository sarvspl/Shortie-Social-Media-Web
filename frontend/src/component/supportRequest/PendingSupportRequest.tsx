import Button from "@/extra/Button";
import Input, { Textarea } from "@/extra/Input";
import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import { getDefaultCurrency } from "@/store/currencySlice";
import { RootStore, useAppDispatch } from "@/store/store";
import {
  deleteSupportRequest,
  getSupportRequest,
  supportRequestAccept,
} from "@/store/supportSlice";
import { usePermission } from "@/hooks/usePermission";
import {
  getwithdrawRequest,
  withdrawRequestAccept,
  withdrawRequestDecline,
} from "@/store/withdrawRequestSlice";
import {
  permissionError,
  warning,
  warningForAccept,
  warningForText,
} from "@/util/Alert";
import { baseURL } from "@/util/config";
import { Box, Modal, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CustomButton from "@/extra/Button";
import Image from "next/image";
import TrashIcon from "../../assets/icons/trashIcon.svg";
import noImage from "../../assets/images/noImage.png";
import infoImage from "@/assets/images/info.svg";
import {
  IconCircleDashedCheck,
  IconInfoCircle,
  IconTrash,
  IconCopy,
} from "@tabler/icons-react";
import Searching from "@/extra/Searching";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const style: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  backgroundColor: "background.paper",
  borderRadius: "12px",
  border: "1px solid #C9C9C9",
  boxShadow: "24px",
  outline: "none",
};
interface ErrorState {
  reason: string;
}
const PendingSupportRequest = (props: any) => {
  const { pendingData, totalPendingData } = useSelector(
    (state: RootStore) => state.support,
  );

  const { currency } = useSelector((state: RootStore) => state.currency);

  const dispatch = useAppDispatch();

  const { startDate, endDate } = props;

  const { can } = usePermission();

  const canEdit = can("Support Request", "Edit");
  const canDelete = can("Support Request", "Delete");
  const canList = can("Support Request", "List");

  const [page, setPage] = useState(1);
  const [openReason, setOpenReason] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [infoData, setInfodata] = useState<any>();
  const [size, setSize] = useState(10);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState<string>("");



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

  useEffect(() => {
    let payload: any = {
      status: 1,
      startDate,
      endDate,
      search: search ?? "",
    };
    dispatch(getSupportRequest(payload));
  }, [dispatch, startDate, endDate, search]);

  useEffect(() => {
    setData(pendingData);
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

  const handleDeleteSupportRequest = (id: any) => {

    const data = warning();
    data
      .then((res) => {
        if (res) {
          dispatch(deleteSupportRequest(id));
        }
      })
      .catch((err) => console.log(err));
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
      Header: "Name",
      body: "name",
      Cell: ({ row, index }) => (
        <div
          className="d-flex align-items-center"
          style={{ cursor: "pointer", paddingLeft: "20%" }}
        >
          <img src={row?.userImage} width="40px" height="40px"
            onError={(e: any) => {
              e.target.onerror = null;
              e.target.src = "/images/user.png"
            }} />
          <div className="text-start">
            <div
              className="text-capitalize ms-3  cursorPointer text-nowrap"
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
              className="text-capitalize ms-3  cursorPointer text-nowrap"
              style={{ color: "#495057", fontWeight: 400 }}
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
              className="text-capitalize ms-3  cursorPointer text-nowrap"
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
      Header: "Date",
      body: "createdAt",
      Cell: ({ row }) =>
        <>
          <span className="text-capitalize">
            {dayjs(row.createdAt).format("DD-MM-YYYY , hh:mm:ss A")}
          </span>
        </>
    },

    {
      Header: "Info",
      body: "",
      Cell: ({ row }) => (
        <div className="action-button">
          <Button
            btnIcon={<IconInfoCircle className="text-secondary icon-class" />}
            newClass={`fw-bolder text-white`}
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
              <Button
                btnIcon={<IconCircleDashedCheck className="text-secondary icon-class" />}
                newClass={`fw-bolder text-white`}
                onClick={() => handleEdit(row, "pay")}
              />
            )}
            {canDelete && (
              <CustomButton
                btnIcon={<IconTrash className="text-secondary icon-class" />}
                onClick={() => {

                  handleDeleteSupportRequest(row?._id)
                }}
              />
            )}
          </div>
        ),
      }
    ] : [])
  ];

  const handleEdit = (row: any, type: any) => {

    const data = warningForAccept();
    data
      .then((res) => {
        if (res) {
          dispatch(supportRequestAccept(row?._id));
        }
      })
      .catch((err) => console.log(err));
  };

  const handleCloseReason = () => {
    setOpenReason(false);
  };

  const handleCloseInfo = () => {
    setOpenInfo(false);
  };

  return (
    <>
      { }
      <div className="user-table real-user mb-3">
        <div className="user-table-top support-table-top">
          <h5
            style={{
              fontWeight: "500",
              fontSize: "20px",
              marginBottom: "5px",
              marginTop: "5px",
            }}
          >
            Support Request
          </h5>
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

      {/* For a Info Dialog :- */}

      <Modal
        open={openInfo}
        onClose={handleCloseReason}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="">
          <div className="model-header">
            <p className="m-0">Support Info</p>
          </div>

          <div className="model-body">
            <form>
              <div
                className="row sound-add-box"
                style={{ overflowX: "hidden" }}
              >
                {infoData && (
                  <div className="col-12 mt-2">
                    <div className="col-12 mt-3 text-about">
                      <Textarea
                        type={"text"}
                        label={"Description"}
                        name={"description"}
                        value={infoData?.complaint}
                        newClass={`mt-3`}
                        row={4}
                        readOnly
                      />
                    </div>

                    <div className="col-12 mt-1 text-about">
                      <Input
                        type={"text"}
                        label={"Contact number"}
                        name={"Contact number"}
                        value={infoData?.contact}
                        newClass={`mt-3`}
                        readOnly
                      />
                    </div>

                    <div className="col-12 mt-3 text-about">
                      <div>Image</div>
                      <img
                        src={infoData?.image ? infoData?.image : "/images/user.png"}
                        style={{
                          opacity:
                            infoData?.isComplaintImageRestricted === true
                              ? 0.5
                              : 1,
                        }}
                        width="80px"
                        height="80px"
                        onError={(e: any) => {
                          e.target.onerror = null;
                          e.target.src = "/images/user.png";
                        }}
                      />
                    </div>
                  </div>
                )}
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

export default PendingSupportRequest;
