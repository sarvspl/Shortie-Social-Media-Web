import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import TrashIcon from "../../assets/icons/trashIcon.svg";
import EditIcon from "../../assets/icons/EditBtn.svg";
import Searching from "../../extra/Searching";
import Pagination from "../../extra/Pagination";
import Button from "../../extra/Button";
import Table from "../../extra/Table";
import dayjs from "dayjs";
import { RootStore, useAppDispatch } from "../../store/store";
import { openDialog } from "../../store/dialogSlice";
import { allPost, deleteFakePost } from "../../store/postSlice";
import AddIcon from "@mui/icons-material/Add";
import { permissionError, warning } from "../../util/Alert";
import Image from "next/image";
import { baseURL } from "@/util/config";
import { useRouter } from "next/router";
import { usePermission } from "@/hooks/usePermission";
import useClearSessionStorageOnPopState from "@/extra/ClearStorage";
import PostDialogue from "./PostDialogue";
import PostImageDialogue from "./PostImageDialogue";
import PostImagePreviewDialogue from "./PostImagePreviewDialogue";
import {
  IconEdit,
  IconTrash,
  IconCopy,
  IconPhoto,
} from "@tabler/icons-react";
import NoImage from "../../assets/images/user.png";
import { toast } from "react-toastify";

interface FakePostProps {
  startDate: string | Date;
  endDate: string | Date;
}

