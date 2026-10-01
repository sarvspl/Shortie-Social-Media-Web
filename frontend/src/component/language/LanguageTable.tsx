import React, { useEffect, useState } from "react";
import Button from "@/extra/Button";
import { usePermission } from "@/hooks/usePermission";
import { permissionError } from "@/util/Alert";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import ToggleSwitch from "@/extra/ToggleSwitch";
import { IconEdit, IconTrash, IconFileUpload, IconFileDownload, IconInfoCircle, IconSearch } from "@tabler/icons-react";
import { useAppDispatch, useAppSelector, RootStore } from "@/store/store";
import { openDialog } from "@/store/dialogSlice";
import { warning } from "@/util/Alert";
import { setToast } from "@/util/toastServices";
import RootLayout from "../layout/Layout";
import AddIcon from "@mui/icons-material/Add";
import { deleteLanguage, downloadTranslationsCSV, getAllLanguages, toggleLanguage, getLanguage, getLanguageTranslations } from "@/store/languageSlice";
import { baseURL } from "@/util/config";
import Searching from "@/extra/Searching";

const LanguageTable = () => {
    const dispatch = useAppDispatch();
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);

    const { can } = usePermission();
    const canCreate = can("Language", "Create");
    const canEdit = can("Language", "Edit");
    const canDelete = can("Language", "Delete");
    const canList = can("Language", "List");

    const { languages, totalLanguages } = useAppSelector((state: RootStore) => state.language);


    useEffect(() => {
        dispatch(getAllLanguages({ start: page, limit: size }));
    }, [dispatch, page, size]);

    const handlePageChange = (pageNumber) => setPage(pageNumber);
    const handleRowsPerPage = (value) => {
        setPage(1);
        setSize(value);
    };

    const handleOpenAddLanguage = () => {
        dispatch(openDialog({ type: "language" }));
    };

    const handleOpenEditLanguage = (row) => {
        dispatch(openDialog({ type: "language", data: row }));
    };

    const handleOpenUploadCSV = () => {
        dispatch(openDialog({ type: "uploadCSV" }));
    };

    const handleOpenTranslationInfo = (row) => {
        console.log("row", row);
        dispatch(openDialog({ type: "translationInfo", data: { ...row, page, size } }));
    };

    const handleDownloadCSV = () => {

        dispatch(downloadTranslationsCSV()).then((res: any) => {
            if (res?.payload?.data) {
                const url = window.URL.createObjectURL(new Blob([res.payload.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "translations.csv");
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
        });
    };

    const handleDeleteLanguage = (row) => {

        if (row?.isDefault) {
            setToast("error", "Default language cannot be deleted");
            return;
        }
        const data = warning();
        data.then((res) => {
            if (res) {
                dispatch(deleteLanguage(row?.languageCode));
            }
        });
    };

    const handleToggle = (languageCode, toggleType) => {

        dispatch(toggleLanguage({ languageCode, toggleType }));
    };

    const columns = [
        // ... (Header columns remain same)
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
            Header: "Icon",
            body: "languageIcon",
            Cell: ({ row }) => (
                console.log("row", row),
                <img
                    src={row?.languageIcon ? row?.languageIcon : "/images/noImage.png"}
                    alt="Icon"
                    style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "5px",
                        objectFit: "cover",
                    }}
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/images/noImage.png";
                    }}
                />
            ),
        },
        {
            Header: "Title",
            body: "languageTitle",
            Cell: ({ row }) => <span>{row?.languageTitle}</span>,
        },
        {
            Header: "Code",
            body: "languageCode",
            Cell: ({ row }) => <span>{row?.languageCode}</span>,
        },
        {
            Header: "Localized Title",
            body: "localLanguageTitle",
            Cell: ({ row }) => <span>{row?.localLanguageTitle}</span>,
        },
        ...(canEdit ? [
            {
                Header: "Active",
                body: "isActive",
                Cell: ({ row }) => (
                    <>
                        {canEdit && (
                            <ToggleSwitch
                                value={row?.isActive}
                                onChange={() => {

                                    handleToggle(row?.languageCode, 1)
                                }}
                            />
                        )}
                    </>
                ),
            }] : []),
        ...(canEdit ? [
            {
                Header: "Default",
                body: "isDefault",
                Cell: ({ row }) => (
                    <>
                        {canEdit && (
                            <ToggleSwitch
                                value={row?.isDefault}
                                onChange={() => {

                                    handleToggle(row?.languageCode, 2)
                                }}
                            />
                        )}
                    </>
                ),
            }] : []),
        {
            Header: "Errors",
            body: "errorCount",
            Cell: ({ row }) => {
                const count = row?.errorCount ?? 0;

                return (
                    <span
                        className="fw-bold"
                        style={{ color: count > 0 ? "#e53935" : "#2e7d32" }} // red : green
                    >
                        {count}
                    </span>
                );
            },
        },
        ...(canList || canEdit || canDelete ? [
            {
                Header: "Action",
                body: "action",
                Cell: ({ row }) => (
                    <div className="action-button">
                        {canEdit && (
                            <Button
                                btnIcon={<IconEdit className="text-secondary icon-class" />}
                                onClick={() => handleOpenEditLanguage(row)}
                            />
                        )}
                        {canDelete && (
                            <Button
                                btnIcon={<IconTrash className="text-secondary icon-class" />}
                                onClick={() => handleDeleteLanguage(row)}
                            />
                        )}
                        <Button
                            btnIcon={<IconInfoCircle className="text-secondary icon-class" />}
                            onClick={() => handleOpenTranslationInfo(row)}
                            newClass={`fw-bolder text-white`}
                        />
                    </div>
                ),
            }] : []),
    ];

    return (
        <div className="user-table">
            <div className="user-table-top mb-3">
                <div className="d-flex flex-column flex-xl-row justify-content-between align-items-stretch align-items-xl-center gap-3 w-100">
                    {/* Title + Search same line on md and above */}
                    <div className="d-flex flex-row justify-content-between align-items-center gap-3 w-100 w-xl-auto">
                        <h5
                            className="text-nowrap"
                            style={{
                                fontWeight: "500",
                                fontSize: "20px",
                                marginTop: "5px",
                                marginBottom: "4px",
                            }}
                        >
                            Language
                        </h5>

                        {/* Search: show on md-lg and xl, hidden on mobile only */}
                        <div className="d-none d-md-block" style={{ maxWidth: "350px", minWidth: "250px" }}>
                            <Searching
                                type="server"
                                serverSearching={(searchValue) => {
                                    if (searchValue.trim()) {
                                        dispatch(getLanguage(searchValue.trim()));
                                    } else {
                                        dispatch(getAllLanguages({ start: page, limit: size }));
                                    }
                                }}
                                placeholder="Search by language code..."
                                actionShow={false}
                            />
                        </div>
                    </div>

                    {/* Right Side: Search (mobile only) + Buttons */}
                    <div className="d-flex flex-column flex-xl-row align-items-stretch align-items-md-end align-items-xl-center gap-2">

                        {/* Search: mobile only */}
                        <div className="d-block d-md-none w-100" style={{ maxWidth: "350px" }}>
                            <Searching
                                type="server"
                                serverSearching={(searchValue) => {
                                    if (searchValue.trim()) {
                                        dispatch(getLanguage(searchValue.trim()));
                                    } else {
                                        dispatch(getAllLanguages({ start: page, limit: size }));
                                    }
                                }}
                                placeholder="Search by language code..."
                                actionShow={false}
                            />
                        </div>

                        {/* Buttons */}
                        <div className="d-flex flex-column flex-sm-row gap-2 align-items-stretch align-items-sm-center flex-nowrap new-fake-btn">
                            {canCreate && (
                                <Button
                                    btnIcon={<AddIcon />}
                                    btnName={"Add Language"}
                                    onClick={() => handleOpenAddLanguage()}
                                    style={{
                                        width: "180px", height: "40px", display: "flex", alignItems: "center",
                                        justifyContent: "center", gap: "5px",
                                        whiteSpace: "nowrap", flexShrink: 0,
                                    }}
                                    newClass="w-sm-auto"
                                />
                            )}
                            {canEdit && (
                                <Button
                                    btnIcon={<img src="/images/upload_1.png" alt="Add" style={{ width: "20px", height: "20px" }} />}
                                    btnName={"Upload File"}
                                    onClick={() => handleOpenUploadCSV()}
                                    style={{
                                        width: "150px", height: "40px", display: "flex", alignItems: "center",
                                        justifyContent: "center", gap: "5px",
                                        whiteSpace: "nowrap", flexShrink: 0,
                                    }}
                                    newClass="w-sm-auto"
                                />
                            )}
                            {canList && (
                                <Button
                                    btnIcon={<img src="/images/download_1.png" alt="Download" style={{ width: "20px", height: "20px" }} />}
                                    btnName={"Download File"}
                                    onClick={handleDownloadCSV}
                                    style={{
                                        width: "160px", height: "40px", display: "flex", alignItems: "center",
                                        justifyContent: "center", gap: "5px",
                                        whiteSpace: "nowrap", flexShrink: 0,
                                    }}
                                    newClass="w-sm-auto"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {canList && (
                <>
                    <Table
                        data={languages}
                        mapData={columns}
                        serverPerPage={size}
                        serverPage={page}
                        type="server"
                    />

                    <div className="mt-3">
                        <Pagination
                            type="server"
                            activePage={page}
                            rowsPerPage={size}
                            userTotal={totalLanguages}
                            setPage={setPage}
                            handleRowsPerPage={handleRowsPerPage}
                            handlePageChange={handlePageChange}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

LanguageTable.getLayout = function getLayout(page) {
    return <RootLayout>{page}</RootLayout>;
};

export default LanguageTable;
