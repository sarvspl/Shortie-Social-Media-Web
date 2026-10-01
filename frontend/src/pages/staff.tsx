import RootLayout from "@/component/layout/Layout";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { fetchStaffList, deleteStaff, toggleStaffActivation } from "@/store/staffSlice";
import { openDialog } from "@/store/dialogSlice";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import Button from "@/extra/Button";
import ToggleSwitch from "@/extra/ToggleSwitch";
import Searching from "@/extra/Searching";
import { IconEdit, IconTrash, IconLock, IconEye } from "@tabler/icons-react";
import AddIcon from "@mui/icons-material/Add";
import StaffDialogue from "@/component/staff/StaffDialogue";
import StaffPasswordUpdateDialog from "@/component/staff/StaffPasswordUpdateDialog";
import PermissionShowDialog from "@/component/role/PermissionShowDialog";
import { permissionError, warning } from "@/util/Alert";
import dayjs from "dayjs";
import { usePermission } from "@/hooks/usePermission";

const Staff = () => {
  const dispatch = useAppDispatch();
  const { staff, total } = useSelector((state: RootStore) => state.staff);
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const { can } = usePermission();

  const canCreate = can("Staff", "Create");
  const canEdit = can("Staff", "Edit");
  const canDelete = can("Staff", "Delete");
  const canList = can("Staff", "List");

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchStaffList({ start: page, limit: size, search: search }));
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
        dispatch(deleteStaff(row._id));
      }
    });
  };

  const handleOpenDialog = (type: string, data: any = null) => {
    dispatch(openDialog({ type, data }));
  };

  const staffTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => <span>{(page - 1) * size + index + 1}</span>,
    },
    {
      Header: "Name",
      body: "name",
      sorting: { type: "client" },
      Cell: ({ row }: { row: any }) => <span className="text-capitalize">{row?.name}</span>,
    },
    {
      Header: "Email",
      body: "email",
    },
    {
      Header: "Role",
      Cell: ({ row }: { row: any }) => <span className="">{row?.role?.name || "N/A"}</span>,
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

              dispatch(toggleStaffActivation(row._id));
            }}
          />
        )
      }] : []),
    ...(canList || canEdit || canDelete ? [
      {
        Header: "Action",
        Cell: ({ row }: { row: any }) => (
          <div className="action-button">
            <Button
              btnIcon={<IconEye className="text-secondary icon-class" />}
              onClick={() => dispatch(openDialog({ type: "viewRole", data: row.role }))}
            />

            {canEdit && (
              <>
                <Button
                  btnIcon={<IconEdit className="text-secondary icon-class" />}
                  onClick={() => handleOpenDialog("editStaff", row)}
                />
                <Button
                  btnIcon={<IconLock className="text-secondary icon-class" />}
                  onClick={() => handleOpenDialog("updateStaffPassword", row)}
                />
              </>
            )}
            {canDelete && (
              <Button
                btnIcon={<IconTrash className="text-secondary icon-class" />}
                onClick={() => handleDelete(row)}
              />
            )}
          </div>
        ),
      }] : []),
  ];

  return (
    <>
      {dialogueType === "addStaff" && <StaffDialogue />}
      {dialogueType === "editStaff" && <StaffDialogue />}
      {dialogueType === "updateStaffPassword" && <StaffPasswordUpdateDialog />}
      {dialogueType === "viewRole" && <PermissionShowDialog />}

      <div className="userPage">
        <div className="user-table real-user mb-3">
          <div className="user-table-top staff-table-top">
            <div className="d-flex flex-column flex-md-row justify-content-between w-100 align-items-start align-items-md-center gap-3">
              <h5
                style={{
                  fontWeight: "500",
                  fontSize: "20px",
                  marginTop: "5px",
                  marginBottom: "4px",
                }}
              >
                Staff
              </h5>
              <div className="d-flex flex-column flex-sm-row gap-3 w-100 justify-content-sm-end align-items-stretch align-items-sm-center">
                <div className="mobile-search-width">
                  <Searching
                    placeholder="Search By Name , Email . . ."
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
                      onClick={() => handleOpenDialog("addStaff")}
                      newClass="px-2 px-sm-3 py-2"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <Table
            data={staff}
            mapData={staffTable}
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

Staff.getLayout = function getLayout(page) {
  return <RootLayout>{page}</RootLayout>;
};

export default Staff;