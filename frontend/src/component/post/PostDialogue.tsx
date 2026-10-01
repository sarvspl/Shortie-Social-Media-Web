import { RootStore, useAppDispatch } from "@/store/store";
import { Box, Modal, Typography, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Button from "@/extra/Button";
import { closeDialog } from "@/store/dialogSlice";
import { baseURL } from "@/util/config";
import { getPostDetails } from "@/store/postSlice";
import Link from 'next/link';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "94%", sm: 600 },
  maxHeight: "90vh",
  overflowY: "auto" as "auto",
  bgcolor: "background.paper",
  borderRadius: "5px",
  border: "1px solid #C9C9C9",
  boxShadow: 24,
  // p: "19px",
};

const ArrowButton = ({ onClick, direction }: { onClick?: () => void; direction: "left" | "right" }) => (
  <IconButton
    onClick={onClick}
    sx={{
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 20,
      backgroundColor: "rgba(0,0,0,0.6)",
      color: "#fff",
      "&:hover": {
        backgroundColor: "rgba(0,0,0,0.8)",
      },
      ...(direction === "left" ? { left: 16 } : { right: 16 }),
    }}
  >
    {direction === "left" ? "‹" : "›"}
  </IconButton>
);
const PostDialogue: React.FC = () => {
  const { dialogue, dialogueData } = useSelector(
    (state: RootStore) => state.dialogue
  );

  const { postData }: any = useSelector((state: RootStore) => state?.post);

  const dispatch = useAppDispatch();

  const [data, setData] = useState<any>();
  const [isExpanded, setIsExpanded] = useState(false);

  const [addPostOpen, setAddPostOpen] = useState(false);


  useEffect(() => {
    setData(postData);
  }, [dialogueData]);

  useEffect(() => {
    dispatch(getPostDetails(dialogueData?._id));
  }, [dialogueData]);

  useEffect(() => {
    if (dialogue) {
      setAddPostOpen(true);
    }
  }, [dialogue]);

  const handleCloseAddCategory = async () => {
    dispatch(closeDialog());
    await setAddPostOpen(false);
  };

  const toggleReadMore = () => {
    setIsExpanded(!isExpanded);
  };

  const maxLength = 100; // Number of characters to determine if "Read More" should show
  const caption = dialogueData?.caption || "";

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
            <p className="m-0">
              View Post
            </p>
          </div>
          <div className="model-body">
            <div className="col-12 mt-2">
              <span className="fw-bold">{caption ? "Post Description" : ""}</span>
              <p
                className="mt-2"
                style={{
                  display: isExpanded ? "block" : "-webkit-box",
                  WebkitLineClamp: isExpanded ? "unset" : 2,
                  WebkitBoxOrient: "vertical",
                  overflow: isExpanded ? "auto" : "hidden",
                  height: isExpanded ? "100px" : "auto",
                  wordWrap: "break-word",
                  overflowWrap: "anywhere"
                }}
              >
                {caption}
              </p>
              {caption.length > maxLength && (
                <span className="button" style={{ cursor: 'pointer' }} onClick={toggleReadMore}>
                  {isExpanded ? "Read Less" : "Read More"}
                </span>
              )}
            </div>

            <div className="row mt-3">
              <span className="fw-bold">Post</span>

              <Slider
                dots={true}
                infinite={dialogueData?.postImage?.length > 1}
                speed={500}
                slidesToShow={1}
                slidesToScroll={1}
                arrows={true}
                prevArrow={<ArrowButton direction="left" />}
                nextArrow={<ArrowButton direction="right" />}
              >
                {dialogueData?.postImage?.map((post: any, index: number) => (
                  <div key={index}>
                    <Link href={post?.url || ""} target='_blank'>
                      <img
                        src={post?.url || ""}
                        alt={`Post ${index + 1}`}
                        height={400}
                        style={{
                          objectFit: "contain",
                          width: "100%",
                          height: "350px",
                          opacity: post?.isBanned === true ? 0.5 : 1
                        }}
                      />
                    </Link>
                  </div>
                ))}
              </Slider>
            </div>
          </div>

          <div className="model-footer">
            <div className="p-3 d-flex justify-content-end">
              <Button
                onClick={() => handleCloseAddCategory()}
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

export default PostDialogue;
