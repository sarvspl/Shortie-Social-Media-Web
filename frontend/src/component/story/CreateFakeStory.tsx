import React, { useEffect, useState } from "react";
import { setToast } from "@/util/toast";
import { Box, Modal, Typography } from "@mui/material";
import Selector from "../../extra/Selector";
import Button from "../../extra/Button";
import { useSelector } from "react-redux";
import { allUsers } from "../../store/userSlice";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { closeDialog } from "../../store/dialogSlice";
import { updateFakeVideo } from "../../store/videoSlice";
import { RootStore, useAppDispatch } from "@/store/store";

import {
  addFakePost,
  allHashTag,
  uploadMultipleFiles,
} from "@/store/postSlice";
import { projectName } from "@/util/config";
import hashTagIcon from "@/assets/images/HashtagIcon.png";
import { uploadFile } from "@/store/adminSlice";
import { permissionError } from "@/util/Alert";
import { allSong } from "@/store/songSlice";
import { addFakeStory, allStory, updateFakeStory } from "@/store/storySlice";
import { usePermission } from "@/hooks/usePermission";


const isYoutube = (url: string) =>
  url.includes("youtube.com") || url.includes("youtu.be");

const isImage = (url: string) =>
  /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

const getYoutubeEmbedUrl = (url: string) => {
  const regExp =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
  const match = url.match(regExp);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const isBlob = (url: string) => url.startsWith("blob:");

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

const CreateFakeStory: React.FC<CreateFakeVideoProps> = () => {
  const { dialogue, dialogueType, dialogueData } = useSelector(
    (state: any) => state.dialogue,
  );

  const { can } = usePermission();

  const canCreate = can("Story", "Create");
  const canEdit = can("Story", "Edit");



  const { fakeUserData } = useSelector((state: RootStore) => state.user);
  const { allSongData } = useSelector((state: RootStore) => state.song);
  const [mongoId, setMongoId] = useState<string>("");
  const [addVideoOpen, setAddVideoOpen] = useState<boolean>(false);
  const [fakeUserId, setFakeUserId] = useState<string>();
  const [fakePostDataGet, setFakeUserDataGet] = useState<any[]>([]);
  const [songData, setSongData] = useState<any[]>([]);
  const [songIds, setSongIds] = useState<any>("");
  const [storyType, setStoryType] = useState<any>(1);
  const [storyMediaType, setStoryMediaType] = useState<any>(1);
  const [mediaUrl, setMediaUrl] = useState<string>("");

  const [mediaFile, setMediaFile] = useState<any>("");
  const [error, setError] = useState({
    fakeUserId: "",
    songIds: "",
    storyType: "",
    storyMediaType: "",
    media: "",
  });
  const [originalData, setOriginalData] = useState<any>(null);

  const dispatch = useAppDispatch();
  useEffect(() => {
    setAddVideoOpen(dialogue);
    if (dialogueData) {
      setMongoId(dialogueData?._id);
      setMediaUrl(
        dialogueData?.storyType == 1
          ? dialogueData?.mediaImageUrl
          : dialogueData?.mediaVideoUrl,
      );
      setFakeUserId(dialogueData?.userId?._id);
      setStoryType(dialogueData?.storyType);
      setStoryMediaType(dialogueData?.storyMediaType);
      setSongIds(dialogueData?.backgroundSong._id);
      setOriginalData({
        songIds: dialogueData?.backgroundSong?._id || "",
        storyType: dialogueData?.storyType || "",
        storyMediaType: dialogueData?.storyMediaType || "",
        mediaUrl: dialogueData?.storyType == 1
          ? dialogueData?.mediaImageUrl || ""
          : dialogueData?.mediaVideoUrl || "",
      });
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
  useEffect(() => {
    setSongData(
      allSongData.map((item) => {
        return { _id: item._id, name: item.songTitle };
      }),
    );
  }, [allSongData]);

  let folderStructure: string = `${projectName}/admin/videoUrl`;

  const handleFileUpload = async (image) => {
    if (!canCreate && !canEdit) return;
    const file = mediaFile;

    if (!(file instanceof File)) return;
    const formData = new FormData();

    formData.append("folderStructure", folderStructure);
    formData.append("keyName", file.name);
    formData.append("content", file);

    // Create a payload for your dispatch
    const payloadformData: any = {
      data: formData,
    };

    if (formData) {
      const response: any = await dispatch(
        uploadFile(payloadformData),
      ).unwrap();

      if (response?.data?.status) {
        if (response.data.url) {
          setMediaUrl(response.data.url);
          return response.data.url;
        }
      }
    }
  };

  const handleCloseAddCategory = () => {
    setAddVideoOpen(false);
    dispatch(closeDialog());
  };

  useEffect(() => {
    const payload: any = {};
    dispatch(allHashTag(payload));
    dispatch(
      allSong({
        start: 1,
        limit: 100,
        startDate: "All",
        endDate: "All",
      }),
    );
  }, []);

  const handleSubmit = async () => {

    if (!dialogueData && !fakeUserId) {
      setError({ ...error, fakeUserId: "User is required" });
    }
    if (!songIds || !storyType || !storyMediaType || !mediaUrl) {
      let error: any = {};
      if (!songIds) error.songIds = "Song is required";
      if (!storyType) error.storyType = "Story Type is required";
      if (!storyMediaType)
        error.storyMediaType = "Story Media Type is required";
      if (!mediaUrl) error.media = "Media URL is required";
      return setError({ ...error });
    } else {
      if (mongoId) {
        let hasChanged = false;
        let changedFields: any = {};

        if (songIds !== originalData?.songIds) {
          changedFields.backgroundSong = songIds;
          hasChanged = true;
        }

        if (storyType != originalData?.storyType) {
          changedFields.storyType = storyType;
          hasChanged = true;
        }

        if (storyMediaType != originalData?.storyMediaType) {
          changedFields.storyMediaType = storyMediaType;
          hasChanged = true;
        }

        if (storyMediaType == 2) {
          if (mediaFile) {
            const imageUrl = await handleFileUpload(mediaFile);
            if (storyType == 1) {
              changedFields.mediaImageUrl = imageUrl;
            } else {
              changedFields.mediaVideoUrl = imageUrl;
            }
            hasChanged = true;
          }
        } else {
          if (mediaUrl !== originalData?.mediaUrl) {
            if (storyType == 1) {
              changedFields.mediaImageUrl = mediaUrl;
            } else {
              changedFields.mediaVideoUrl = mediaUrl;
            }
            hasChanged = true;
          }
        }

        if (!hasChanged) {
          setToast("info", "No changes made");
          dispatch(closeDialog());
          return;
        }

        let payload: any = {
          data: { ...changedFields, storyId: mongoId },

        };
        dispatch(updateFakeStory(payload));
      } else {
        let payloadData: any = {
          userId: fakeUserId,
          storyType: storyType,
          backgroundSong: songIds,
          storyMediaType: storyMediaType,
        };

        let finalUrl = mediaUrl;
        if (storyMediaType == 2) {
          finalUrl = await handleFileUpload(mediaFile);
        }

        if (storyType == 1) {
          payloadData.mediaImageUrl = finalUrl;
        } else {
          payloadData.mediaVideoUrl = finalUrl;
        }

        let payload: any = { data: payloadData, fakeUserId: fakeUserId };
        dispatch(addFakeStory(payload));
      }
      setTimeout(() => {
        dispatch(closeDialog());
        const payload: any = {
          includeFake: true,
          start: 1,
          limit: 10,
          startDate: "All",
          endDate: "All",
        };
        dispatch(allStory(payload));
      }, 2000);
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
            <p className="m-0">{dialogueData ? "Edit Story" : "Add Story"}</p>
          </div>

          <div className="model-body">
            <form>
              <div className="row sound-add-box videoCreateModel d-flex align-items-end">
                {!dialogueData && (
                  <div className="col-12 col-lg-6 col-sm-6 mt-2 country-dropdown">
                    <Selector
                      label={"Fake User"}
                      selectValue={fakeUserId}
                      placeholder={"Enter Details..."}
                      selectData={fakePostDataGet}
                      selectId={true}
                      errorMessage={error.fakeUserId}
                      onChange={(e: any) => {
                        setFakeUserId(e.target.value);
                        if (!e.target.value) {
                          setError({
                            ...error,
                            fakeUserId: "Fake User Is Required",
                          });
                        } else {
                          setError({ ...error, fakeUserId: "" });
                        }
                      }}
                    />
                  </div>
                )}
                <div className="col-12 col-lg-6 col-sm-6 country-dropdown">
                  <Selector
                    label={"Select Song"}
                    selectValue={songIds}
                    placeholder={"Enter Details..."}
                    selectData={songData}
                    selectId={true}
                    errorMessage={error.songIds}
                    onChange={(e: any) => {
                      setSongIds(e.target.value);
                      if (!e.target.value) {
                        setError({
                          ...error,
                          songIds: "Song Is Required",
                        });
                      } else {
                        setError({ ...error, songIds: "" });
                      }
                    }}
                  />
                </div>

                <div className="col-lg-6 col-sm-12 custom-input mt-2">
                  <label>Story type</label>
                  <select
                    className="form-select"
                    name={"caption"}
                    value={storyType}
                    onChange={(e) => {
                      setStoryType(e.target.value);
                      if (!e.target.value) {
                        setError({
                          ...error,
                          storyType: "Caption Is Required",
                        });
                      } else {
                        setError({ ...error, storyType: "" });
                      }
                    }}
                  >
                    <option value="1">Image</option>
                    <option value="2">Video</option>
                  </select>
                  {error.storyType && (
                    <span className="text-danger">{error.storyType}</span>
                  )}
                </div>
                <div className="col-lg-6 col-sm-12 custom-input mt-2">
                  <label htmlFor="">Story Media type</label>
                  <select
                    className="form-select"
                    value={storyMediaType}
                    onChange={(e) => {
                      setStoryMediaType(e.target.value);
                      if (!e.target.value) {
                        setError({
                          ...error,
                          storyMediaType: "Caption Is Required",
                        });
                      } else {
                        setError({ ...error, storyMediaType: "" });
                      }
                    }}
                  >
                    <option value="2">File</option>
                    <option value="1">Link</option>
                  </select>
                  {error.storyType && (
                    <span className="text-danger">{error.storyType}</span>
                  )}
                </div>
                {storyMediaType == 1 ? (
                  <>
                    <div className="col-lg-12 col-sm-12 custom-input mt-2">
                      <label htmlFor="">Story Media Link</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={"Enter Details..."}
                        value={mediaUrl}
                        // onChange={(e) => {
                        //   // setMediaFile(e.target.value);
                        //   setMediaUrl(e.target.value);
                        //   if (!e.target.value) {
                        //     setError({
                        //       ...error,
                        //       media: "Caption Is Required",
                        //     });
                        //   } else {
                        //     setError({ ...error, media: "" });
                        //   }
                        // }}
                        onChange={(e) => {
                          const value = e.target.value;
                          setMediaUrl(value);

                          // ✅ AUTO SWITCH (YouTube aaye to video bana do)
                          if (isYoutube(value)) {
                            setStoryType(2);
                          }

                          if (!value) {
                            setError({
                              ...error,
                              media: "Caption Is Required",
                            });
                          } else {
                            setError({ ...error, media: "" });
                          }
                        }}
                      />
                      {error.media && (
                        <span className="text-danger">{error.media}</span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-lg-12 col-sm-12 custom-input mt-2">
                      <label htmlFor="">Story Media</label>
                      <input
                        type="file"
                        className="form-control"
                        name={"caption"}
                        placeholder={"Enter Details..."}
                        // onChange={(e) => {
                        //   setMediaFile(e.target.files[0]);
                        //   setMediaUrl(URL.createObjectURL(e.target.files[0]));
                        // }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          setMediaFile(file);
                          const fileUrl = URL.createObjectURL(file);
                          setMediaUrl(fileUrl);

                          // ✅ IMPORTANT: auto detect type
                          if (file.type.startsWith("image")) {
                            setStoryType(1); // image
                          } else if (file.type.startsWith("video")) {
                            setStoryType(2); // video
                          }
                        }}
                      />
                      {error.media && (
                        <span className="text-danger">{error.media}</span>
                      )}
                    </div>
                  </>
                )}

                {/* <div className="col-lg-12 col-sm-12">
                  {mediaUrl &&
                    (storyType == 1 ? (
                      <>
                        <img
                          src={mediaUrl || ""}
                          style={{
                            width: "150px",
                            height: "150px",
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <video
                          controls
                          style={{ width: "150px", height: "150px" }}
                          src={mediaUrl || ""}
                        />
                      </>
                    ))}
                </div> */}
                <div className="col-lg-12 col-sm-12">
                  {mediaUrl && (
                    <>
                      {isYoutube(mediaUrl) ? (
                        <iframe
                          width="150"
                          height="150"
                          src={getYoutubeEmbedUrl(mediaUrl)}
                          allowFullScreen
                        />
                      ) : isBlob(mediaUrl) ? (
                        // ✅ FILE PREVIEW FIX
                        storyType == 1 ? (
                          <img
                            src={mediaUrl}
                            style={{ width: "150px", height: "150px" }}
                          />
                        ) : (
                          <video
                            controls
                            style={{ width: "150px", height: "150px" }}
                            src={mediaUrl}
                          />
                        )
                      ) : isImage(mediaUrl) ? (
                        <img
                          src={mediaUrl}
                          style={{ width: "150px", height: "150px" }}
                        />
                      ) : (
                        <video
                          controls
                          style={{ width: "150px", height: "150px" }}
                          src={mediaUrl}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </form>
          </div>

          <div className="model-footer">
            <div className=" p-3 d-flex justify-content-end">
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
export default CreateFakeStory;
