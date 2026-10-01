import React, { useEffect, useState } from "react";
import { usePermission } from "@/hooks/usePermission";
import Searching from "../../extra/Searching";
import Table from "../../extra/Table";
import Pagination from "../../extra/Pagination";
import { useSelector } from "react-redux";
import {
    getVerificationRequest,
    verificationRequestAccept,
    verificationRequestDecline,
} from "../../store/verificationRequestSlice";
import dayjs from "dayjs";
import Button from "../../extra/Button";
import TrueArrow from "../../assets/icons/TrueArrow.svg";
import Close from "../../assets/icons/close.svg";
import {
    Box,
    Dialog,
    DialogContent,
    IconButton,
    Modal,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { RootStore, useAppDispatch } from "@/store/store";
import Image from "next/image";
import { baseURL } from "@/util/config";
import useClearSessionStorageOnPopState from "@/extra/ClearStorage";
import { withdrawRequestAccept } from "@/store/withdrawRequestSlice";
// import Image1 from "@/assets/images/1.jpg";
import { useRouter } from "next/router";
import { IconCheck, IconX, IconCopy, IconEye, IconInfoCircle } from "@tabler/icons-react";
import { permissionError } from "@/util/Alert";
import NoImage from "../../assets/images/user.png";
import { toast } from "react-toastify";

const style: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    backgroundColor: "background.paper",
    borderRadius: "13px",
    border: "1px solid #C9C9C9",
    boxShadow: "24px",
    padding: "19px",
};

interface ErrorState {
    reason: string;
}

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
                width={60}
                height={60}
                style={{ objectFit: "cover", cursor: "pointer" }}
                onClick={handleOpen}
                alt="thumbnail"
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    const target = e.currentTarget;
                    target.onerror = null; // prevent infinite loop
                    target.src = "/images/noImage.png";
                }}
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
                        style={{ width: "100%", height: "100%" }}
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

const PendingVerificationRequest = () => {
    const router = useRouter();

    const { pendingData, totalPendingData } = useSelector(
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
    const [reasonData, setReasonData] = useState("");
    const [size, setSize] = useState<number>(10);
    const [openReason, setOpenReason] = useState(false);
    const [search, setSearch] = useState<string>("");
    const [declinedId, setDeclinedId] = useState<string>();
    const [isAccept, setIsAccept] = useState(false);
    const [acceptId, setAcceptId] = useState<any>();
    const [error, setError] = useState<ErrorState>({
        reason: "",
    });

    // State for Details Modal
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

    useClearSessionStorageOnPopState("multiButton");



    useEffect(() => {
        let payload: any = {
            start: page,
            limit: size,
            type: "pending",
            search: search ?? "",
        };
        dispatch(getVerificationRequest(payload));
    }, [page, size, search]);

    useEffect(() => {
        setData(pendingData);
    }, [pendingData]);

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
                <div className="d-flex align-items-center justify-content-center gap-4 verify-user-cell">
                    <div
                        style={{ width: "60px", textAlign: "center" }}
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
                    <div style={{ width: "200px", textAlign: "start" }}>
                        <div
                            className="text-capitalize"
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
            Header: "Date",
            body: "date",
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize">
                    {row?.date ? dayjs(row?.date).format("DD MMMM YYYY , hh:mm A") : ""}
                </span>
            ),
        },
        ...(canList || canEdit || canDelete ? [
            {
                Header: "Action",
                body: "action",
                Cell: ({ row }: { row: any }) => (
                    <div className="action-button">
                        <Button
                            btnIcon={<IconEye className="text-secondary icon-class" />}
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
                        />
                        {canEdit && (
                            <>
                                <Button
                                    btnIcon={<IconCheck className="text-secondary icon-class" />}
                                    onClick={() => handleEdit(row?._id, "pay")}
                                />
                            </>
                        )}
                        {canDelete && (
                            <Button
                                btnIcon={<IconX className="text-secondary icon-class" />}
                                onClick={() => handleDecline(row?._id)}
                            />
                        )}
                    </div>
                ),
            }] : []),
        {
            Header: "Details",
            body: "details",
            Cell: ({ row }: { row: any }) => (
                <div className="action-button">
                    <Button
                        btnIcon={<IconInfoCircle className="text-secondary icon-class " />}
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

    const handleSolved = (id: any) => {

        dispatch(verificationRequestAccept(acceptId));
        handleIsAccept();
    };

    const handleDecline = (id: any) => {

        setOpenReason(true);
        setDeclinedId(id);
    };

    const handleCloseReason = () => {
        setOpenReason(false);
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
                verificationRequestId: declinedId,
                data: reason,
                type: "pending",
            };
            dispatch(verificationRequestDecline(payload));
            handleCloseReason();
        }
    };

    const handleEdit = (id: any, type: any) => {

        setIsAccept(true);
        setAcceptId(id);
    };

    const handleIsAccept = () => {
        setIsAccept(false);
    };

    return (
        <>
            <div className="userPage p-0">
                <div className=" user-table ">
                    <div className="user-table-top pendingverify-table-top">
                        <div className="">
                            <h5
                                className="text-nowrap"
                                style={{
                                    fontWeight: "500",
                                    fontSize: "20px",
                                    marginTop: "5px",
                                    marginBottom: "4px",
                                }}
                            >
                                Pending Verification Request
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
                                userTotal={totalPendingData}
                                setPage={setPage}
                                handleRowsPerPage={handleRowsPerPage}
                                handlePageChange={handlePageChange}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* For a Decline Withdraw request :-  */}
            <Modal
                open={openReason}
                onClose={handleCloseReason}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style} className="create-channel-model">
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Reason
                    </Typography>
                    <form style={{ padding: "15px", paddingTop: "0px" }}>
                        <div className="row sound-add-box" style={{ overflowX: "hidden" }}>
                            <div className="col-12 mt-2">
                                <div className="col-12 mt-3 text-about">
                                    <textarea
                                        cols={6}
                                        rows={6}
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
                            <div className="mt-3 d-flex justify-content-end">
                                <Button
                                    onClick={handleCloseReason}
                                    btnName={"Close"}
                                    newClass={"close-model-btn"}
                                />
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
                            </div>
                        </div>
                    </form>
                </Box>
            </Modal>

            {/* For a accepted a Verification request :-  */}

            <Modal
                open={isAccept}
                onClose={handleIsAccept}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style} className="create-channel-model">
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Would you like to accept a verification request?
                    </Typography>

                    <div className="mt-3 d-flex justify-content-end">
                        <Button
                            onClick={handleIsAccept}
                            btnName={"Close"}
                            newClass={"close-model-btn"}
                        />
                        <Button
                            onClick={handleSolved}
                            btnName={"Submit"}
                            type={"button"}
                            newClass={"submit-btn"}
                            style={{
                                borderRadius: "0.5rem",
                                width: "88px",
                                marginLeft: "10px",
                            }}
                        />
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

export default PendingVerificationRequest;
