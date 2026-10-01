import { RootStore, useAppDispatch } from "@/store/store";
import { Box, Modal } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Button from "@/extra/Button";
import { closeDialog } from "@/store/dialogSlice";
import { getVideoDetails } from "@/store/videoSlice";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  borderRadius: "5px",
  border: "1px solid #C9C9C9",
  boxShadow: 24,
};

const VideoPreviewDialogue: React.FC = () => {
  const { dialogue, dialogueData } = useSelector(
    (state: RootStore) => state.dialogue
  );
  const dispatch = useAppDispatch();
  const [addPostOpen, setAddPostOpen] = useState(false);

  useEffect(() => {
    if (dialogueData?._id) {
        dispatch(getVideoDetails(dialogueData._id));
    }
  }, [dialogueData, dispatch]);

  useEffect(() => {
    setAddPostOpen(dialogue);
  }, [dialogue]);

  const handleCloseAddCategory = () => {
    setAddPostOpen(false);
    dispatch(closeDialog());
  };

  return (
    <div>
      <Modal
        open={addPostOpen}
        onClose={handleCloseAddCategory}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="">
          <div className="model-header">
            <p className="m-0">Video Preview</p>
          </div>

          <div className="model-body">
            <div className="row mt-3 ">
              {dialogueData?.videoUrl && dialogueData.videoUrl.trim() !== "" ? (
                <video
                  controls
                  autoPlay
                  src={dialogueData?.videoUrl}
                  width={"100%"}
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    maxHeight: "350px",
                    borderRadius: "8px",
                  }}
                  onError={(e: any) => {
                    e.currentTarget.style.display = "none";

                    const fallbackImage =
                      e.currentTarget.parentElement?.querySelector(".fallback-image");

                    if (fallbackImage) {
                      (fallbackImage as HTMLElement).style.display = "block";
                    }
                  }}
                />
              ) : null}

              <img
                src="/images/noVideo.png"
                alt="No Video"
                className="fallback-image"
                style={{
                  width: "100%",
                  height: "350px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  display:
                    dialogueData?.videoUrl && dialogueData.videoUrl.trim() !== ""
                      ? "none"
                      : "block",
                }}
              />
            </div>
          </div>

          <div className="model-footer">
            <div className="p-3 d-flex justify-content-end">
              <Button
                onClick={handleCloseAddCategory}
                btnName={"Close"}
                newClass={"close-model-btn"}
              />
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default VideoPreviewDialogue;
