import React, { useEffect, useState } from "react";
import { connect, useSelector } from "react-redux";
import Pagination from "../../extra/Pagination";
import Table from "../../extra/Table";
import { openDialog } from "../../store/dialogSlice";
import Searching from "../../extra/Searching";
import ToggleSwitch from "../../extra/ToggleSwitch";
import { allUsers, blockUser } from "../../store/userSlice";
import { RootStore, useAppDispatch } from "../../store/store";
import { baseURL } from "@/util/config";
import { useRouter } from "next/router";
import useClearSessionStorageOnPopState from "@/extra/ClearStorage";
import Verified from "../../assets/images/verified.png";
import Image from "next/image";
import { permissionError } from "@/util/Alert";
import Button from "@/extra/Button";
import dayjs from "dayjs";
import { IconEye } from "@tabler/icons-react";
import { usePermission } from "@/hooks/usePermission";
import { IconCopy, IconCoins } from "@tabler/icons-react";
import { toast } from "react-toastify";

const User = (props) => {
    const { startDate, endDate } = props;
    const dispatch = useAppDispatch();
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [blockFilter, setBlockFilter] = useState<string>("all");
    const [countryFilter, setCountryFilter] = useState<string>("");

    const [bulkAction, setBulkAction] = useState<"block" | "unblock">("block");

    const [selectCheckData, setSelectCheckData] = useState<any[]>([]);
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    const [search, setSearch] = useState<string>("");

    const { realUserData, totalRealUser, updateTableToggle } = useSelector(
        (state: RootStore) => state.user,
    );
    const { can } = usePermission();

    const canEdit = can("User", "Edit");


    const router = useRouter();
    useClearSessionStorageOnPopState("multiButton");

    const [data, setData] = useState<any>();

    useEffect(() => {
        setData(realUserData);
    }, [realUserData]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const allSelectedBlocked =
        selectCheckData.length > 0 &&
        selectCheckData.every((user) => user.isBlock === true);

    useEffect(() => {
        if (allSelectedBlocked) {
            setBulkAction("unblock");
        } else {
            setBulkAction("block");
        }
    }, [selectCheckData]);

    const handlePageChange = (pageNumber: number) => {
        setPage(pageNumber);
    };

    const handleRowsPerPage = (value: number) => {
        setPage(1);
        setSize(value);
    };

    const handleEdit = (row: any, type: string) => {
        router.push({
            pathname: "/viewProfile",
            query: { id: row?._id },
        });
    };

    const handleSelectCheckData = (
        e: React.ChangeEvent<HTMLInputElement>,
        row: any,
    ) => {
        const checked = e.target.checked;
        if (checked) {
            setSelectCheckData((prevSelectedRows) => [...prevSelectedRows, row]);
        } else {
            setSelectCheckData((prevSelectedRows) =>
                prevSelectedRows.filter((selectedRow) => selectedRow._id !== row._id),
            );
        }
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setSelectAllChecked(checked);
        if (checked) {
            setSelectCheckData([...data]);
        } else {
            setSelectCheckData([]);
        }
    };

    const paginationSubmitButton = () => {

        if (selectCheckData.length === 0) return;

        const ids = selectCheckData.map((item) => item._id);

        dispatch(
            blockUser({
                id: ids,
                data: bulkAction === "block",
            }),
        );

        setSelectCheckData([]);
        setSelectAllChecked(false);
    };

    const handleRedirect = (row: any) => {
        router.push({
            pathname: "/viewProfile",
            query: { id: row?._id, includeFake: row?.isFake },
        });
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
            Header: "checkBox",
            width: "20px",
            Cell: ({ row }: { row: any }) => (
                <input
                    type="checkbox"
                    checked={selectCheckData.some(
                        (selectedRow) => selectedRow?._id === row?._id,
                    )}
                    onChange={(e) => handleSelectCheckData(e, row)}
                />
            ),
        },
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
            Header: "Name",
            body: "name",
            Cell: ({ row }) => (
                <div
                    className="d-flex align-items-center manage-user-name-cell"
                    style={{ cursor: "pointer", paddingLeft: "20%" }}
                    onClick={() => {
                        handleEdit(row, "manageUser");
                    }}
                >
                    <img
                        src={row?.image}
                        width="50px"
                        height="50px"
                        onError={(e) => {
                            e.currentTarget.src = "/images/user.png";
                        }}
                    />
                    <span className="text-capitalize  ms-3 cursorPointer text-nowrap">
                        {row?.name || "-"}
                    </span>

                    {row?.isVerified == true ? (
                        <img
                            src="/images/verified.png"
                            alt="Edit Icon"
                            className="ms-1 img-fluid"
                            // width={18}
                            // height={18}
                            style={{
                                width: "18px",
                                maxWidth: "100%",
                                height: "auto",
                            }}
                        />
                    ) : (
                        ""
                    )}
                </div>
            ),
        },
        {
            Header: "User name",
            body: "userName",
            Cell: ({ row }) => (
                <span className="text-lowercase cursorPointer">
                    {row?.userName || "-"}{" "}
                    {row?.userName && (
                        <IconCopy
                            size={16}
                            style={{ cursor: "pointer" }}
                            onClick={() => copyToClipboard(row?.userName)}
                        />
                    )}
                </span>
            ),
        },
        {
            Header: "Unique ID",
            body: "id",
            Cell: ({ row }) => (
                <span className="text-capitalize cursorPointer">
                    {row?.uniqueId}{" "}
                    <IconCopy
                        size={16}
                        style={{ cursor: "pointer" }}
                        onClick={() => copyToClipboard(row?.uniqueId)}
                    />
                </span>
            ),
        },

        {
            Header: "Gender",
            body: "gender",
            Cell: ({ row }) => {
                const gender = row?.gender?.toLowerCase();

                return (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            paddingLeft: "10%",
                            gap: "5px",
                        }}
                    >
                        {gender === "male" && (
                            <i className="material-icons">male</i>
                        )}

                        {gender === "female" && (
                            <i className="material-icons">female</i>
                        )}

                        <span className="text-capitalize">{gender}</span>
                    </div>
                );
            },
        },

        {
            Header: "Country",
            body: "country",
            Cell: ({ row }) => (
                <span className="text-capitalize cursorPointer">
                    {row?.country || "-"}
                </span>
            ),
        },

        ...(canEdit
            ? [{
                Header: "Block Status",
                body: "isActive",
                Cell: ({ row }: any) => (
                    <ToggleSwitch
                        value={row?.isBlock}
                        onChange={() => {
                            handleIsActive(row);
                        }}
                        toolTipTitle={row?.isBlock ? "Unblock user" : "Block user"}
                    />
                ),
            }]
            : []),

        {
            Header: "Date",
            body: "createdAt",
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize">
                    {row?.createdAt ? dayjs(row?.createdAt).format("DD MMMM YYYY , hh:mm A") : "-"}
                </span>
            ),
        },

        {
            Header: "Last Login Date",
            body: "lastlogin",
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize">
                    {row?.lastlogin ? dayjs(row?.lastlogin).format("DD MMMM YYYY , hh:mm A") : "-"}
                </span>
            ),
        },



        {
            Header: "Action",
            body: "Action",
            Cell: ({ row }) => (
                <>
                    <div className="action-button">
                        <Button
                            btnIcon={<IconEye className="text-secondary icon-class" />}
                            onClick={() => handleRedirect(row)}
                        />
                        <Button
                            btnIcon={<IconCoins className="text-secondary icon-class" />}
                            onClick={() => {
                                dispatch(openDialog({ type: "manageCoin", data: row }));
                            }}
                        />
                    </div>
                </>
            ),
        },
    ];


    const isBlockParam =
        blockFilter === "block" ? true : blockFilter === "unblock" ? false : null;
    const genderParam =
        blockFilter === "male" ? "male" : blockFilter === "female" ? "female" : null;
    const verifiedParam =
        blockFilter === "verified" ? true : blockFilter === "not verified" ? false : null;
    const countryParam = countryFilter;

    useEffect(() => {
        dispatch(
            allUsers({
                type: "realUser",
                start: page,
                limit: size,
                startDate,
                endDate,
                search: search ?? "",
                ...(isBlockParam !== null && { isBlock: isBlockParam }),
                ...(genderParam !== null && { gender: genderParam }),
                ...(verifiedParam !== null && { verified: verifiedParam }),
                ...(countryParam && { country: countryParam }),
                meta: undefined,
                data: undefined,
            }),
        );
    }, [startDate, endDate, page, size, search, isBlockParam, genderParam, verifiedParam, countryParam, updateTableToggle]);

    const handleIsActive = (row: any) => {

        dispatch(
            blockUser({
                id: row._id,
                data: !row.isBlock,
            }),
        );
    };

    return (
        <div>
            <div className="user-table real-user mb-3">
                <div className="user-table-top ">
                    <div>
                        <h5
                            style={{
                                fontWeight: "500",
                                fontSize: "20px",
                                marginTop: "5px",
                                marginBottom: "4px",
                            }}
                        >
                            Real User
                        </h5>
                    </div>

                    <Searching
                        placeholder="Search by Name, UniqueID, Username"
                        type="server"
                        setSearchData={setSearch}
                        searchValue={search}
                        actionPagination={blockFilter}
                        setActionPagination={setBlockFilter}
                        actionPaginationDataCustom={["All", "Block", "Unblock", "Male", "Female", "Verified", "Not Verified"]}
                        paginationSubmitButton={paginationSubmitButton}
                        submitDisabled={selectCheckData.length === 0}
                        buttonLabel={bulkAction === "block" ? "Block" : "Unblock"}
                        toolTipTitle={"Select one or more users to enable the Block action. Clicking this button will block the selected users."}
                        isCountryFilter={true}
                        countryFilter={countryFilter}
                        setCountryFilter={setCountryFilter}
                    />
                </div>
                <Table
                    data={data}
                    mapData={ManageUserData}
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
                    userTotal={totalRealUser}
                    setPage={setPage}
                    handleRowsPerPage={handleRowsPerPage}
                    handlePageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default connect(null, { blockUser, allUsers })(User);
