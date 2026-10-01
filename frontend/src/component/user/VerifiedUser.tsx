import Pagination from "@/extra/Pagination";
import Searching from "@/extra/Searching";
import Table from "@/extra/Table";
import ToggleSwitch from "@/extra/ToggleSwitch";
import { RootStore, useAppDispatch } from "@/store/store";
import { allUsers, blockUser, blockVerifiedUser } from "@/store/userSlice";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
// import Verified from "../../assets/images/verified.png";
import Image1 from "../../assets/images/8.jpg";

import useClearSessionStorageOnPopState from "@/extra/ClearStorage";
import { useRouter } from "next/router";
import { permissionError } from "@/util/Alert";
import NoImage from "../../assets/images/user.png";
import Button from "@/extra/Button";
import { usePermission } from "@/hooks/usePermission";
import { IconEye, IconCopy, IconCoins } from "@tabler/icons-react";
import { toast } from "react-toastify";
import { openDialog } from "@/store/dialogSlice";

const VerifiedUser = (props) => {
  useClearSessionStorageOnPopState("multiButton");
  const { startDate, endDate } = props;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  // const [actionPagination, setActionPagination] = useState("block");

  const [blockFilter, setBlockFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("");

  // bulk action
  const [bulkAction, setBulkAction] = useState<"block" | "unblock">("block");

  const [selectCheckData, setSelectCheckData] = useState<any[]>([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [search, setSearch] = useState<string>("");
  const { verifiedUserData, totalVerifiedUser, updateTableToggle } = useSelector(
    (state: RootStore) => state.user,
  );
  const { can } = usePermission();

  const canCreate = can("User", "Create");
  const canEdit = can("User", "Edit");
  const canDelete = can("User", "Delete");
  const canList = can("User", "List");



  const [data, setData] = useState<any>();
  const [showURLs, setShowURLs] = useState<boolean[]>([]);

  const allSelectedBlocked =
    selectCheckData.length > 0 &&
    selectCheckData.every((selected) => {
      const freshUser = verifiedUserData.find((u) => u._id === selected._id);
      return freshUser?.isBlock === true;
    });

  const isBlockParam =
    blockFilter === "block" ? true : blockFilter === "unblock" ? false : null;
  const genderParam =
    blockFilter === "male" ? "male" : blockFilter === "female" ? "female" : null;
  const verifiedParam =
    blockFilter === "verified" ? true : blockFilter === "not verified" ? false : null;
  const countryParam = countryFilter;

  useEffect(() => {
    setBulkAction(allSelectedBlocked ? "unblock" : "block");
  }, [allSelectedBlocked]);

  useEffect(() => {
    const payload: any = {
      type: "verifiedUser",
      start: page,
      limit: size,
      startDate,
      endDate,
      search: search ?? "",
      ...(isBlockParam !== null && { isBlock: isBlockParam }),
      ...(genderParam !== null && { gender: genderParam }),
      ...(verifiedParam !== null && { verified: verifiedParam }),
      ...(countryParam && { country: countryParam }),
    };
    dispatch(allUsers(payload));
  }, [dispatch, startDate, endDate, page, size, search, blockFilter, countryParam, updateTableToggle]);

  useEffect(() => {
    setData(verifiedUserData);
  }, [verifiedUserData]);

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

    localStorage.setItem("postData", JSON.stringify(row));
    localStorage.removeItem("multiButton");
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

  // const paginationSubmitButton = () => {
  //   
  //   const isActiveData = verifiedUserData?.filter((user) => {
  //     return user.isBlock === false && selectCheckData.some((ele) => ele._id === user._id);
  //   });
  //   const deActiveData = verifiedUserData?.filter((user) => {
  //     return user.isBlock === true && selectCheckData.some((ele) => ele._id === user._id);
  //   });
  //   const getId = isActiveData?.map((item) => item?._id);
  //   const getId_ = deActiveData?.map((item) => item?._id);
  //   if (blockFilter === "block") {
  //     const data = true;
  //     const payload: any = {
  //       id: getId,
  //       data: data,
  //     };

  //     dispatch(blockUser(payload));
  //   } else if (blockFilter === "unblock") {
  //     const data = false;
  //     const payload: any = {
  //       id: getId_,
  //       data: data,
  //     };
  //     dispatch(blockUser(payload));
  //   }
  // };

  useEffect(() => {
    setSelectCheckData([]);
    setSelectAllChecked(false);
  }, [verifiedUserData]);

  const paginationSubmitButton = async () => {

    if (selectCheckData.length === 0) return;

    const ids = selectCheckData.map((user) => user._id);

    await dispatch(
      blockUser({
        id: ids,
        data: bulkAction === "block",
      }),
    ).unwrap();

    dispatch(
      allUsers({
        type: "verifiedUser",
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

    setSelectCheckData([]);
    setSelectAllChecked(false);
  };

  const handleRedirect = (row: any) => {
    localStorage.setItem("postData", JSON.stringify(row));
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
      Header: "Unique id",
      body: "id",
      Cell: ({ row }) => (
        <span className="text-capitalize    cursorPointer">
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
      Header: "User",
      body: "name",
      Cell: ({ row }) => (
        <div
          className="d-flex align-items-center user-name-cell"
          style={{ cursor: "pointer", paddingLeft: "30%" }}
          onClick={() => handleEdit(row, "manageUser")}
        >
          <img
            src={row?.image !== "" ? row?.image : "/images/8.jpg"}
            width="50px"
            height="50px"
            onError={(e) => {
              e.currentTarget.src = "/images/user.png";
            }}
          />
          <span className="text-capitalize fw-bold ms-3 cursorPointer text-nowrap">
            {row?.name}
          </span>
          <img
            src="/images/verified.png"
            alt="Edit Icon"
            className="ms-1"
            width={18}
            height={18}
          />
        </div>
      ),
    },
    {
      Header: "User name",
      body: "userName",
      Cell: ({ row }) => (
        <span className="text-lowercase    cursorPointer">
          {row?.userName}{" "}
          <IconCopy
            size={16}
            style={{ cursor: "pointer" }}
            onClick={() => copyToClipboard(row?.userName)}
          />
        </span>
      ),
    },

    ...(canEdit ? [
      {
        Header: "Block Status",
        body: "isActive",
        Cell: ({ row }) => (
          <ToggleSwitch
            value={row?.isBlock}
            onChange={() => handleIsActive(row)}
            toolTipTitle={row?.isBlock ? "Unblock user" : "Block user"}
          />
        ),
      }] : []),

    {
      Header: "Action",
      body: "Action",
      Cell: ({ row }) => (
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
      ),
    },
  ];

  // const handleIsActive = (row: any) => {
  //   const id = row?._id;
  //   const data = row?.isBlock === false ? true : false;

  //   const payload: any = { id, data };
  //   dispatch(blockUser(payload));
  //   // dispatch(blockVerifiedUser(payload));
  // };

  const handleIsActive = async (row: any) => {

    const payload = {
      id: row._id,
      data: !row.isBlock,
    };

    await dispatch(blockUser(payload)).unwrap();

    // 🔥 REFRESH LIST
    dispatch(
      allUsers({
        type: "verifiedUser",
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
  };

  const handleFilterData = (filteredData: string | any[]) => {
    if (typeof filteredData === "string") {
      setSearch(filteredData);
    } else {
      setData(filteredData);
    }
  };
  return (
    <div>
      <div className="user-table real-user mb-3">
        <div className="user-table-top">
          <div style={{ width: "auto" }}>
            <h5
              style={{
                fontWeight: "500",
                fontSize: "20px",
                marginTop: "5px",
                marginBottom: "4px",
              }}
            >
              Verified User
            </h5>
          </div>
          {/* <Searching
              placeholder={"Search here"}
              type={"server"}
              setSearchData={setSearch}
              searchValue={search}
              actionPagination={actionPagination}
              setActionPagination={setActionPagination}
              paginationSubmitButton={paginationSubmitButton}
              actionPaginationDataCustom={["Block", "Unblock"]}
            /> */}

          <Searching
            placeholder="Search by Name, UniqueID, Username"
            type="server"
            setSearchData={setSearch}
            searchValue={search}
            /* FILTER */
            actionPagination={blockFilter}
            setActionPagination={setBlockFilter}
            actionPaginationDataCustom={["All", "Block", "Unblock", "Male", "Female", "Verified", "Not Verified"]}
            /* BULK ACTION */
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
          userTotal={totalVerifiedUser}
          setPage={setPage}
          handleRowsPerPage={handleRowsPerPage}
          handlePageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default VerifiedUser;
