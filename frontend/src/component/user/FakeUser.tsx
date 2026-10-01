import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { usePermission } from "@/hooks/usePermission";
import TrashIcon from "../../assets/icons/trashIcon.svg";
import EditIcon from "../../assets/icons/EditBtn.svg";
import Button from "../../extra/Button";
import Pagination from "../../extra/Pagination";
import Table from "../../extra/Table";
import Searching from "../../extra/Searching";
import AddIcon from "@mui/icons-material/Add";
import Image from "next/image";
import { allUsers, blockUser, deleteUser } from "../../store/userSlice";
import { RootStore, useAppDispatch } from "../../store/store";
import { openDialog } from "../../store/dialogSlice";
import { permissionError, warning } from "../../util/Alert";
import { baseURL } from "@/util/config";
import { useRouter } from "next/router";
import useClearSessionStorageOnPopState from "@/extra/ClearStorage";
import { IconEdit, IconEye, IconTrash, IconCopy } from "@tabler/icons-react";
import dayjs from "dayjs";
import NoImage from "../../assets/images/user.png";
import { toast } from "react-toastify";

const FakeUser = ({ startDate, endDate, multiButtonSelectNavigate }) => {
  const { dialogueData } = useSelector((state: RootStore) => state.dialogue);

  const dispatch = useAppDispatch();
  const { can } = usePermission();

  const canCreate = can("User", "Create");
  const canEdit = can("User", "Edit");
  const canDelete = can("User", "Delete");
  const canList = can("User", "List");

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [actionPagination, setActionPagination] = useState("delete");
  const [selectCheckData, setSelectCheckData] = useState<any[]>([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [search, setSearch] = useState("");
  const { fakeUserData, totalFakeUser } = useSelector(
    (state: RootStore) => state.user,
  );
  useClearSessionStorageOnPopState("multiButton");

  const router = useRouter();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    setData(fakeUserData);
  }, [fakeUserData]);

  const handlePageChange = (pageNumber: number) => {
    setPage(pageNumber);
  };

  const handleRowsPerPage = (value: number) => {
    setPage(1);
    setSize(value);
  };

  const handleEdit = (row: any, type: string) => {
    dispatch(openDialog({ type: type, data: row }));

    router.push({
      pathname: "/viewProfile",
      query: { id: row?._id },
    });

    localStorage.setItem("postData", JSON.stringify(row));
    localStorage.removeItem("multiButton");
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


    const selectCheckDataGetId = selectCheckData?.map((item) => item?._id);
    const isActiveData = fakeUserData?.filter((user) => {
      return (
        user.isBlock === false &&
        selectCheckData.some((ele) => ele._id === user._id)
      );
    });
    const deActiveData = fakeUserData?.filter((user) => {
      return (
        user.isBlock === true &&
        selectCheckData.some((ele) => ele._id === user._id)
      );
    });

    const getId = isActiveData?.map((item) => item?._id);
    const getId_ = deActiveData?.map((item) => item?._id);
    if (actionPagination === "block") {
      const data = true;
      const payload: any = {
        id: getId,
        data: data,
      };
      dispatch(blockUser(payload));
    } else if (actionPagination === "unblock") {
      const data = false;
      const payload: any = {
        id: getId_,
        data: data,
      };
      dispatch(blockUser(payload));
    } else if (actionPagination === "delete") {
      const getIdFind = selectCheckDataGetId?.join(",");
      const data = warning();
      data
        .then((res) => {
          if (res) {
            const payload: any = {
              id: getIdFind,
            };
            dispatch(deleteUser(payload));
          }
        })
        .catch((err) => console.log(err));
    }
  };
  const handleRedirect = (row: any, type: any) => {
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
      Header: "NO",
      body: "no",
      Cell: ({ index }) => (
        <span className="  text-nowrap">
          {(page - 1) * size + parseInt(index) + 1}
        </span>
      ),
    },

    {
      Header: "User",
      body: "name",
      Cell: ({ row, index }) => (
        <div
          className="d-flex align-items-center manage-user-name-cell"
          style={{ cursor: "pointer", paddingLeft: "24%" }}
          onClick={() => handleRedirect(row, "manageUser")}
        >
          {row?.image && (
            <img
              src={row?.image}
              width="50px"
              height="50px"
              onError={(e) => {
                e.currentTarget.src = "/images/user.png";
              }}
            />
          )}
          <span className="text-capitalize ms-3  cursorPointer text-nowrap">
            {row?.name}
          </span>
        </div>
      ),
    },
    {
      Header: "User name",
      body: "userName",
      Cell: ({ row }) => (
        <span className="text-lowercase    cursorPointer">
          {row?.userName}
          <IconCopy
            size={16}
            style={{ cursor: "pointer" }}
            className="ms-1"
            onClick={() => copyToClipboard(row?.userName)}
          />
        </span>
      ),
    },
    {
      Header: "Unique ID",
      body: "id",
      Cell: ({ row }) => (
        <span className="text-capitalize    cursorPointer">
          {row?.uniqueId}
          <IconCopy
            size={16}
            style={{ cursor: "pointer" }}
            className="ms-1"
            onClick={() => copyToClipboard(row?.uniqueId)}
          />
        </span>
      ),
    },
    // {
    //   Header: "Gender",
    //   body: "id",
    //   Cell: ({ row }) => (
    //     <span className="text-capitalize    cursorPointer">
    //       {row?.gender}
    //     </span>
    //   ),
    // },
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
      Header: "Date",
      body: "createdAt",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize">
          {row?.createdAt ? dayjs(row?.createdAt).format("DD MMMM YYYY , hh:mm A") : ""}
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

    ...(canList || canEdit || canDelete ? [
      {
        Header: "Action",
        body: "action",
        Cell: ({ row }) => (
          <div className="action-button">
            <Button
              btnIcon={<IconEye className="text-secondary icon-class" />}
              onClick={() => handleRedirect(row, "manageUser")}
            />
            {canEdit && (
              <Button
                btnIcon={<IconEdit className="text-secondary icon-class" />}
                onClick={() => handleEdit(row, "manageUser")}
              />
            )}
            {canDelete && (
              <Button
                btnIcon={<IconTrash className="text-secondary icon-class" />}
                onClick={() => handleDeleteUser(row)}
              />
            )}
          </div>
        ),
      }] : []),
  ];

  useEffect(() => {
    const payload: any = {
      type: "fakeUser",
      start: page,
      limit: size,
      startDate,
      endDate,
      search: search ?? "",
    };
    dispatch(allUsers(payload));
  }, [startDate, endDate, page, size, search]);

  const handleIsActive = (row: any) => {

    const id = row?._id;
    const data = row?.isBlock === false ? true : false;
    const payload: any = { id, data };
    dispatch(blockUser(payload));
  };

  const handleDeleteUser = (row: any) => {

    const data = warning();
    data
      .then((res) => {
        if (res) {
          const payload: any = {
            id: row?._id,
            data: row?.userName,
          };
          dispatch(deleteUser(payload));
        }
      })
      .catch((err) => console.log(err));
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
        <div className="user-table-top fake-user-top">
          <div className="w-100">
            <h5
              style={{
                fontWeight: "500",
                fontSize: "20px",
                marginTop: "5px",
                marginBottom: "4px",
              }}
            >
              Fake User
            </h5>
          </div>
          <div className="d-flex gap-2 justify-content-end w-100">
            <Searching
              placeholder="Search by Name, UniqueID..."
              type={"server"}
              setSearchData={setSearch}
              searchValue={search}
              actionPagination={actionPagination}
              setActionPagination={setActionPagination}
              paginationSubmitButton={paginationSubmitButton}
              actionShow={false}
              customSelectDataShow={true}
            />
            <div className="new-fake-btn d-flex">
              {canCreate && (
                <Button
                  btnIcon={<AddIcon />}
                  btnName={"New"}
                  onClick={() => {
                    dispatch(openDialog({ type: "fakeUser" }));
                  }}
                />
              )}
            </div>
          </div>
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
          userTotal={totalFakeUser}
          setPage={setPage}
          handleRowsPerPage={handleRowsPerPage}
          handlePageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default FakeUser;
