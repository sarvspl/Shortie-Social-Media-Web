import RootLayout from "@/component/layout/Layout";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { fetchRoles, deleteRole, toggleRoleActivation } from "@/store/roleSlice";
import { openDialog } from "@/store/dialogSlice";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import Button from "@/extra/Button";
import ToggleSwitch from "@/extra/ToggleSwitch";
import Searching from "@/extra/Searching";
import { IconEdit, IconTrash, IconEye } from "@tabler/icons-react";
import AddIcon from "@mui/icons-material/Add";
import RoleDialogue from "@/component/role/RoleDialogue";
import PermissionShowDialog from "@/component/role/PermissionShowDialog";
import { permissionError, warning } from "@/util/Alert";
import dayjs from "dayjs";
import { usePermission } from "@/hooks/usePermission";

const Roles = () => {
    const dispatch = useAppDispatch();
    const { role, total } = useSelector((state: RootStore) => state.role);
    const { dialogueType } = useSelector((state: RootStore) => state.dialogue);
    const { can } = usePermission();

    const canCreate = can("Access Role", "Create");
    const canEdit = can("Access Role", "Edit");
    const canDelete = can("Access Role", "Delete");
    const canList = can("Access Role", "List");



    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [search, setSearch] = useState("");

    useEffect(() => {
        dispatch(fetchRoles({ start: page, limit: size, search: search }));
    }, [dispatch, page, size, search]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const handlePageChange = (pageNumber: number) => {
        setPage(pageNumber);
    };

    const handleRowsPerPage = (value: number) => {
        setPage(1);
        setSize(value);
    };

    const handleDelete = (row: any) => {

        warning().then((res) => {
            if (res) {
                dispatch(deleteRole(row._id));
            }
        });
    };

    const handleOpenDialog = (type: string, data: any = null) => {
        dispatch(openDialog({ type, data }));
    };

    const roleTable = [
        {
            Header: "No",
            Cell: ({ index }: { index: any }) => <span>{(page - 1) * size + index + 1}</span>,
        },
        {
            Header: "Role",
            body: "name",
            sorting: { type: "client" },
            Cell: ({ row }: { row: any }) => <span className="text-capitalize">{row?.name}</span>,
        },

        {
            Header: "Date",
            body: "createdAt",
            Cell: ({ row }: { row: any }) => <span>{dayjs(row?.createdAt).format("DD MMM YYYY , hh:mm A")}</span>,
        },
        ...(canEdit ? [
            {
                Header: "Status",
                body: "isActive",
                Cell: ({ row }: { row: any }) => (
                    <ToggleSwitch
                        value={row?.isActive}
                        onChange={() => {

                            dispatch(toggleRoleActivation(row._id));
                        }}
                    />
                ),
            }] : []
        ),

        ...(canList || canEdit || canDelete ? [
            {
                Header: "Action",
                Cell: ({ row }: { row: any }) => (
                    <div className="action-button">
                        <Button
                            btnIcon={<IconEye className="text-secondary icon-class" />}
                            onClick={() => dispatch(openDialog({ type: "viewRole", data: row }))}
                        />
                        {canEdit && (
                            <Button
                                btnIcon={<IconEdit className="text-secondary icon-class" />}
                                onClick={() => handleOpenDialog("editRole", row)}
                            />
                        )}
                        {canDelete && (
                            <Button
                                btnIcon={<IconTrash className="text-secondary icon-class" />}
                                onClick={() => handleDelete(row)}
                            />
                        )}
                    </div>
                ),
            }] : [])
    ];

    return (
        <>
            {dialogueType === "addRole" && <RoleDialogue />}
            {dialogueType === "editRole" && <RoleDialogue />}
            {dialogueType === "viewRole" && <PermissionShowDialog />}

            <div className="userPage">
                <div className="user-table real-user mb-3">
                    <div className="user-table-top roles-table-top">
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
                                Access Role
                            </h5>
                            <div className="d-flex flex-column flex-sm-row gap-3 w-100 justify-content-sm-end align-items-stretch align-items-sm-center">
                                <div className="mobile-search-width">
                                    <Searching
                                        placeholder="Search By Role . . ."
                                        type="server"
                                        setSearchData={setSearch}
                                        searchValue={search}
                                        actionShow={false}
                                    />
                                </div>
                                <div className="new-fake-btn flex-shrink-0">
                                    {canCreate && (
                                        <Button
                                            btnIcon={<AddIcon />}
                                            btnName="New"
                                            onClick={() => handleOpenDialog("addRole")}
                                            newClass="px-2 px-sm-3 py-2"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <Table
                        data={role}
                        mapData={roleTable}
                        serverPerPage={size}
                        serverPage={page}
                        type="server"
                    />
                    <Pagination
                        type="server"
                        activePage={page}
                        rowsPerPage={size}
                        userTotal={total}
                        setPage={setPage}
                        handleRowsPerPage={handleRowsPerPage}
                        handlePageChange={handlePageChange}
                    />
                </div>
            </div>
        </>
    );
};

Roles.getLayout = function getLayout(page) {
    return <RootLayout>{page}</RootLayout>;
};

export default Roles;