const FakePost: React.FC<FakePostProps> = (props) => {
  const router = useRouter();
  const { fakePostData, totalFakePost } = useSelector(
    (state: RootStore) => state.post,
  );

  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);

  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectCheckData, setSelectCheckData] = useState<any[]>([]);
  const dispatch = useAppDispatch();
  const { can } = usePermission();

  const canCreate = can("Post", "Create");
  const canEdit = can("Post", "Edit");
  const canDelete = can("Post", "Delete");
  const canList = can("Post", "List");

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState<string>("");
  useClearSessionStorageOnPopState("multiButton");



  useEffect(() => {
    const payload: any = {
      type: "fakePost",
      start: page,
      limit: size,
      startDate: props.startDate,
      endDate: props.endDate,
      search: search ?? "",
    };
    dispatch(allPost(payload));
  }, [page, size, props.startDate, props.endDate, search]);

  useEffect(() => {
    setData(fakePostData);
  }, [fakePostData]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setSelectAllChecked(checked);
    if (checked) {
      setSelectCheckData([...data]);
    } else {
      setSelectCheckData([]);
    }
  };

  const handleEdit = (row: any) => {
    router.push({
      pathname: "/viewProfile",
      query: { id: row?.userId },
    });

    let dialogueData_ = {
      dialogue: true,
      dialogueData: row,
    };
    localStorage.setItem("postData", JSON.stringify(row));
    localStorage.removeItem("multiButton");
  };

  const handleRedirect = (row: any) => {
    localStorage.setItem("allpostData", JSON.stringify(row));
    localStorage.removeItem("multiButton");

    router.push({
      pathname: "/viewPost",
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

  const postTable = [
    {
      Header: "NO",
      body: "NO",
      Cell: ({ index }: { index: number }) => (
        <span>{(page - 1) * size + index + 1}</span>
      ),
    },

    {
      Header: "Image",
      body: "planBenefit",
      Cell: ({ row }: { row: any }) => (
        <div
          className="d-flex justify-content-center align-items-center gap-2"
          onClick={() => {
            dispatch(openDialog({ type: "viewPostImage", data: row }));
          }}
          style={{ cursor: "pointer" }}
        >
          <img
            src={row?.mainPostImage}
            width="50px"
            height="50px"
            onError={(e) => {
              e.currentTarget.src = "/images/user.png";
            }}
          />
        </div>
      ),
    },


    {
      Header: "User",
      body: "planBenefit",
      Cell: ({ row }: { row: any }) => (
        <div
          className="d-flex align-items-center plan-user-cell"
          style={{
            cursor: "pointer",
            display: "flex",
            columnGap: "20px",
          }}
          onClick={() => handleEdit(row)}
        >
          <img
            src={row?.userImage}
            width="50px"
            height="50px"
            onError={(e) => {
              e.currentTarget.src = "/images/user.png";
            }}
          />
          <div className="text-start">
            <div
              className="text-capitalize"
              style={{ color: "#5f6870", fontWeight: 400 }}
            >
              {row?.userId?.name ? row?.userId?.name : row?.name}
              <IconCopy
                size={16}
                className="ms-1"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(
                    row?.userId?.name ? row?.userId?.name : row?.name,
                  );
                }}
              />
            </div>
            <div
              className="text-capitalize"
              style={{ color: "#5f6870", fontWeight: 400 }}
            >
              {row?.userId?.userName ? row?.userId?.userName : row?.userName}
              <IconCopy
                size={16}
                className="ms-1"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(
                    row?.userId?.userName ? row?.userId?.userName : row?.userName,
                  );
                }}
              />
            </div>
            <div
              className="text-capitalize"
              style={{ color: "#495057", fontWeight: 400 }}
            >
              {row?.userId?.uniqueId ? row?.uniqueId : row?.uniqueId}{" "}
              <IconCopy
                size={16}
                className="ms-1"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(
                    row?.userId?.uniqueId ? row?.uniqueId : row?.uniqueId,
                  );
                }}
              />
            </div>
          </div>
        </div>
      ),
    },

    {
      Header: "Unique ID",
      body: "uniqueId",
      Cell: ({ row }: { row: any }) => (
        <span
          className="text-capitalize"
          style={{ color: "#495057", fontWeight: 400 }}
        >
          {row?.uniquePostId}
          <IconCopy
            size={16}
            className="ms-1"
            style={{ cursor: "pointer" }}
            onClick={() => copyToClipboard(row?.uniquePostId)}
          />
        </span>
      ),
    },

    {
      Header: "Share count",
      body: "shareCount",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize">{row?.shareCount}</span>
      ),
    },
    {
      Header: "Likes",
      body: "totalLikes",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize">
          {row?.totalLikes ? row?.totalLikes : 0}
        </span>
      ),
    },

    {
      Header: "Comments",
      body: "totalLikes",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize">
          {row?.totalComments ? row?.totalComments : 0}
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

    {
      Header: "Posts",
      body: "soundImage",
      Cell: ({ row }: { row: any }) => {
        const imageUrl = row?.postImage?.[0]?.url;

        return (
          <>
            <div className="action-button">
              {canList && (
                <Button
                  btnIcon={<IconPhoto className="text-secondary icon-class" />}
                  onClick={() =>
                    dispatch(openDialog({ type: "postImage", data: row }))
                  }
                />
              )}
            </div>
          </>
        );
      },
    },
    // {
    //   Header: "View Post",
    //   body: "view",
    //   Cell: ({ row }) => (
    //     <>
    //       <button
    //         className="viewbutton mx-auto"
    //         onClick={() =>
    //           dispatch(openDialog({ type: "postImage", data: row }))
    //         }
    //       >
    //         <svg
    //           viewBox="0 0 24 24"
    //           width="24"
    //           height="24"
    //           stroke="currentColor"
    //           strokeWidth="2"
    //           fill="none"
    //           strokeLinecap="round"
    //           stroke-linejoin="round"
    //           className="css-i6dzq1"
    //         >
    //           <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    //           <circle cx="12" cy="12" r="3"></circle>
    //         </svg>
    //         <span>View</span>
    //       </button>
    //     </>
    //   ),
    // },
    ...(canEdit || canDelete ? [
      {
        Header: "Action",
        body: "action",
        Cell: ({ row }: { row: any }) => (
          <div className="action-button">
            {canEdit && (
              <Button
                btnIcon={<IconEdit className="text-secondary icon-class" />}
                onClick={() => {
                  handleOpenDialog("fakePost", row);
                }}
              />
            )}
            {canDelete && (
              <Button
                btnIcon={<IconTrash className="text-secondary icon-class" />}
                onClick={() => handleDeletePost(row)}
              />
            )}
          </div>
        ),
      }] : []),
  ];

  const handlePageChange = (pageNumber: number) => {
    setPage(pageNumber);
  };

  const handleRowsPerPage = (value: number) => {
    setPage(1);
    setSize(value);
  };

  const handleDeletePost = (row: any) => {

    const data = warning();
    data
      .then((logouts: any) => {
        if (logouts) {
          dispatch(deleteFakePost(row?._id));
        }
      })
      .catch((err: any) => console.log(err));
  };

  const handleOpenDialog = (type, data = null) => {
    dispatch(openDialog({ type, data }));
  };

  return (
    <div>
      <div className="user-table mb-3">
        {dialogueType == "viewPost" && <PostDialogue />}
        {dialogueType == "postImage" && <PostImageDialogue />}
        {dialogueType == "viewPostImage" && <PostImagePreviewDialogue />}
        {/* 
        <div className="user-table-top gap-2 fakepost-table-top">
          <div className="align-items-start d-flex justify-content-between w-100">
            <div className="col-6">
              <h5
                style={{
                  fontWeight: "500",
                  fontSize: "20px",
                  marginTop: "5px",
                  marginBottom: "4px",
                }}
              >
                Fake Post
              </h5>
            </div> */}

        {/* <div className="col-6 d-flex justify-content-end">
              <div className="ms-auto ">
                <div className="new-fake-btn d-flex ">
                  <Button
                    btnIcon={<AddIcon />}
                    btnName={"New"}
                    onClick={() => {
                      dispatch(openDialog({ type: "fakePost" }));
                    }}
                  />
                </div>
              </div>
            </div> */}
        {/* </div>
          <Searching
            placeholder="Search Here"
            type="server"
            setSearchData={setSearch}
            searchValue={search}
            actionShow={false}
            button={false}
            newClass=""
          /> */}

        {/* <div className="ms-auto ">
            <div className="new-fake-btn d-flex ">
              <Button
                btnIcon={<AddIcon />}
                btnName={"New"}
                onClick={() => {
                  dispatch(openDialog({ type: "fakePost" }));
                }}
              />
            </div>
          </div>
        </div> */}

        <div className="user-table-top fakepost-table-top mb-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 w-100">
            <div className="d-flex align-items-center">
              <h5
                className="text-nowrap"
                style={{
                  fontWeight: "500",
                  fontSize: "20px",
                  marginTop: "5px",
                  marginBottom: "4px",
                }}
              >
                Fake Post
              </h5>
            </div>

            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-start justify-content-md-end align-items-stretch align-items-sm-center fakepost-actions w-100 w-md-auto">
              <div className="mobile-search-width" style={{ minWidth: "300px" }}>
                <Searching
                  placeholder="Search by Name, Username..."
                  type="server"
                  setSearchData={setSearch}
                  searchValue={search}
                  actionShow={false}
                  button={false}
                  newClass=""
                />
              </div>
              {canCreate && (
                <div className="new-fake-btn d-flex">
                  <Button
                    btnIcon={<AddIcon />}
                    btnName={"New"}
                    newClass="w-100 w-sm-auto"
                    style={{ minWidth: "110px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", gap: "2px" }}
                    onClick={() => handleOpenDialog("fakePost")}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <Table
          data={data}
          mapData={postTable}
          serverPerPage={size}
          serverPage={page}
          handleSelectAll={handleSelectAll}
          selectAllChecked={selectAllChecked}
          type={"server"}
        />
        <div className="">
          <Pagination
            type={"server"}
            activePage={page}
            rowsPerPage={size}
            userTotal={totalFakePost}
            setPage={setPage}
            handleRowsPerPage={handleRowsPerPage}
            handlePageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default FakePost;
