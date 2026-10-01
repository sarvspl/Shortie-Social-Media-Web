"use-client";
import React, { useEffect, useState } from "react";
import Button from "../../extra/Button";
import TrashIcon from "../../assets/icons/trashIcon.svg";
import EditIcon from "../../assets/icons/EditBtn.svg";
import AddIcon from "@mui/icons-material/Add";
import { useSelector } from "react-redux";
import { openDialog } from "../../store/dialogSlice";
import Table from "../../extra/Table";
import Pagination from "../../extra/Pagination";
import { permissionError, warning } from "../../util/Alert";
import dayjs from "dayjs";
import { deleteHastTag, getHashtag } from "../../store/hashTagSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import Image from "next/image";
import Searching from "@/extra/Searching";
import { baseURL } from "@/util/config";
// import hastagIcon from "@/assets/images/HashtagIcon.png";
// import HashtagaBanner from "@/assets/images/hashtagbanner.png";
import useClearSessionStorageOnPopState from "@/extra/ClearStorage";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { usePermission } from "@/hooks/usePermission";

interface hashTagData {
    _id: string;
    hashTagBanner: string;
    hashTag: string;
    hashTagIcon?: string;
    usageCount: string;
    createdAt: string;
}

const HashTagShow = () => {
    const { allHashTagData, totalHashTag } = useSelector(
        (state: RootStore) => state.hashTag,
    );

    const dispatch = useAppDispatch();
    const { can } = usePermission();

    const canCreate = can("Hashtag", "Create");
    const canEdit = can("Hashtag", "Edit");
    const canDelete = can("Hashtag", "Delete");
    const canList = can("Hashtag", "List");

    const [data, setData] = useState<any[]>([]);
    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState<string | undefined>();
    const [size, setSize] = useState<number>(10);
    const [selectAllChecked, setSelectAllChecked] = useState<boolean>(false);
    useClearSessionStorageOnPopState("multiButton");



    useEffect(() => {
        let payload: any = {
            start: page,
            limit: size,
            search: search ?? "",
        };
        dispatch(getHashtag(payload));
    }, [page, size, search]);

    useEffect(() => {
        setData(allHashTagData);
    }, [allHashTagData]);

    const handleFilterData = (filteredData: string | any[]) => {
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

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setSelectAllChecked(checked);
    };

    const handleDeleteCategory = (row: hashTagData) => {


        const data = warning();
        data
            .then((logouts) => {
                if (logouts) {
                    const payload: any = {
                        hashTagId: row?._id,
                    };
                    dispatch(deleteHastTag(payload));
                }
            })
            .catch((err) => console.log(err));
    };

    const handleOpenDialog = (type: string, data: any = null) => {
        dispatch(openDialog({ type, data }));
    };

    const hashTagTable = [
        {
            Header: "NO",
            body: "no",
            Cell: ({ index }: { index: number }) => (
                <span className="  text-nowrap">{(page - 1) * size + index + 1}</span>
            ),
        },

        {
            Header: "Hashtag icon",
            body: "hashTagIcon",
            Cell: ({ row, index }: { row: hashTagData; index: number }) => {
                // Log the value of row?.hashTagIcon

                return row?.hashTagIcon && row?.hashTagIcon !== "" ? (
                    <img
                        src={row?.hashTagIcon}
                        width={40}
                        height={40}
                        alt={`Song ${index + 1}`}
                        onError={(e) => {
                            const target: any = e.target as HTMLImageElement;
                            target.src = "/images/HashtagIcon.png";
                        }}
                    />
                ) : (
                    <img
                        src="/images/HashtagIcon.png"
                        width={40}
                        height={40}
                        alt={`Song ${index + 1}`}
                    />
                );
            },
        },

        {
            Header: "Hashtag banner",
            body: "hashTagBanner",
            Cell: ({ row, index }: { row: hashTagData; index: number }) => {
                return row?.hashTagBanner && row?.hashTagBanner !== "" ? (
                    <img
                        src={row.hashTagBanner}
                        width={40}
                        height={40}
                        alt={`Song ${index + 1}`}
                        onError={(e) => {
                            const target: any = e.target as HTMLImageElement;
                            target.src = "/images/hashtagbanner.png";
                        }}
                    />
                ) : (
                    <img
                        src="/images/hashtagbanner.png"
                        width={40}
                        height={40}
                        alt={`Song ${index + 1}`}
                    />
                );
            },
        },

        {
            Header: "Hashtag",
            body: "hashTag",
            Cell: ({ row }: { row: hashTagData }) => <span>{row?.hashTag}</span>,
        },
        {
            Header: "Usage count",
            body: "usageCount",
            Cell: ({ row }: { row: hashTagData }) => (
                <span className="text-capitalize">
                    {row?.usageCount ? row?.usageCount : 0}
                </span>
            ),
        },
        {
            Header: "Date",
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
                Cell: ({ row }: { row: hashTagData }) => (
                    <div className="action-button">
                        {canEdit && (
                            <Button
                                btnIcon={<IconEdit className="text-secondary icon-class" />}
                                onClick={() => {
                                    handleOpenDialog("CreateHashTag", row);
                                }}
                            />
                        )}
                        {canDelete && (
                            <Button
                                btnIcon={<IconTrash className="text-secondary icon-class" />}
                                onClick={() => handleDeleteCategory(row)}
                            />
                        )}
                    </div>
                ),
            }] : []),
    ];

    return (
        <div>
            <div className="user-table">
                <div className="user-table-top hashtag-table-top">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 w-100">
                        {/* <div className="d-flex align-items-center"> */}
                        <h5
                            className="text-nowrap"
                            style={{
                                fontWeight: "500",
                                fontSize: "20px",
                                marginTop: "5px",
                                marginBottom: "4px",
                            }}
                        >
                            Hashtag
                        </h5>
                        {/* </div> */}
                        <div className="d-flex flex-column flex-sm-row gap-3 w-100 justify-content-sm-end align-items-stretch align-items-sm-center">
                            <div className="mobile-search-width">
                                <Searching
                                    placeholder={"Search by Hashtag"}
                                    type={"server"}
                                    searchValue={search}
                                    setSearchData={setSearch}
                                    actionShow={false}
                                />
                            </div>

                            <div className="new-fake-btn flex-shrink-0">
                                {canCreate && (
                                    <Button
                                        btnIcon={<AddIcon />}
                                        btnName={"New"}
                                        newClass="w-100 w-sm-auto"
                                        style={{ minWidth: "110px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", gap: "2px" }}
                                        onClick={() =>
                                            handleOpenDialog("CreateHashTag")
                                        }
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <Table
                    data={data}
                    mapData={hashTagTable}
                    serverPerPage={size}
                    serverPage={page}
                    handleSelectAll={handleSelectAll}
                    selectAllChecked={selectAllChecked}
                    type={"server"}
                />
                <Pagination
                    type={"server"}
                    activePage={page}
                    rowsPerPage={size}
                    userTotal={totalHashTag}
                    setPage={setPage}
                    handleRowsPerPage={handleRowsPerPage}
                    handlePageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default HashTagShow;
