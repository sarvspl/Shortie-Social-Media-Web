import React, { useEffect, useState } from "react";
import { usePermission } from "@/hooks/usePermission";
import Searching from "../../extra/Searching";
import Table from "../../extra/Table";
import Pagination from "../../extra/Pagination";
import { useSelector } from "react-redux";
import { getVerificationRequest } from "../../store/verificationRequestSlice";
import dayjs from "dayjs";
import { RootStore, useAppDispatch } from "@/store/store";
import { baseURL } from "@/util/config";
import useClearSessionStorageOnPopState from "@/extra/ClearStorage";
// import Image1 from "@/assets/images/1.jpg"
import { useRouter } from "next/router";
import NoImage from "../../assets/images/user.png";
import { Box, Dialog, DialogContent, IconButton, Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@/extra/Button";
import { IconEye, IconCopy, IconInfoCircle } from "@tabler/icons-react";
import { permissionError } from "@/util/Alert";
import Input, { Textarea } from "@/extra/Input";
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

const ImageCell = ({ src }: { src: string }) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const imageUrl =
        src && src.startsWith("http")
            ? src
            : src
                ? `${baseURL}/${src}`
                : "/images/noImage.png";

    return (
        <>
            <img
                src={imageUrl}
                width="60px"
                height="60px"
                style={{ objectFit: "cover", cursor: "pointer" }}
                onClick={handleOpen}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    const target = e.currentTarget;
                    target.onerror = null;
                    target.src = "/images/noImage.png";
                }}
                alt="thumbnail"
            />
            <Dialog open={open} onClose={handleClose} maxWidth="md">
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        padding: "8px",
                    }}
                >
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </div>
                <DialogContent style={{ padding: 0 }}>
                    <img
                        src={imageUrl}
                        style={{ width: "500px", height: "500px" }}
                        alt="full"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            const target = e.currentTarget;
                            target.onerror = null;
                            target.src = "/images/noImage.png";
                        }}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};

const truncateText = (text: string, maxLength = 40) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

const DetailsModal = ({ open, onClose, data }: { open: boolean; onClose: () => void; data: any }) => {
    // Shared style for labels and inputs
    const labelStyle = {
        fontSize: "12px",
        fontWeight: "600",
        color: "#6c757d",
        marginBottom: "6px",
        display: "block",
        textTransform: "uppercase" as const,
        letterSpacing: "0.5px"
    };

    const inputStyle = {
        backgroundColor: "#f8f9fa",
        border: "1px solid #dee2e6",
        borderRadius: "6px",
        padding: "10px 12px",
        fontSize: "14px",
        color: "#333",
        width: "100%",
        outline: "none",
        cursor: "default"
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                style: { borderRadius: "12px" }
            }}
        >
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center p-3" style={{ borderBottom: "1px solid #f0f0f0" }}>
                <h5 className="m-0" style={{ fontWeight: "700", fontSize: "18px", color: "#2c3e50" }}>
                    Verification Details
                </h5>
                <IconButton onClick={onClose} size="small" style={{ backgroundColor: "#fefefe" }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </div>

            <DialogContent className="p-4">
                <div className="row">
                    {/* Document ID Field */}
                    <div className="col-12 mb-3">
                        <label style={labelStyle}>Document ID</label>
                        <div style={inputStyle}>
                            {data?.documentId || "Not Provided"}
                        </div>
                    </div>

                    {/* Name on Document Field */}
                    <div className="col-12 mb-3">
                        <label style={labelStyle}>Name on Document</label>
                        <div style={{ ...inputStyle, textTransform: "capitalize" }}>
                            {data?.nameOnDocument || "Not Provided"}
                        </div>
                    </div>

                    {/* Address Field */}
                    <div className="col-12 mb-2">
                        <label style={labelStyle}>Registered Address</label>
                        <textarea
                            readOnly
                            rows={3}
                            style={{ ...inputStyle, resize: "none", lineHeight: "1.5" }}
                            value={data?.address || "No address found"}
                        />
                    </div>
                </div>
            </DialogContent>

            {/* Footer Section (Optional but adds to UI) */}
            <div className="p-3 text-end" style={{ backgroundColor: "#fcfcfc", borderTop: "1px solid #f0f0f0" }}>
                <button
                    onClick={onClose}
                    className="btn btn-secondary btn-sm px-4"
                    style={{ borderRadius: "6px", fontSize: "13px", fontWeight: "500" }}
                >
                    Close
                </button>
            </div>
        </Dialog>
    );
};

