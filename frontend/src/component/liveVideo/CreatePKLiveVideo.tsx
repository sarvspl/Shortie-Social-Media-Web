import React, { useEffect, useState } from "react";
import { Box, Modal, Typography } from "@mui/material";
import Selector from "../../extra/Selector";
import Input from "../../extra/Input";
import Button from "../../extra/Button";
import { useSelector } from "react-redux";
import { allUsers } from "../../store/userSlice";
import { closeDialog } from "../../store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { projectName } from "@/util/config";
import {
  addLiveVideo,
  addPKLiveVideo,
  updateLiveVideo,
} from "@/store/liveVideoSlice";
import { uploadFile } from "@/store/adminSlice";
import { uploadMultipleFiles } from "@/store/postSlice";
import { permissionError } from "@/util/Alert";
import { usePermission } from "@/hooks/usePermission";
import { setToast } from "@/util/toast";

const isYoutube = (url: string) =>
  url?.includes("youtube.com") || url?.includes("youtu.be");

const getYoutubeEmbedUrl = (url: string) => {
  const regExp =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
  const match = url?.match(regExp);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

interface CreateFakeVideoProps { }

const style: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  backgroundColor: "background.paper",
  borderRadius: "5px",
  border: "1px solid #C9C9C9",
  boxShadow: "24px",
};

// selectStyles removed

