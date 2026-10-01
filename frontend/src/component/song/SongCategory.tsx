import React, { useEffect, useState } from "react";
import Button from "../../extra/Button";
import TrashIcon from "../../assets/icons/trashIcon.svg";
import EditIcon from "../../assets/icons/EditBtn.svg";
import AddIcon from "@mui/icons-material/Add";
import { useSelector } from "react-redux";
import { deleteSongCategory, allSongCategory } from "../../store/songSlice";
import { openDialog } from "../../store/dialogSlice";
import Table from "../../extra/Table";
import { RootStore, useAppDispatch } from "@/store/store";
import Pagination from "../../extra/Pagination";
import { permissionError, warning } from "../../util/Alert";
import dayjs from "dayjs";
import Image from "next/image";
import { baseURL } from "@/util/config";
import useClearSessionStorageOnPopState from "@/extra/ClearStorage";
import { usePermission } from "@/hooks/usePermission";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import NoImage from "../../assets/images/noImage.png";

interface Row {
    _id: string;
    image: string;
    name: string;
    createdAt: string;
}

const SongCategory = ({ startDate, endDate }) => {
    const { songCategoryData, totalSongCategory } = useSelector(
        (state: RootStore) => state.song
    );
    const { can } = usePermission();

    const canCreate = can("Song", "Create");
    const canEdit = can("Song", "Edit");
    const canDelete = can("Song", "Delete");
    const canList = can("Song", "List");



    const dispatch = useAppDispatch();

    const [data, setData] = useState<any[]>([]);
    const [page, setPage] = useState<number>(1);
    const [size, setSize] = useState<number>(10);
    const [selectAllChecked, setSelectAllChecked] = useState<any>(false);
    useClearSessionStorageOnPopState("multiButton");

    useEffect(() => {
        let payload: any = {
            startDate,
            endDate,
            start: page,
            limit: size,
        };
        dispatch(allSongCategory(payload));
    }, [page, size, startDate, endDate]);

    useEffect(() => {
        setData(songCategoryData);
    }, [songCategoryData]);

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
        if (checked) {
            // Handle selecting all data
        } else {
            // Handle unselecting all data
        }
    };

    const handleDeleteCategory = (row: any) => {

        const data = warning();
        data
            .then((logouts: any) => {
                if (logouts) {
                    const payload: any = {
                        songCategoryId: row?._id,
                    };
                    dispatch(deleteSongCategory(payload));
                }
            })
            .catch((err: any) => console.log(err));
    };

    const handleOpenDialog = (type, data = null) => {
        dispatch(openDialog({ type, data }));
    };

    const songCategoryTable = [
        {
            Header: "NO",
            Cell: ({ index }: { index: number }) => (
                <span>{(page - 1) * size + index + 1}</span>
            ),
        },
        {
            Header: "Image",
            Cell: ({ row }: { row: Row }) => (
                <img src={row?.image} width="60px" height="60px" onError={(e) => {
                    e.currentTarget.src = "/images/user.png";
                }} />
            ),
        },
        {
            Header: "Category name",
            Cell: ({ row }: { row: Row }) => (
                <span className="text-capitalize fw-bold">{row?.name}</span>
            ),
        },
        {
            Header: "Created date",
            Cell: ({ row }: { row: Row }) => (
                <span className="text-capitalize">
                    {row?.createdAt ? dayjs(row?.createdAt).format("DD MMMM YYYY") : ""}
                </span>
            ),
        },
        ...(canEdit || canDelete ? [
            {
                Header: "Action",
                Cell: ({ row }: { row: Row }) => (
                    <div className="action-button">
                        {canEdit && (
                            <Button
                                btnIcon={
                                    <IconEdit className="text-secondary icon-class" />
                                }
                                onClick={() => {
                                    handleOpenDialog("createSongCategory", row);
                                }}
                            />
                        )}
                        {canDelete && (
                            <Button
                                btnIcon={
                                    <IconTrash className="text-secondary icon-class" />
                                }
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
                <div className="user-table-top songCategory-table-top mb-3">
                    <div>
                        <h5
                            style={{
                                fontWeight: "500",
                                fontSize: "20px",
                                marginTop: "5px",
                                marginBottom: "4px",
                            }}
                        >
                            Song Category
                        </h5>
                    </div>

                    <div className="new-fake-btn">
                        {canCreate && (
                            <Button
                                btnIcon={<AddIcon />}
                                btnName={"New"}
                                onClick={() => {
                                    handleOpenDialog("createSongCategory");
                                }}
                            />
                        )}
                    </div>
                </div>
                <Table
                    data={data}
                    mapData={songCategoryTable}
                    serverPerPage={size}
                    serverPage={page}
                    handleSelectAll={handleSelectAll}
                    selectAllChecked={selectAllChecked}
                    type={"server"}
                />
                <div className="mt-3">
                    <Pagination
                        type={"server"}
                        activePage={page}
                        rowsPerPage={size}
                        userTotal={totalSongCategory}
                        setPage={setPage}
                        handleRowsPerPage={handleRowsPerPage}
                        handlePageChange={handlePageChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default SongCategory;
