import RootLayout from "@/component/layout/Layout";
import React, { useEffect, useState } from "react";
import NewTitle from "../extra/Title";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import { useRouter } from "next/router";
import { baseURL } from "@/util/config";
import Button from "@/extra/Button";
import Image from "next/image";
import TrashIcon from "../assets/icons/trashIcon.svg";
import { permissionError, warning } from "@/util/Alert";
import { deleteFakePost, getUserPost } from "@/store/postSlice";
import PostDialogue from "@/component/post/PostDialogue";
import { closeDialog, openDialog } from "@/store/dialogSlice";
import VideoDialogue from "@/component/video/VideoDialogue";
import VideoPreviewDialogue from "@/component/video/VideoPreviewDialogue";
import PostImagePreviewDialogue from "@/component/post/PostImagePreviewDialogue";
import { deleteFakeVideo, getUserVideo } from "@/store/videoSlice";
import useClearSessionStorageOnPopState from "@/extra/ClearStorage";
import UserProfile from "@/component/user/UserProfile";
import { allUsers, getCountry, getUserProfile } from "@/store/userSlice";
import {
  IconBrowserShare,
  IconChevronLeft,
  IconEye,
  IconPhotoScan,
  IconTrash,
  IconVideo,
  IconPlayerPlay,
  IconPhoto,
  IconCopy,
} from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { allStory, allUserStory, deleteFakeStory } from "@/store/storySlice";
import { start } from "repl";
import StoryDialogue from "@/component/story/StoryDialogue";
import dayjs from "dayjs";
import NoImageUser from "../assets/images/user.png";
import { usePermission } from "@/hooks/usePermission";
import { toast } from "react-toastify";