const CreatePKLiveVideo: React.FC<CreateFakeVideoProps> = () => {
  const { dialogue, dialogueType, dialogueData } = useSelector(
    (state: any) => state.dialogue
  );

  const { fakeUserData } = useSelector((state: RootStore) => state.user);
  const [mongoId, setMongoId] = useState<string>("");
  const [addVideoOpen, setAddVideoOpen] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>();
  const [videoTime, setVideoTime] = useState<number>();
  const [fakePostDataGet, setFakeUserDataGet] = useState<any[]>([]);
  const [video, setVideo] = useState<{
    file: string | null;
    thumbnailBlob: File | null;
  }>({
    file: null,
    thumbnailBlob: null,
  });
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<any>();
  const [thumbnailKey, setThumbnailKey] = useState<number>(0);
  const [fileData, setFileData] = useState<any>([]);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<any>([]);
  const [previewImageUrl, setPreviewImageUrl] = useState<any>([]);
  const [previewImageFile, setPreviewImageFile] = useState<any>([]);
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null);
  const [thumbnailType, setThumbnailType] = useState<any>(2);
  const [mediaSourceKind, setMediaSourceKind] = useState<any>(2);
  // video urls
  const [videoUrl1, setVideoUrl1] = useState<any>();
  const [videoUrl2, setVideoUrl2] = useState<any>();
  const [newVideoFile1, setNewVideoFile1] = useState<File | null>(null);
  const [newVideoFile2, setNewVideoFile2] = useState<File | null>(null);

  // video thumbnail urls
  const [videoThumbUrl1, setVideoThumbUrl1] = useState<any>();
  const [videoThumbUrl2, setVideoThumbUrl2] = useState<any>();
  const [newThumbFile1, setNewThumbFile1] = useState<File | null>(null);
  const [newThumbFile2, setNewThumbFile2] = useState<File | null>(null);

  const [pkMediaSources, setpkMediaSources] = useState([]);
  const [pkPreviewImages, setpkPreviewImages] = useState([]);

  const [isVideoChanged1, setIsVideoChanged1] = useState<boolean>(false);
  const [isVideoChanged2, setIsVideoChanged2] = useState<boolean>(false);
  const [isThumbnailChanged1, setIsThumbnailChanged1] = useState<boolean>(false);
  const [isThumbnailChanged2, setIsThumbnailChanged2] = useState<boolean>(false);

  // Store original values for comparison
  const [originalValues, setOriginalValues] = useState<any>({});

  const { can } = usePermission();

  const canCreate = can("Live Video", "Create");
  const canEdit = can("Live Video", "Edit");



  const [error, setError] = useState({
    video: "",
    userId: "",
    country: "",
    mediaSourceKind: "",
    thumbnailType: "",
    urlError1: "",
    urlError2: "",
    urlError3: "",
    urlError4: "",
  });

  const dispatch = useAppDispatch();
  useEffect(() => {
    setAddVideoOpen(dialogue);
    if (dialogueData) {
      // Store original values
      const originalUserId = dialogueData?.userId && typeof dialogueData.userId === "object"
        ? dialogueData.userId._id
        : dialogueData?.userId || "";

      const original = {
        userId: originalUserId,
        mediaSourceKind: dialogueData?.mediaSourceKind || 2,
        thumbnailType: dialogueData?.thumbnailType || 2,
        videoUrl1: dialogueData?.pkMediaSources?.[0] || "",
        videoUrl2: dialogueData?.pkMediaSources?.[1] || "",
        videoThumbUrl1: dialogueData?.pkPreviewImages?.[0] || "",
        videoThumbUrl2: dialogueData?.pkPreviewImages?.[1] || "",
      };
      setOriginalValues(original);

      setMongoId(dialogueData?._id);
      setUserId(dialogueData?.userId || "");
      setVideoPath(dialogueData?.videoUrl || null);
      setThumbnail(dialogueData?.videoImage || []);
      setVideoTime(dialogueData?.videoTime || 0);
      setPreviewVideoUrl(dialogueData?.videoUrl || []);
      setPreviewImageUrl(dialogueData?.videoImage || []);
      setpkMediaSources(dialogueData?.pkMediaSources || []);
      setThumbnailType(dialogueData?.thumbnailType || 2);
      setpkPreviewImages(dialogueData?.pkPreviewImages || []);
      setVideoUrl1(dialogueData?.pkMediaSources?.[0] || "");
      setVideoUrl2(dialogueData?.pkMediaSources?.[1] || "");
      setVideoThumbUrl1(dialogueData?.pkPreviewImages?.[0] || "");
      setVideoThumbUrl2(dialogueData?.pkPreviewImages?.[1] || "");
      setMediaSourceKind(dialogueData?.mediaSourceKind || 2);

      // Reset change flags
      setIsVideoChanged1(false);
      setIsVideoChanged2(false);
      setIsThumbnailChanged1(false);
      setIsThumbnailChanged2(false);
      setNewVideoFile1(null);
      setNewVideoFile2(null);
      setNewThumbFile1(null);
      setNewThumbFile2(null);
    } else {
      setOriginalValues({});
      setMongoId("");
      setUserId("");
      setVideoUrl1("");
      setVideoUrl2("");
      setVideoThumbUrl1("");
      setVideoThumbUrl2("");
      setMediaSourceKind(2);
      setThumbnailType(2);
      setIsVideoChanged1(false);
      setIsVideoChanged2(false);
      setIsThumbnailChanged1(false);
      setIsThumbnailChanged2(false);
      setNewVideoFile1(null);
      setNewVideoFile2(null);
      setNewThumbFile1(null);
      setNewThumbFile2(null);
    }
  }, [dialogue, dialogueData]);
  useEffect(() => {
    const payload: any = {
      type: "fakeUser",
      start: 1,
      limit: 100,
      startDate: "All",
      endDate: "All",
    };
    dispatch(allUsers(payload));
  }, []);

  useEffect(() => {
    setFakeUserDataGet(fakeUserData);
  }, [fakeUserData]);

  let folderStructure: string = `${projectName}/admin/livevideoUrl`;

  let folderStructureThubnailImage: string = `${projectName}/admin/livevideoImage`;



  const handleVideo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError((prev) => ({ ...prev, video: "Please select a video!" }));
      return;
    }
    setFileData([...fileData, file]);
    try {
      const videoURL = URL.createObjectURL(file);
      setVideoUrl1(videoURL);
      setPreviewVideoUrl((prev: any) => [videoURL, prev?.[1]]);
      setNewVideoFile1(file);
      setIsVideoChanged1(true);

      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = videoURL;

      video.onloadedmetadata = () => {
        setVideoTime(video.duration);
        video.currentTime = 1;
      };

      video.onseeked = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              setThumbnailBlob(blob);
              // setPreviewImageUrl([
              //   ...previewImageUrl,
              //   URL.createObjectURL(blob),
              // ]);
              setPreviewImageFile((prev) => [blob, prev?.[1]]);

              setError((prev) => ({ ...prev, video: "" }));
            }
          }, "image/jpeg");
        }
      };

      video.onerror = () => {
        setError((prev) => ({
          ...prev,
          video: "Error loading video. Please try a different format.",
        }));
        URL.revokeObjectURL(videoURL);
      };
    } catch (error) {
      console.error("Error processing video file:", error);
      setError((prev) => ({
        ...prev,
        video: "Error processing video file. Please try again.",
      }));
    }
  };
  const handleVideo1 = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError((prev) => ({ ...prev, video: "Please select a video!" }));
      return;
    }
    setFileData([...fileData, file]);
    try {
      const videoURL = URL.createObjectURL(file);
      setVideoUrl2(videoURL);
      setPreviewVideoUrl((prev: any) => [prev?.[0], videoURL]);
      setNewVideoFile2(file);
      setIsVideoChanged2(true);

      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = videoURL;

      video.onloadedmetadata = () => {
        setVideoTime(video.duration);
        video.currentTime = 1;
      };

      video.onseeked = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              setThumbnailBlob(blob);
              setPreviewImageFile((prev) => [prev?.[0], blob]);
              // setPreviewImageFile([...previewImageFile, blob]);
              // setPreviewImageUrl([
              //   ...previewImageUrl,
              //   URL.createObjectURL(blob),
              // ]);
              setError((prev) => ({ ...prev, video: "" }));
            }
          }, "image/jpeg");
        }
      };

      video.onerror = () => {
        setError((prev) => ({
          ...prev,
          video: "Error loading video. Please try a different format.",
        }));
        URL.revokeObjectURL(videoURL);
      };
    } catch (error) {
      console.error("Error processing video file:", error);
      setError((prev) => ({
        ...prev,
        video: "Error processing video file. Please try again.",
      }));
    }
  };

  const handleThumb1Change = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    // Set preview image for UI
    setVideoThumbUrl1(URL.createObjectURL(file));
    setNewThumbFile1(file);
    setIsThumbnailChanged1(true);
  };

  const handleThumb2Change = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    // Set preview image for UI
    setVideoThumbUrl2(URL.createObjectURL(file));

    // Save new file for upload
    setNewThumbFile2(file);
    setIsThumbnailChanged2(true);
  };

  const generateThumbnailBlob = async (file: File) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        video.currentTime = 1; // Set to capture the frame at 1 second
      };

      video.onseeked = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert the canvas to blob
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/jpeg");
      };

      const objectURL = URL.createObjectURL(file);
      video.src = objectURL;

      return () => {
        URL.revokeObjectURL(objectURL);
      };
    });
  };

  const handleCloseAddCategory = () => {
    setAddVideoOpen(false);
    dispatch(closeDialog());
  };

  const handleSubmit = async () => {


    if (!userId) {
      setError({ ...error, userId: "User Is Required !" });
      return;
    }

    try {
      if (mongoId) {
        let hasChanged = false;
        let changedFields: any = {};

        const currentUserId = (typeof userId === 'string' ? userId : (userId as { _id: string })?._id) || "";
        if (currentUserId !== originalValues.userId) {
          changedFields.userId = currentUserId;
          hasChanged = true;
        }

        if (mediaSourceKind !== originalValues.mediaSourceKind) {
          changedFields.mediaSourceKind = mediaSourceKind;
          hasChanged = true;
        }

        if (thumbnailType !== originalValues.thumbnailType) {
          changedFields.thumbnailType = thumbnailType;
          hasChanged = true;
        }

        let videoChanged = false;
        let thumbChanged = false;

        let currentVideoUrls = [videoUrl1, videoUrl2];
        let currentThumbUrls = [videoThumbUrl1, videoThumbUrl2];

        // Handle Video Uploads
        if (mediaSourceKind === 2) {
          const videoUploads = [];
          if (isVideoChanged1 && newVideoFile1) videoUploads.push({ file: newVideoFile1, index: 0 });
          if (isVideoChanged2 && newVideoFile2) videoUploads.push({ file: newVideoFile2, index: 1 });

          if (videoUploads.length > 0) {
            const formData = new FormData();
            formData.append("folderStructure", `${projectName}/admin/livevideoImage`);
            videoUploads.forEach(v => formData.append("content", v.file));

            const response: any = await dispatch(uploadMultipleFiles({ data: formData })).unwrap();
            if (response?.data?.status) {
              videoUploads.forEach((v, i) => {
                currentVideoUrls[v.index] = response.data.urls[i];
              });
              videoChanged = true;
            }
          }
        } else {
          if (videoUrl1 !== originalValues.videoUrl1 || videoUrl2 !== originalValues.videoUrl2) {
            videoChanged = true;
          }
        }

        // Handle Thumbnail Uploads
        if (thumbnailType === 2) {
          const thumbUploads = [];
          if (isThumbnailChanged1 && newThumbFile1) thumbUploads.push({ file: newThumbFile1, index: 0 });
          if (isThumbnailChanged2 && newThumbFile2) thumbUploads.push({ file: newThumbFile2, index: 1 });

          if (thumbUploads.length > 0) {
            const formData = new FormData();
            formData.append("folderStructure", `${projectName}/admin/livevideoImage`);
            thumbUploads.forEach(t => formData.append("content", t.file));

            const response: any = await dispatch(uploadMultipleFiles({ data: formData })).unwrap();
            if (response?.data?.status) {
              thumbUploads.forEach((t, i) => {
                currentThumbUrls[t.index] = response.data.urls[i];
              });
              thumbChanged = true;
            }
          }
        } else {
          if (videoThumbUrl1 !== originalValues.videoThumbUrl1 || videoThumbUrl2 !== originalValues.videoThumbUrl2) {
            thumbChanged = true;
          }
        }

        if (videoChanged) {
          changedFields.pkMediaSources = currentVideoUrls;
          hasChanged = true;
        }

        if (thumbChanged) {
          changedFields.pkPreviewImages = currentThumbUrls;
          hasChanged = true;
        }

        if (!hasChanged) {
          setToast("info", "No changes made");
          dispatch(closeDialog());
          return;
        }

        const payload: any = {
          data: {
            ...changedFields,
            videoId: mongoId,
            userId: currentUserId,
          }
        };
        await dispatch(updateLiveVideo(payload)).unwrap();
      } else {
        // Add Mode
        let finalVideoUrls = [videoUrl1, videoUrl2];
        let finalThumbUrls = [videoThumbUrl1, videoThumbUrl2];

        if (mediaSourceKind === 2) {
          const videoUploads = [];
          if (newVideoFile1) videoUploads.push({ file: newVideoFile1, index: 0 });
          if (newVideoFile2) videoUploads.push({ file: newVideoFile2, index: 1 });

          if (videoUploads.length > 0) {
            const formData = new FormData();
            formData.append("folderStructure", `${projectName}/admin/livevideoImage`);
            videoUploads.forEach(v => formData.append("content", v.file));

            const response: any = await dispatch(uploadMultipleFiles({ data: formData })).unwrap();
            if (response?.data?.status) {
              videoUploads.forEach((v, i) => {
                finalVideoUrls[v.index] = response.data.urls[i];
              });
            }
          }
        }

        if (thumbnailType === 2) {
          const thumbUploads = [];
          if (newThumbFile1) thumbUploads.push({ file: newThumbFile1, index: 0 });
          if (newThumbFile2) thumbUploads.push({ file: newThumbFile2, index: 1 });

          if (thumbUploads.length > 0) {
            const formData = new FormData();
            formData.append("folderStructure", `${projectName}/admin/livevideoImage`);
            thumbUploads.forEach(t => formData.append("content", t.file));

            const response: any = await dispatch(uploadMultipleFiles({ data: formData })).unwrap();
            if (response?.data?.status) {
              thumbUploads.forEach((t, i) => {
                finalThumbUrls[t.index] = response.data.urls[i];
              });
            }
          }
        }

        const payloadData = {
          liveStreamMode: 2,
          thumbnailType: thumbnailType,
          mediaSourceKind: mediaSourceKind,
          pkMediaSources: finalVideoUrls,
          pkPreviewImages: finalThumbUrls,
          userId: typeof userId === "string" ? userId : (userId as { _id: string })?._id,
        };

        await dispatch(addPKLiveVideo({ data: payloadData } as any)).unwrap();
      }
      dispatch(closeDialog());
    } catch (error) {
      console.error("Submit failed:", error);
      setToast("error", "An error occurred");
    }
  };


  return (
    <div>
      <Modal
        open={addVideoOpen}
        onClose={handleCloseAddCategory}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="">
          <div className="model-header">
            <p className="m-0">
              {dialogueData ? "Edit PK Battle" : "Add PK Battle"}
            </p>
          </div>
          <div className="model-body">
            <form>
              <div className="row sound-add-box videoCreateModel d-flex align-items-end">
                {/* {!dialogueData && ( */}
                <div className="col-12 col-lg-6 col-sm-6 mt-2 country-dropdown">
                  <Selector
                    isdisabled={dialogueData}
                    label={"Fake User"}
                    selectValue={userId}
                    placeholder={"Enter Details..."}
                    selectData={fakePostDataGet}
                    selectId={true}
                    errorMessage={error.userId}
                    onChange={(e: any) => {
                      setUserId(e.target.value);
                      if (!e.target.value) {
                        setError({
                          ...error,
                          userId: "UserId Is Required",
                        });
                      } else {
                        setError({ ...error, userId: "" });
                      }
                    }}
                  />
                </div>
                <div className="col-12 col-lg-6 col-sm-6 mt-2 country-dropdown" />

                <div
                  className={`col-12 col-lg-${dialogueData ? "12" : "6"
                    } col-sm-6 mt-2 country-dropdown`}
                >
                  <Selector
                    label={"Media Type"}
                    selectValue={mediaSourceKind}
                    placeholder={"select type"}
                    selectData={[
                      { _id: 2, name: "File" },
                      { _id: 1, name: "Link" },
                    ]}
                    selectId={true}
                    errorMessage={error.mediaSourceKind}
                    onChange={(e: any) => {
                      const value = parseInt(e.target.value);
                      setMediaSourceKind(value);

                      // Reset states when switching
                      if (value !== mediaSourceKind) {
                        setVideoUrl1("");
                        setVideoUrl2("");
                        setNewVideoFile1(null);
                        setNewVideoFile2(null);
                        setIsVideoChanged1(false);
                        setIsVideoChanged2(false);
                      }

                      if (!e.target.value) {
                        setError({
                          ...error,
                          mediaSourceKind: "Media type Is Required",
                        });
                      } else {
                        setError({ ...error, mediaSourceKind: "" });
                      }
                    }}
                  />
                </div>
                <div
                  className={`col-12 col-lg-${dialogueData ? "12" : "6"
                    } col-sm-6 mt-2 country-dropdown`}
                >
                  <Selector
                    label={"Thumbnail Type"}
                    selectValue={thumbnailType}
                    placeholder={"select type"}
                    selectData={[
                      { _id: 2, name: "File" },
                      { _id: 1, name: "Link" },
                    ]}
                    selectId={true}
                    errorMessage={error.thumbnailType}
                    onChange={(e: any) => {
                      const value = parseInt(e.target.value);
                      setThumbnailType(value);

                      // Reset states when switching
                      if (value !== thumbnailType) {
                        setVideoThumbUrl1("");
                        setVideoThumbUrl2("");
                        setNewThumbFile1(null);
                        setNewThumbFile2(null);
                        setIsThumbnailChanged1(false);
                        setIsThumbnailChanged2(false);
                      }

                      if (!e.target.value) {
                        setError({
                          ...error,
                          thumbnailType: "Media type Is Required",
                        });
                      } else {
                        setError({ ...error, thumbnailType: "" });
                      }
                    }}
                  />
                </div>
                {/* <div className="col-12 col-lg-6 col-sm-6 mt-2"></div> */}

                {mediaSourceKind == 1 && (
                  <>
                    {/* 1st Link */}
                    <div className="col-12 col-lg-6 col-sm-6 mt-2">
                      <Input
                        label={"Video 1"}
                        name={"video Url"}
                        placeholder={"Video Url"}
                        errorMessage={error.urlError1}
                        value={videoUrl1}
                        onChange={async (e: any) => {
                          const value = e.target.value;
                          setVideoUrl1(value);
                          setPreviewVideoUrl((prev: any) => [value, prev?.[1]]);
                          if (!value) {
                            setError({
                              ...error,
                              urlError1: "Invalid Url",
                            });
                          } else {
                            setError({ ...error, urlError1: "" });
                          }
                        }}
                      />
                    </div>
                    <div className="col-12 col-lg-6 col-sm-6 mt-2">
                      <Input
                        label={"Video 2"}
                        name={"video Url"}
                        placeholder={"Video Url"}
                        errorMessage={error.urlError3}
                        value={videoUrl2}
                        onChange={async (e: any) => {
                          const value = e.target.value;
                          setVideoUrl2(value);
                          setPreviewVideoUrl((prev: any) => [prev?.[0], value]);
                          if (!value) {
                            setError({
                              ...error,
                              urlError3: "Invalid Url",
                            });
                          } else {
                            setError({ ...error, urlError3: "" });
                          }
                        }}
                      />
                    </div>

                    <div className="col-12 col-lg-6 col-sm-6 mt-2">
                      {videoUrl1 && (
                        isYoutube(videoUrl1) ? (
                          <iframe
                            width="200"
                            height="200"
                            src={getYoutubeEmbedUrl(videoUrl1) || ""}
                            allowFullScreen
                            title="Video 1"
                            style={{ borderRadius: "5px" }}
                          />
                        ) : (
                          <video
                            controls
                            style={{ width: "200px", height: "200px" }}
                            src={videoUrl1}
                          />
                        )
                      )}
                    </div>
                    <div className="col-12 col-lg-6 col-sm-6 mt-2">
                      {videoUrl2 && (
                        isYoutube(videoUrl2) ? (
                          <iframe
                            width="200"
                            height="200"
                            src={getYoutubeEmbedUrl(videoUrl2) || ""}
                            allowFullScreen
                            title="Video 2"
                            style={{ borderRadius: "5px" }}
                          />
                        ) : (
                          <video
                            controls
                            style={{ width: "200px", height: "200px" }}
                            src={videoUrl2}
                          />
                        )
                      )}
                    </div>
                  </>
                )}

                {mediaSourceKind == 2 && (
                  <>
                    <div className="col-6 mt-2">
                      <label htmlFor="">Video 1 {isVideoChanged1 && "(Changed)"}</label>
                      <Input
                        id={`video1`}
                        type={`file`}
                        accept={`video/*`}
                        errorMessage={error.video}
                        onChange={handleVideo}
                      />
                    </div>
                    <div className="col-6 mt-2">
                      <label htmlFor="">Video 2 {isVideoChanged2 && "(Changed)"}</label>
                      <Input
                        id={`video2`}
                        type={`file`}
                        accept={`video/*`}
                        errorMessage={error.video}
                        onChange={handleVideo1}
                      />
                    </div>


                    {videoUrl1 && (
                      <div className="col-6 d-flex mt-4 videoShow">
                        <video
                          controls
                          style={{ width: "150px", height: "150px" }}
                          src={videoUrl1 ? videoUrl1 : ""}
                        />
                        {/* <img
                          src={previewImageUrl[0] ? previewImageUrl[0] : ""}
                          style={{
                            width: "150px",
                            height: "150px",
                            marginLeft: "20px",
                          }}
                        /> */}
                      </div>
                    )
                      //  : (
                      //   <>
                      //     <div className="col-6 d-flex mt-4">
                      //       <video
                      //         controls
                      //         style={{ width: "200px", height: "200px" }}
                      //         src={videoPath}
                      //       />
                      //     </div>
                      //   </>
                      // )
                    }


                    {videoUrl2 && (
                      <div className="col-6 d-flex mt-4 videoShow">
                        <video
                          controls
                          style={{ width: "150px", height: "150px" }}
                          src={videoUrl2 ? videoUrl2 : ""}
                        />

                      </div>
                    )
                    }
                  </>
                )}



                {/* New */}
                {thumbnailType != 2 ? (
                  <>
                    <div className="col-12 col-lg-6 col-sm-6 mt-2">
                      <Input
                        label={"Thumbnail 1"}
                        name={"video thumbnail Url"}
                        placeholder={"Video thumbnail Url"}
                        value={videoThumbUrl1}
                        errorMessage={error.urlError2}
                        onChange={async (e: any) => {
                          const value = e.target.value;
                          setVideoThumbUrl1(value);
                          if (!value) {
                            setError({
                              ...error,
                              urlError2: "Invalid Url",
                            });
                          } else {
                            setError({ ...error, urlError2: "" });
                          }
                        }}
                      />
                    </div>

                    <div className="col-12 col-lg-6 col-sm-6 mt-2">
                      <Input
                        label={"Thumbnail 2"}
                        name={"video thumbnail Url"}
                        value={videoThumbUrl2}
                        placeholder={"Video thumbnail Url"}
                        errorMessage={error.urlError4}
                        onChange={async (e: any) => {
                          const value = e.target.value;
                          setVideoThumbUrl2(value);
                          if (!value) {
                            setError({
                              ...error,
                              urlError4: "Invalid Url",
                            });
                          } else {
                            setError({ ...error, urlError4: "" });
                          }
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-12 col-lg-6 col-sm-6 mt-2">
                      <label htmlFor="">Thumbnail 1 {isThumbnailChanged1 && "(Changed)"}</label>
                      <input
                        className="form-control"
                        type={"file"}
                        onChange={handleThumb1Change}
                      />
                    </div>

                    <div className="col-12 col-lg-6 col-sm-6 mt-2">
                      <label htmlFor="">Thumbnail 2 {isThumbnailChanged2 && "(Changed)"}</label>
                      <input
                        className="form-control"
                        type={"file"}
                        onChange={handleThumb2Change}
                      />
                    </div>
                  </>
                )}

                <div className="col-12 col-lg-6 col-sm-6 mt-2">
                  {videoThumbUrl1 && (
                    <img
                      src={videoThumbUrl1 || ""}
                      style={{
                        width: "150px",
                        height: "150px",
                        marginLeft: "20px",
                      }}
                      onError={(e) => {
                        e.currentTarget.src = "/images/defaultImage.avif";
                      }}
                    />
                  )}
                </div>

                <div className="col-12 col-lg-6 col-sm-6 mt-2">
                  {videoThumbUrl2 && (
                    <img
                      src={videoThumbUrl2 || ""}
                      style={{
                        width: "150px",
                        height: "150px",
                        marginLeft: "20px",
                      }}
                      onError={(e) => {
                        e.currentTarget.src = "/images/defaultImage.avif";
                      }}
                    />
                  )}
                </div>
              </div>
            </form>
          </div>
          <div className="model-footer">
            <div className="p-3 d-flex justify-content-end">
              <Button
                onClick={handleCloseAddCategory}
                btnName={"Close"}
                newClass={"close-model-btn"}
              />
              {dialogueData ? (
                canEdit && (
                  <Button
                    onClick={handleSubmit}
                    btnName={"Update"}
                    type={"button"}
                    newClass={"submit-btn"}
                    style={{
                      borderRadius: "0.5rem",
                      width: "88px",
                      marginLeft: "10px",
                    }}
                  />
                )
              ) : (
                canCreate && (
                  <Button
                    onClick={handleSubmit}
                    btnName={"Submit"}
                    type={"button"}
                    newClass={"submit-btn"}
                    style={{
                      borderRadius: "0.5rem",
                      width: "88px",
                      marginLeft: "10px",
                    }}
                  />
                )
              )}
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};
export default CreatePKLiveVideo;
