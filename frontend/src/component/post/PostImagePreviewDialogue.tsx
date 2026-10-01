import { RootStore, useAppDispatch } from "@/store/store";
import { Box, Modal } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Button from "@/extra/Button";
import { closeDialog } from "@/store/dialogSlice";

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

const PostImagePreviewDialogue: React.FC = () => {
  const { dialogue, dialogueData } = useSelector(
    (state: RootStore) => state.dialogue
  );
  const dispatch = useAppDispatch();
  const [addPostOpen, setAddPostOpen] = useState(false);

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
            <p className="m-0">Image</p>
          </div>

          <div className="model-body">
            <div className="row mt-3">
              <img
                src={dialogueData?.mainPostImage || dialogueData?.videoImage}
                alt="Post Preview"
                width={"100%"}
                height={500}
                style={{ objectFit: "contain", width: "100%" }}
                onError={(e) => {
                  e.currentTarget.src = "/images/noImage.png";
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

export default PostImagePreviewDialogue;
