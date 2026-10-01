import useClearSessionStorageOnPopState from "@/extra/ClearStorage";
import { allStory, deleteFakeStory } from "@/store/storySlice";
import AddIcon from "@mui/icons-material/Add";
import {
  IconEdit,
  IconEye,
  IconTrash,
  IconVideo,
  IconCopy,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { usePermission } from "@/hooks/usePermission";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Button from "../../extra/Button";
import Pagination from "../../extra/Pagination";
import Table from "../../extra/Table";
import { openDialog } from "../../store/dialogSlice";
import { RootStore, useAppDispatch } from "../../store/store";
import { deleteFakeVideo } from "../../store/videoSlice";
import { permissionError, warning } from "../../util/Alert";
import VideoDialogue from "./StoryDialogue";
import noUser from "../../assets/images/noImage.png";
import CreateFakeStory from "./CreateFakeStory";
import ReactAudioPlayer from "react-audio-player";
import NoImage from "../../assets/images/user.png";
import Searching from "@/extra/Searching";
import { toast } from "react-toastify";

interface FakeVideoProps {
  startDate: string;
  endDate: string;
}

const FakeStory: React.FC<FakeVideoProps> = (props) => {
  const router = useRouter();
  const { fakeStoryData, totalFakeStory } = useSelector(
    (state: RootStore) => state.story,
  );
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);

  const { can } = usePermission();

  const canCreate = can("Story", "Create");
  const canEdit = can("Story", "Edit");
  const canDelete = can("Story", "Delete");
  const canList = can("Story", "List");

  const [selectAllChecked, setSelectAllChecked] = useState<boolean>(false);
  const [selectCheckData, setSelectCheckData] = useState<any[]>([]);
  const dispatch = useAppDispatch();
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(10);
  const [search, setSearch] = useState<string>("");

  useClearSessionStorageOnPopState("multiButton");



  const { startDate, endDate } = props;

  useEffect(() => {
    const payload: any = {
      includeFake: true,
      start: page,
      limit: size,
      startDate: startDate,
      endDate: endDate,
      search: search ?? "",
    };
    dispatch(allStory(payload));
  }, [page, size, startDate, endDate, search]);

  useEffect(() => {
    setData(fakeStoryData);
  }, [fakeStoryData]);

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
      query: { id: row?.user?._id, type: "ViewFakeUser", includeFake: true },
    });

    localStorage.setItem("postData", JSON.stringify(row));
    localStorage.removeItem("multiButton");
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

  const storyTable = [
    {
      Header: "NO",
      body: "name",
      Cell: ({ index }: { index: number }) => (
        <span>{(page - 1) * size + index + 1}</span>
      ),
    },

    // {
    //   Header: "User",
    //   body: "name",
    //   Cell: ({ row }: { row: any }) => (
    //     <>
    //       <div
    //         className="text-capitalize userText fw-bold d-flex align-items-center gap-2"
    //         style={{
    //           cursor: "pointer",
    //           paddingLeft: "19%",
    //         }}
    //         onClick={() => handleEdit(row)}
    //       >
    //         <img
    //           src={row?.user?.image}
    //           onError={(e) => {
    //             e.currentTarget.src = "/images/user.png";
    //           }}
    //           width="50px"
    //           height="50px"
    //           style={{ marginRight: "10px" }}
    //         />
    //         <div className="text-start">
    //           <div
    //             className="text-capitalize userText "
    //             style={{
    //               cursor: "pointer",
    //             }}
    //           >
    //             {row?.user?.name}
    //           </div>
    //           <div
    //             className="text-capitalize userText "
    //             style={{
    //               cursor: "pointer",
    //             }}
    //           >
    //             {row?.user?.uniqueId}
    //           </div>
    //         </div>
    //       </div>
    //     </>
    //   ),
    // },

    {
      Header: "User",
      body: "name",
      Cell: ({ row }: { row: any }) => (
        <div className="user-cell" onClick={() => handleEdit(row)}>
          <img
            className="user-cell-img"
            src={row?.user?.image}
            onError={(e) => {
              e.currentTarget.src = "/images/user.png";
            }}
            alt="user"
          />

          <div className="user-cell-text">
            <div
              className="user-cell-name"
              style={{ color: "#5f6870", fontWeight: 400, cursor: "pointer", textAlign: "start" }}
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
            <div
              className="user-cell-name"
              style={{ color: "#5f6870", fontWeight: 400, cursor: "pointer", textAlign: "start" }}
            >
              {row?.user?.userName}
              <IconCopy
                size={16}
                className="ms-1"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(row?.user?.userName);
                }}
              />
            </div>
            <div
              className="user-cell-id"
              style={{ color: "#495057", fontWeight: 400, cursor: "pointer", textAlign: "start" }}
            >
              {row?.user?.uniqueId}{" "}
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
      Header: "Story Type",
      body: "storyType",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize">
          {row?.storyType == 1 ? "Image" : "Video"}
        </span>
      ),
    },
    {
      Header: "View Count",
      body: "viewsCount",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize">
          {row?.viewsCount ? row?.viewsCount : 0}
        </span>
      ),
    },
    {
      Header: "Reaction Count",
      body: "totalLikes",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize">
          {row?.reactionsCount ? row?.reactionsCount : 0}
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
    ...(canList || canEdit || canDelete ? [
      {
        Header: "Action",
        body: "action",
        Cell: ({ row }: { row: any }) => (
          <div className="action-button">
            {canList && (
              <Button
                btnIcon={<IconEye className="text-secondary icon-class" />}
                onClick={() => {
                  dispatch(openDialog({ type: "viewStory", data: row }));
                }}
              />
            )}
            {canEdit && (
              <Button
                btnIcon={<IconEdit className="text-secondary icon-class" />}
                onClick={() => {
                  handleOpenDialog("fakeStory", row);
                }}
              />
            )}
            {canDelete && (
              <Button
                btnIcon={<IconTrash className="text-secondary icon-class" />}
                onClick={() => handleDeleteVideo(row)}
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

  const handleDeleteVideo = (row: any) => {


    const data = warning();
    data
      .then((logouts: any) => {
        const yes = logouts;
        if (yes) {
          dispatch(
            deleteFakeStory({ storyId: row?._id, userId: row?.user?._id }),
          );
        }
      })
      .catch((err) => console.log(err));
  };

  const handleOpenDialog = (type, data = null) => {
    dispatch(openDialog({ type, data }));
  };

  return (
    <div>
      <div className="user-table mb-3">
        {dialogueType == "fakeStory" && <CreateFakeStory />}

        {/* <div className="user-table-top gap-2">
          <div className="row align-items-start w-100">
            <div className="col-6">
              <h5
                style={{
                  fontWeight: "500",
                  fontSize: "20px",
                  marginTop: "5px",
                  marginBottom: "4px",
                }}
              >
                Fake Story
              </h5>
            </div>
          </div>
          <Searching
            placeholder="Search Here"
            type="server"
            setSearchData={setSearch}
            searchValue={search}
            actionShow={false}
            button={false}
            newClass=""
          />
          <div className=" d-flex justify-content-end">
            <div className="ms-auto ">
              <div className="new-fake-btn d-flex ">
                <Button
                  btnIcon={<AddIcon />}
                  btnName={"New"}
                  onClick={() => {
                    dispatch(openDialog({ type: "fakeStory" }));
                  }}
                />
              </div>
            </div>
          </div>
        </div> */}

        <div className="user-table-top fakestory-table-top mb-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 w-100">
            {/* Left Side: Title */}
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
                Fake Story
              </h5>
            </div>

            {/* Right Side: Search and Button */}
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-start justify-content-md-end align-items-stretch align-items-sm-center fakestory-actions w-100 w-md-auto">
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
                    onClick={() => {
                      handleOpenDialog("fakeStory");
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <Table
          data={data}
          mapData={storyTable}
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
            userTotal={totalFakeStory}
            setPage={setPage}
            handleRowsPerPage={handleRowsPerPage}
            handlePageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default FakeStory;
