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
import { addLiveVideo, updateLiveVideo } from "@/store/liveVideoSlice";
import Image from "next/image";
import { uploadMultipleFiles, uploadFile } from "@/store/postSlice";
import { permissionError } from "@/util/Alert";
import { usePermission } from "@/hooks/usePermission";
import { setToast } from "@/util/toast";

const isYoutube = (url: string) =>
  url?.includes("youtube.com") || url?.includes("youtu.be");

const isImage = (url: string) =>
  /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

const getYoutubeEmbedUrl = (url: string) => {
  const regExp =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
  const match = url?.match(regExp);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const isBlob = (url: string) => url?.startsWith("blob:");

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

const CreateLiveVideo: React.FC<CreateFakeVideoProps> = () => {
  const { dialogue, dialogueType, dialogueData } = useSelector(
    (state: any) => state.dialogue
  );

  const { fakeUserData } = useSelector((state: RootStore) => state.user);
  const [mongoId, setMongoId] = useState<string>("");
  const [addVideoOpen, setAddVideoOpen] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>();
  const [videoTime, setVideoTime] = useState<number>();
  const [fakePostDataGet, setFakeUserDataGet] = useState<any[]>([]);

  // Video file states
  const [fileData, setFileData] = useState<File | null>(null);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<any>("");
  const [isVideoChanged, setIsVideoChanged] = useState<boolean>(false);

  // Thumbnail file states
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [videoThumbUrl, setVideoThumbUrl] = useState<any>("");
  const [isThumbnailChanged, setIsThumbnailChanged] = useState<boolean>(false);

  // Configuration states
  const [mediaSourceKind, setMediaSourceKind] = useState<any>(2);
  const [thumbnailType, setthumbnailType] = useState<any>(2);


  // Store original values for comparison
  const [originalValues, setOriginalValues] = useState<any>({});

  const [error, setError] = useState({
    video: "",
    userId: "",
    country: "",
    mediaSourceKind: "",
    videoUrlError: "",
    thumbnailurlError: "",
    thumbnailType: "",
  });

  const { can } = usePermission();

  const canCreate = can("Live Video", "Create");
  const canEdit = can("Live Video", "Edit");



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
        mediaSourceKind: dialogueData?.mediaSourceKind || 1,
        thumbnailType: dialogueData?.thumbnailType || 1,
        videoUrl: dialogueData?.videoUrl || "",
        videoImage: dialogueData?.videoImage || "",
        videoTime: dialogueData?.videoTime || 0,
      };
      setOriginalValues(original);

      // Set current values
      setMongoId(dialogueData?._id);
      setUserId(dialogueData?.userId || "");
      setVideoTime(dialogueData?.videoTime || 0);
      setPreviewVideoUrl(dialogueData?.videoUrl || null);
      setPreviewImageUrl(dialogueData?.videoImage || null);
      setMediaSourceKind(dialogueData?.mediaSourceKind || 1);
      setVideoUrl(dialogueData?.videoUrl || "");
      setVideoThumbUrl(dialogueData?.videoImage || "");
      setthumbnailType(dialogueData?.thumbnailType || 1);

      // Reset file change flags when editing existing data
      setIsVideoChanged(false);
      setIsThumbnailChanged(false);
      setFileData(null);
      setThumbnail(null);

    } else {
      // Reset all states for new video creation
      setOriginalValues({});
      setMongoId("");
      setUserId("");
      setVideoPath(null);
      setVideoTime(0);
      setPreviewVideoUrl(null);
      setPreviewImageUrl(null);
      setMediaSourceKind(2);
      setVideoUrl("");
      setVideoThumbUrl("");
      setthumbnailType(2);
      setIsVideoChanged(false);
      setIsThumbnailChanged(false);
      setFileData(null);
      setThumbnail(null);
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

  const uploadSingleFile = async (file: File, folderPath: string): Promise<string | null> => {
    try {
      const newFileName = `custom_name_${Date.now()}.${file.name.split(".").pop()}`;
      const renamedFile = new File([file], newFileName, { type: file.type });

      const formData = new FormData();
      formData.append("folderStructure", folderPath);
      formData.append("keyName", file.name);
      formData.append("content", renamedFile);

      const payload = { data: formData };
      const response: any = await dispatch(uploadFile(payload)).unwrap();

      if (response?.data?.status) {
        return response.data.url;
      } else {
        throw new Error("Upload failed: Invalid response from server.");
      }
    } catch (error) {
      console.error("Single file upload failed:", error);
      throw error;
    }
  };

  const uploadMultipleFilesHandler = async (videoFile: File, thumbnailFile: File): Promise<{ videoUrl: string; videoImage: string } | null> => {
    try {
      const newVideoFileName = `custom_name_${Date.now()}.${videoFile.name.split(".").pop()}`;
      const renamedVideoFile = new File([videoFile], newVideoFileName, { type: videoFile.type });

      const newThumbnailFileName = `custom_name_${Date.now()}.${thumbnailFile.name.split(".").pop()}`;
      const renamedThumbnailFile = new File([thumbnailFile], newThumbnailFileName, { type: thumbnailFile.type });

      const formData = new FormData();
      formData.append("folderStructure", `${projectName}/admin/livevideoImage`);
      formData.append("keyName", videoFile.name);
      formData.append("content", renamedVideoFile);
      formData.append("content", renamedThumbnailFile);

      const payload = { data: formData };
      const response: any = await dispatch(uploadMultipleFiles(payload)).unwrap();

      if (response?.data?.status && response.data.urls?.length >= 2) {
        return {
          videoUrl: response.data.urls[0],
          videoImage: response.data.urls[1],
        };
      } else {
        throw new Error("Upload failed: Invalid response from server.");
      }
    } catch (error) {
      console.error("Multiple files upload failed:", error);
      throw error;
    }
  };

  const handleFileUploads = async (): Promise<{ videoUrl: string; videoImage: string } | null> => {
    if (!canCreate && !canEdit) return null;
    try {
      let finalVideoUrl = videoUrl;
      let finalVideoImage = videoThumbUrl;

      // Determine what needs to be uploaded
      const needsVideoUpload = mediaSourceKind === 2 && isVideoChanged && fileData;
      const needsThumbnailUpload = thumbnailType === 2 && isThumbnailChanged && thumbnail;

      if (needsVideoUpload && needsThumbnailUpload) {
        // Case 1: Both video and thumbnail need to be uploaded
        const result = await uploadMultipleFilesHandler(fileData!, thumbnail!);
        if (result) {
          finalVideoUrl = result.videoUrl;
          finalVideoImage = result.videoImage;
        }
      } else if (needsVideoUpload) {
        // Case 2: Only video needs to be uploaded
        const videoUploadResult = await uploadSingleFile(fileData!, `${projectName}/admin/livevideoImage`);
        if (videoUploadResult) {
          finalVideoUrl = videoUploadResult;
        }
      } else if (needsThumbnailUpload) {
        // Case 3: Only thumbnail needs to be uploaded
        const thumbnailUploadResult = await uploadSingleFile(thumbnail!, `${projectName}/admin/livevideoImage`);
        if (thumbnailUploadResult) {
          finalVideoImage = thumbnailUploadResult;
        }
      }

      return {
        videoUrl: finalVideoUrl,
        videoImage: finalVideoImage,
      };
    } catch (error) {
      console.error("File upload process failed:", error);
      setError((prev) => ({
        ...prev,
        video: "Failed to upload files. Please try again.",
      }));
      return null;
    }
  };

  const handleVideo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError((prev) => ({ ...prev, video: "Please select a video!" }));
      return;
    }

    setFileData(file);
    setIsVideoChanged(true);

    try {
      const videoURL = URL.createObjectURL(file);
      setPreviewVideoUrl(videoURL);

      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = videoURL;

      video.onloadedmetadata = () => {
        const newVideoTime = video.duration;
        setVideoTime(newVideoTime);
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

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError((prev) => ({ ...prev, thumbnailurlError: "Please select a thumbnail!" }));
      return;
    }

    setThumbnail(file);
    setIsThumbnailChanged(true);
    setPreviewImageUrl(URL.createObjectURL(file));
    setError((prev) => ({ ...prev, thumbnailurlError: "" }));
  };

  const handleCloseAddCategory = () => {
    setAddVideoOpen(false);
    dispatch(closeDialog());
  };

  const validateForm = (): boolean => {
    let newErrors: any = {};
    let isValid = true;

    if (!userId) {
      newErrors.userId = "User Is Required !";
      isValid = false;
    }

    if (mediaSourceKind === 1 && !videoUrl) {
      newErrors.videoUrlError = "Video URL is required!";
      isValid = false;
    }

    if (mediaSourceKind === 2 && !fileData && !dialogueData?.videoUrl) {
      newErrors.video = "Please select a video file!";
      isValid = false;
    }

    if (thumbnailType === 1 && !videoThumbUrl) {
      newErrors.thumbnailurlError = "Thumbnail URL is required!";
      isValid = false;
    }

    if (thumbnailType === 2 && !thumbnail && !dialogueData?.videoImage) {
      newErrors.thumbnailurlError = "Please select a thumbnail file!";
      isValid = false;
    }

    setError((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleSubmit = async () => {


    if (!validateForm()) {
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

        let finalVideoUrl = videoUrl;
        let finalVideoImage = videoThumbUrl;

        if (mediaSourceKind === 2) {
          if (isVideoChanged && fileData) {
            const uploadResult = await uploadSingleFile(fileData, `${projectName}/admin/livevideoImage`);
            if (uploadResult) {
              finalVideoUrl = uploadResult;
              changedFields.videoUrl = finalVideoUrl;
              changedFields.videoTime = videoTime;
              hasChanged = true;
            }
          }
        } else {
          if (videoUrl !== originalValues.videoUrl) {
            changedFields.videoUrl = videoUrl;
            hasChanged = true;
          }
        }

        if (thumbnailType === 2) {
          if (isThumbnailChanged && thumbnail) {
            const uploadResult = await uploadSingleFile(thumbnail, `${projectName}/admin/livevideoImage`);
            if (uploadResult) {
              finalVideoImage = uploadResult;
              changedFields.videoImage = finalVideoImage;
              hasChanged = true;
            }
          }
        } else {
          if (videoThumbUrl !== originalValues.videoImage) {
            changedFields.videoImage = videoThumbUrl;
            hasChanged = true;
          }
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
        const uploadResult = await handleFileUploads();
        if (!uploadResult) return;

        const payloadData = {
          liveStreamMode: 1,
          thumbnailType: thumbnailType,
          mediaSourceKind: mediaSourceKind,
          videoUrl: uploadResult.videoUrl,
          videoImage: uploadResult.videoImage,
          userId: typeof userId === 'string' ? userId : (userId as { _id: string })?._id,
          videoTime: videoTime,
        };

        let payload: any = { data: payloadData };
        await dispatch(addLiveVideo(payload)).unwrap();
      }

      dispatch(closeDialog());
    } catch (error) {
      console.error("Submit failed:", error);
      setToast("error", "Failed to save video");
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
            <p className="m-0">{dialogueData ? "Edit Video" : "Add Video"}</p>
          </div>
          <div className="model-body">
            <form>
              <div className="row sound-add-box videoCreateModel d-flex align-items-end">
                <div className="col-12 col-lg-6 col-sm-6 mt-2 country-dropdown">
                  <Selector
                    label={"Fake User"}
                    isdisabled={dialogueData}
                    selectValue={userId}
                    placeholder={"Enter Details..."}
                    selectData={fakePostDataGet}
                    selectId={true}
                    errorMessage={error.userId}
                    onChange={(e: any) => {
                      const newUserId = e.target.value;
                      setUserId(newUserId);

                      if (!newUserId) {
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

                <div className={`col-12 col-lg-${dialogueData ? "12" : "6"} col-sm-6 mt-2 country-dropdown`}>
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
                      const newMediaSourceKind = parseInt(e.target.value);
                      setMediaSourceKind(newMediaSourceKind);

                      // Reset video states when switching media type
                      if (newMediaSourceKind !== mediaSourceKind) {
                        setFileData(null);
                        setVideoUrl("");
                        setPreviewVideoUrl(null);
                        setIsVideoChanged(false);
                      }

                      if (!newMediaSourceKind) {
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
                <div className={`col-12 col-lg-${dialogueData ? "12" : "6"} col-sm-6 mt-2 country-dropdown`}>
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
                      const newThumbnailType = parseInt(e.target.value);
                      setthumbnailType(newThumbnailType);

                      // Reset thumbnail states when switching media type
                      if (newThumbnailType !== thumbnailType) {
                        setThumbnail(null);
                        setVideoThumbUrl("");
                        setPreviewImageUrl(null);
                        setIsThumbnailChanged(false);
                      }

                      if (!newThumbnailType) {
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

                {mediaSourceKind == 1 ? (
                  <div className="col-12 col-lg-6 col-sm-6 mt-2">
                    <Input
                      label={"Video"}
                      name={"video Url"}
                      placeholder={"Video Url"}
                      errorMessage={error.videoUrlError}
                      value={videoUrl}
                      onChange={async (e: any) => {
                        const newVideoUrl = e.target.value;
                        setVideoUrl(newVideoUrl);
                        setPreviewVideoUrl(newVideoUrl);

                        if (!newVideoUrl) {
                          setError({
                            ...error,
                            videoUrlError: "Invalid Url",
                          });
                        } else {
                          setError({ ...error, videoUrlError: "" });
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="col-6 mt-2">
                    <label htmlFor="">Video {isVideoChanged && "(Changed)"}</label>
                    <input
                      className="form-control"
                      id={`video`}
                      type={`file`}
                      accept={`video/*`}
                      onChange={handleVideo}
                    />
                    {error.video && <div className="text-danger">{error.video}</div>}
                  </div>
                )}

                {thumbnailType == 1 ? (
                  <div className="col-12 col-lg-6 col-sm-6 mt-2">
                    <Input
                      label={"Thumbnail"}
                      name={"video thumbnail Url"}
                      placeholder={"Video thumbnail Url"}
                      value={videoThumbUrl}
                      errorMessage={error.thumbnailurlError}
                      onChange={async (e: any) => {
                        const newThumbnailUrl = e.target.value;
                        setVideoThumbUrl(newThumbnailUrl);
                        setPreviewImageUrl(newThumbnailUrl);

                        if (!newThumbnailUrl) {
                          setError({
                            ...error,
                            thumbnailurlError: "Invalid Url",
                          });
                        } else {
                          setError({ ...error, thumbnailurlError: "" });
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="col-12 col-lg-6 col-sm-6 mt-2">
                    <label htmlFor="">Thumbnail {isThumbnailChanged && "(Changed)"}</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                    />
                    {error.thumbnailurlError && <div className="text-danger">{error.thumbnailurlError}</div>}
                  </div>
                )}

                {previewVideoUrl && (
                  <div className="col-12 col-lg-6 col-sm-6 mt-4 videoShow">
                    {isYoutube(previewVideoUrl) ? (
                      <iframe
                        width="150"
                        height="150"
                        src={getYoutubeEmbedUrl(previewVideoUrl) || ""}
                        allowFullScreen
                        title="YouTube video player"
                        style={{ borderRadius: "5px" }}
                      />
                    ) : (
                      <video
                        controls
                        style={{ width: "150px", height: "150px", borderRadius: "5px" }}
                        src={previewVideoUrl}
                      />
                    )}
                  </div>
                )}

                <div className="col-12 col-lg-6 col-sm-6 mt-2">
                  {previewImageUrl && (
                    <img
                      src={previewImageUrl}
                      alt="Thumbnail preview"
                      style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "5px",
                        marginTop: "15px"
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

export default CreateLiveVideo;