const DeclineVerificationRequest = () => {
    const router = useRouter();
    const { declinedData, totalDeclinedData } = useSelector(
        (state: RootStore) => state.verificationRequest,
    );
    const dispatch = useAppDispatch();
    const { can } = usePermission();
    const canCreate = can("Verification Request", "Create");
    const canEdit = can("Verification Request", "Edit");
    const canDelete = can("Verification Request", "Delete");
    const canList = can("Verification Request", "List");



    const [data, setData] = useState<any[]>([]);
    const [page, setPage] = useState<number>(1);
    const [size, setSize] = useState<number>(10);
    const [search, setSearch] = useState<string>("");
    const [openInfo, setOpenInfo] = useState(false);
    const [infoData, setInfodata] = useState<any>();
    const [openReason, setOpenReason] = useState(false);

    // State for Details Modal
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

    useClearSessionStorageOnPopState("multiButton");

    useEffect(() => {
        let payload: any = {
            start: page,
            limit: size,
            type: "declined",
            search: search ?? "",
        };
        dispatch(getVerificationRequest(payload));
    }, [page, size, search]);

    useEffect(() => {
        setData(declinedData);
    }, [declinedData]);

    const handleOpenInfo = (row: any) => {
        setOpenInfo(true);
        setInfodata(row);
    };

    const handleCloseReason = () => {
        setOpenReason(false);
    };

    const handleCloseInfo = () => {
        setOpenInfo(false);
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

    const handleOpenDetails = (row: any) => {
        setSelectedRequest(row);
        setDetailsOpen(true);
    };

    const postReportTable = [
        {
            Header: "No",
            body: "no",
            Cell: ({ index }: { index: number }) => (
                <span className="  text-nowrap">{(page - 1) * size + index + 1}</span>
            ),
        },
        {
            Header: "User",
            body: "userName",
            Cell: ({ row }: { row: any }) => (
                <div className="d-flex align-items-center justify-content-center gap-3 verify-user-cell verify-user-cell-same">
                    <div
                        style={{ width: "60px", textAlign: "center", paddingLeft: "9%" }}
                        onClick={() => {

                            localStorage.setItem("postProfile", JSON.stringify(row));
                            router.push({
                                pathname: "/viewProfile",
                                query: {
                                    id: row?.userId,
                                    type: "ViewFakeUser",
                                    includeFake: row?.isFake,
                                },
                            });
                        }}
                    >
                        {row?.user?.image && row?.user?.image !== "" ? (
                            <img
                                src={row?.user?.image}
                                onError={(e) => {
                                    e.currentTarget.src = "/images/user.png";
                                }}
                                width="60px"
                                height="60px"
                                style={{ objectFit: "cover", marginRight: "10px" }}
                            />
                        ) : (
                            <img
                                src="/images/1.jpg"
                                width="60px"
                                height="60px"
                                style={{ objectFit: "cover", marginRight: "10px" }}
                            />
                        )}
                    </div>
                    <div
                        style={{ width: "200px", textAlign: "start", paddingLeft: "9%" }}
                    >
                        <div
                            className="text-capitalize"
                            style={{ color: "#5f6870", fontWeight: 400 }}
                        >
                            {row?.user?.name}{" "}
                            <IconCopy
                                size={16}
                                className="ms-1"
                                style={{ cursor: "pointer" }}
                                onClick={() => copyToClipboard(row?.user?.name)}
                            />
                        </div>
                        <div className="text-capitalize" style={{ color: "#495057", fontWeight: 400 }}>
                            {row?.user?.userName}
                            <IconCopy
                                size={16}
                                className="ms-1"
                                style={{ cursor: "pointer" }}
                                onClick={() => copyToClipboard(row?.user?.userName)}
                            />
                        </div>
                        <div
                            className="text-capitalize"
                            style={{ color: "#495057", fontWeight: 400 }}
                        >
                            {row?.user?.uniqueId}{" "}
                            <IconCopy
                                size={16}
                                className="ms-1"
                                style={{ cursor: "pointer" }}
                                onClick={() => copyToClipboard(row?.user?.uniqueId)}
                            />
                        </div>
                    </div>
                </div>
            ),
        },
        {
            Header: "Profile Selfie",
            body: "profileSelfie",
            Cell: ({ row, index }: { row: any; index: number }) => (
                <ImageCell src={row?.profileSelfie} />
            ),
        },
        {
            Header: "Document",
            body: "document",
            Cell: ({ row, index }: { row: any; index: number }) => (
                <ImageCell src={row?.document} />
            ),
        },
        {
            Header: "Document Type",
            body: "documentType",
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize">{row?.nameOnDocument}</span>
            ),
        },


        {
            Header: "Declined date",
            body: "updatedAt",
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize">
                    {row?.updatedAt ? dayjs(row?.updatedAt).format("DD MMMM YYYY , hh:mm A") : ""}
                </span>
            ),
        },
        {
            Header: "Reason",
            body: "action",
            Cell: ({ row }: { row: any }) => (
                <div className="action-button">
                    <Button
                        btnIcon={<IconEye className="text-secondary icon-class" />}
                        onClick={() => {
                            handleOpenInfo(row);
                        }}
                    />
                </div>
            ),
        },

        {
            Header: "Details",
            body: "details",
            Cell: ({ row }: { row: any }) => (
                <div className="action-button">
                    <Button
                        btnIcon={<IconInfoCircle className="text-secondary icon-class icon-class" />}
                        onClick={() => handleOpenDetails(row)}
                    />
                </div>
            ),
        },
    ];

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

    return (
        <>
            <div className="userPage p-0">
                <div className=" user-table ">
                    <div className="user-table-top pendingverify-table-top">
                        <div className="w-100">
                            <h5
                                style={{
                                    fontWeight: "500",
                                    fontSize: "20px",
                                    marginTop: "5px",
                                    marginBottom: "4px",
                                }}
                            >
                                Decline Verification Request
                            </h5>
                        </div>
                        <Searching
                            placeholder={"Search by User, Username..."}
                            type={"server"}
                            setSearchData={setSearch}
                            searchValue={search}
                            actionShow={false}
                        />
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
                                userTotal={totalDeclinedData}
                                setPage={setPage}
                                handleRowsPerPage={handleRowsPerPage}
                                handlePageChange={handlePageChange}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                open={openInfo}
                onClose={handleCloseReason}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style} className="">
                    <div className="model-header">
                        <p className="m-0">Reason for Decline Verification Request</p>
                    </div>
                    <div className="model-body">
                        <div className="row sound-add-box" style={{ overflowX: "hidden" }}>
                            <div className="col-12 ">
                                <div className="col-12  text-about">
                                    <Textarea
                                        type={"text"}
                                        name={"Reason"}
                                        value={data[0]?.reason}
                                        newClass={``}
                                        readOnly
                                        row={10}
                                    />
                                </div>
                            </div>
                        </div>
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

            {/* Verification Details Modal */}
            <DetailsModal
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                data={selectedRequest}
            />
        </>
    );
};

export default DeclineVerificationRequest;