export default function viewProfile(props) {
  useClearSessionStorageOnPopState("multiButton");

  const router = useRouter();
  const { can } = usePermission();

  const canDelete = can("Fake User", "Delete");
  const canList = can("Fake User", "List");

  const [multiButtonSelect, setMultiButtonSelect] = useState<string>("Profile");
  const { dialogueType, dialogueData } = useSelector(
    (state: RootStore) => state.dialogue
  );

  const { getUserProfileData } = useSelector((state: RootStore) => state.user);

  const [imageShow, setImageShow] = useState<string>("");
  const { userPostData } = useSelector((state: RootStore) => state.post);
  const { userStoryData } = useSelector((state: RootStore) => state.story);

  const { userVideoData } = useSelector((state: RootStore) => state.video);

  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const searchParams = useSearchParams();

  const postData =
    typeof window !== "undefined" &&
    JSON.parse(localStorage.getItem("postData"));

  const userId = router?.query?.id;
  const includeFake = router?.query?.includeFake;

  useEffect(() => {
    setMultiButtonSelect("Profile");
  }, [userId]);

  const id =
    typeof window !== "undefined" &&
    JSON.parse(localStorage.getItem("postData"));

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getCountry());
    if (!router.isReady) return;
    const payload: any = {
      start: page,
      limit: size,
      id: userId,
    };
    dispatch(getUserPost(payload));
    dispatch(getUserVideo(userId));
  }, [router.isReady, dispatch]);

  useEffect(() => {
    if (!router.isReady) return;
    const payload: any = {
      userId: userId,
      includeFake: includeFake,
    };
    dispatch(allUserStory(payload));
  }, [router.isReady, dispatch]);

  useEffect(() => {
    if (!router.isReady) return;
    const payload: any = {
      id: searchParams.get("id"),
    };
    dispatch(getUserProfile(payload));
  }, [router.isReady]);

  useEffect(() => {
    setImageShow(postData?.image || "");
  }, [postData]);

  const handlePageChange = (pageNumber: number) => {
    setPage(pageNumber);
  };

  const handleRowsPerPage = (value: number) => {
    setPage(1);
    setSize(value);
  };

  const handlePostDetails = async (row: any) => {
    dispatch(openDialog({ type: "viewPost", data: row }));
  };

  const handleVideoDetails = async (row: any) => {
    dispatch(openDialog({ type: "viewVideo", data: row }));
  };

  const handleVideoPreview = async (row: any) => {
    dispatch(openDialog({ type: "viewVideoPreview", data: row }));
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



  const handleDeleteVideo = (row: any) => {

    const data = warning();
    data
      .then((logouts: any) => {
        if (logouts) {
          dispatch(deleteFakeVideo(row?._id));
        }
      })
      .catch((err: any) => console.log(err));
  };
  const handleDeleteStory = (row: any) => {

    const data = warning();
    data
      .then((logouts: any) => {
        if (logouts) {
          dispatch(
            deleteFakeStory({ storyId: row?._id, userId: row?.user?._id })
          );
        }
      })
      .catch((err: any) => console.log(err));
  };

  const handleClose = () => {
    if (dialogueData) {
      dispatch(closeDialog());
    } else {
      router.back();
    }

    localStorage.setItem("multiButton", JSON.stringify("Fake User"));
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
      body: "name",
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
      Header: "uniqueId",
      body: "uniqueId",
      Cell: ({ row }: { row: any }) => (
        <div
          className="text-capitalize   cursorPointer text-nowrap"
          style={{ color: "#495057", fontWeight: 400 }}
        >
          {row?.uniqueId}
          <IconCopy
            size={16}
            className="ms-1"
            style={{ cursor: "pointer" }}
            onClick={() => copyToClipboard(row?.uniqueId)}
          />
        </div>
      ),
    },

    {
      Header: "Likes",
      body: "Likes",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize">{row?.totalLikes}</span>
      ),
    },

    {
      Header: "Comments",
      body: "Comments",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize">{row?.totalComments}</span>
      ),
    },

    {
      Header: "Created date",
      body: "createdAt",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize">
          {row?.createdAt ? row?.createdAt.split("T")[0] : ""}
        </span>
      ),
    },
    {
      Header: "Post",
      body: "soundImage",
      Cell: ({ row }: { row: any }) => {
        return (
          <div className="action-button">
            <Button
              btnIcon={<IconPhoto className="text-secondary icon-class" />}
              onClick={() => handlePostDetails(row)}
            />
          </div>
        );
      },
    },

    ...(canDelete ? [
      {
        Header: "Action",
        body: "action",
        Cell: ({ row }: { row: any }) => (
          <div className="action-button">
            <Button
              btnIcon={<IconTrash className="text-secondary icon-class" />}
              onClick={() => handleDeletePost(row)}
            />
          </div>
        ),
      },
    ] : [])

  ];

  const videoTable = [
    {
      Header: "NO",
      body: "name",
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
            src={row?.videoImage}
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
      Header: "Video",
      body: "soundImage",
      Cell: ({ row }: { row: any }) => {
        const imageUrl = row?.videoImage;
        return (
          <>
            <button
              className="viewbutton mx-auto"
              style={{
                position: "relative",
                padding: 0,
                border: "none",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onClick={() => handleVideoPreview(row)}
            >
              <img
                src={imageUrl || "/images/noImage.png"}
                alt="videoImage"
                className="w-10 h-10 object-cover"
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src = "/images/noImage.png";
                }}
                style={{ width: "50px", height: "50px", borderRadius: "4px" }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0,0,0,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "4px"
                }}
              >
                <IconPlayerPlay size={24} color="#ffffff" />
              </div>
            </button>
          </>
        );
      },
    },



    {
      Header: "Likes",
      body: "Likes",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize">{row?.totalLikes}</span>
      ),
    },

    {
      Header: "Comments",
      body: "Comments",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize">{row?.totalComments}</span>
      ),
    },

    {
      Header: "Created date",
      body: "createdAt",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize">
          {row?.createdAt ? row?.createdAt.split("T")[0] : ""}
        </span>
      ),
    },
    {
      Header: "Video",
      body: "soundImage",
      Cell: ({ row }: { row: any }) => {
        const imageUrl = row?.videoImage;
        return (
          <>
            {/* <button
              className="viewbutton mx-auto"
              style={{
                position: "relative",
                padding: 0,
                border: "none",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onClick={() => handleVideoDetails(row)}
            >
              <img
                src={imageUrl || "/images/noImage.png"}
                alt="videoImage"
                className="w-10 h-10 object-cover"
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src = "/images/noImage.png";
                }}
                style={{ width: "50px", height: "50px", borderRadius: "4px" }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0,0,0,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "4px"
                }}
              >
                <IconPlayerPlay size={24} color="#ffffff" />
              </div>
            </button> */}

            <div className="action-button">
              <Button
                btnIcon={<IconVideo className="text-secondary icon-class" />}
                onClick={() => handleVideoDetails(row)}
              />
            </div>
          </>
        );
      },
    },
    ...(canDelete ? [
      {
        Header: "Action",
        body: "action",
        Cell: ({ row }: { row: any }) => (
          <div className="action-button">
            <Button
              btnIcon={<IconTrash className="text-secondary icon-class" />}
              onClick={() => handleDeleteVideo(row)}
            />
          </div>
        ),
      }] : []),
  ];

  const storyTable = [
    {
      Header: "NO",
      body: "name",
      Cell: ({ index }: { index: number }) => (
        <span>{(page - 1) * size + index + 1}</span>
      ),
    },

    {
      Header: "User",
      body: "name",
      Cell: ({ row }: { row: any }) => (
        <>
          <div
            className="text-capitalize userText fw-bold d-flex align-items-center justify-content-center"
            style={{
              cursor: "pointer",
            }}
          >
            <img
              src={row?.user?.image}
              onError={(e) => {
                e.currentTarget.src = "/images/user.png";
              }}
              width="50px"
              height="50px"
              style={{ marginRight: "10px" }}
            />
            <span
              className="text-capitalize userText "
              style={{
                cursor: "pointer",
              }}
            >
              {row?.user?.name}
            </span>
          </div>
        </>
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
      Header: "Created date",
      body: "createdAt",
      Cell: ({ row }: { row: any }) => (
        <span className="text-capitalize">
          {row?.createdAt ? dayjs(row?.createdAt).format("DD MMMM YYYY") : ""}
        </span>
      ),
    },
    ...(canList || canDelete ? [
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
            {canDelete && (
              <Button
                btnIcon={<IconTrash className="text-secondary icon-class" />}
                onClick={() => handleDeleteStory(row)}
              />
            )}
          </div>
        ),
      },
    ] : [])

  ];

  return (
    <div style={{ padding: "20px" }}>
      {dialogueType == "viewPost" && <PostDialogue />}
      {dialogueType == "viewVideo" && <VideoDialogue />}
      {dialogueType == "viewVideoPreview" && <VideoPreviewDialogue />}
      {dialogueType == "viewPostImage" && <PostImagePreviewDialogue />}
      {dialogueType == "viewStory" && <StoryDialogue />}
      <div
        className="dashboardHeader primeHeader mb-3 p-0 row align-items-center"
        style={{ padding: "20px" }}
      >
        <div className="col-12 col-md-10" style={{ padding: "5px" }}>
          <NewTitle
            dayAnalyticsShow={false}
            name={`viewProfile`}
            titleShow={false}
            multiButtonSelect={multiButtonSelect}
            setMultiButtonSelect={setMultiButtonSelect}
            labelData={["Profile", "Post", "Video", "Story"]}
          />
        </div>

        <div
          className="col-12 col-md-2 mt-3 mt-md-0"
          style={{ display: "flex", justifyContent: "end" }}
        >
          <Button
            btnName={"Back"}
            newClass={"back-btn"}
            btnIcon={<IconChevronLeft />}
            onClick={handleClose}
          />
        </div>
        {multiButtonSelect !== "Profile" ? (
          <div className="userPage">
            <div className="user-table real-user mb-3">
              <div className="user-table-top">
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <h5
                    style={{
                      fontWeight: "500",
                      fontSize: "18px",
                      marginBottom: "5px",
                      marginTop: "5px",
                      markerStart: "10px",
                    }}
                  >
                    {multiButtonSelect}
                  </h5>
                </div>
              </div>
              {["Post", "Video"].includes(multiButtonSelect) && (
                <Table
                  data={
                    multiButtonSelect == "Post" ? userPostData : userVideoData
                  }
                  mapData={multiButtonSelect == "Post" ? postTable : videoTable}
                  serverPerPage={size}
                  serverPage={page}
                  type={"server"}
                />
              )}
              {["Story"].includes(multiButtonSelect) && (
                <Table
                  data={userStoryData?.length > 0 ? userStoryData : []}
                  mapData={storyTable}
                  serverPerPage={size}
                  serverPage={page}
                  type={"server"}
                />
              )}
            </div>
          </div>
        ) : (
          ""
        )}

        {multiButtonSelect === "Profile" && <UserProfile />}
      </div>
      <div className="mt-3">
        <Pagination
          type={"server"}
          activePage={page}
          rowsPerPage={size}
          // userTotal={totalRealPost}
          setPage={setPage}
          handleRowsPerPage={handleRowsPerPage}
          handlePageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

viewProfile.getLayout = function getLayout(page) {
  return <RootLayout>{page}</RootLayout>;
};
