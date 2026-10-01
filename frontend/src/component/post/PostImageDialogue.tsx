import { RootStore, useAppDispatch } from "@/store/store";
import { Box, Dialog, DialogContent, IconButton, Modal, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Button from "@/extra/Button";
import { closeDialog } from "@/store/dialogSlice";
import { getPostDetails } from "@/store/postSlice";
import noImage from "@/assets/images/noImage.png";
import { baseURL } from "@/util/config";
import CloseIcon from "@mui/icons-material/Close";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  maxWidth: "95vw",
  bgcolor: "background.paper",
  borderRadius: "5px",
  border: "1px solid #C9C9C9",
  boxShadow: 24,
  overflow: "hidden",
  wordBreak: "break-word",
};
const PostImageDialogue: React.FC = () => {
  const { dialogue, dialogueData } = useSelector((state: RootStore) => state.dialogue);
  const [showFullCaption, setShowFullCaption] = useState(false);

  // const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpen = (index: number) => {
    setSelectedIndex(index);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedIndex(null);
  };

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

  const maxLength = 10; // Number of characters to show initially
  const caption = dialogueData?.caption || "";

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div>
      <Modal open={addPostOpen} onClose={handleCloseAddCategory} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={style} className="">
          {/* <Box sx={style} className="create-channel-model"> */}
          <div className="model-header">
            <p className="m-0">Post Info</p>
          </div>

          <div className="model-body">
            <h6 className="mt-2 images-class">Images :</h6>

            <div className="row sound-add-box-post">
              <div
                className="post-list"
                style={{
                  display: "flex",
                  margin: "10px",
                  flexWrap: "wrap",
                  gap: "20px",
                }}
              >
                {dialogueData.postImage?.map((post, index) => (
                  <div
                    key={index}
                    style={{
                      width: "136px",
                      height: "158px",
                      overflow: "hidden",
                      borderRadius: "8px",
                      background: "#f0f0f0",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      opacity: post.isBanned ? 0.3 : 1,
                    }}
                  >
                    {post.url ? (
                      <img
                        src={post.url}
                        alt={`Post ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                        onClick={() => handleOpen(index)}
                        onError={(e: any) => {
                          e.target.onerror = null;
                          e.target.src = "/images/noImage.png";
                        }}
                      />
                    ) : (
                      <img
                        src="/images/noImage.png"
                        alt={`Post ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                        onClick={() => handleOpen(index)}
                        onError={(e: any) => {
                          e.target.onerror = null;
                          e.target.src = "/images/noImage.png";
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {dialogueData?.caption && (
              <div className="mt-3">
                <h6 className="images-class">Caption :</h6>
                <Typography
                  variant="body1"
                  style={{
                    fontSize: "14px",
                    color: "#000",
                    marginLeft: "10px",
                    fontWeight: "500",
                    marginTop: "15px",
                  }}
                >
                  {dialogueData?.caption?.length > 50 ? (
                    <div>
                      {showFullCaption ? dialogueData?.caption : dialogueData?.caption.slice(0, 50) + "... "}
                      {!showFullCaption && (
                        <span
                          onClick={() => setShowFullCaption(true)}
                          style={{
                            color: "#1F3C88",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                        >
                          Read More
                        </span>
                      )}
                    </div>
                  ) : (
                    dialogueData?.caption // Show the full caption directly if it's ≤ 50 characters
                  )}
                </Typography>
              </div>
            )}

            {/* Hashtags Section */}
            <h6 className="mt-2 images-class">{dialogueData?.hashTags?.length > 0 && "Hashtag :"}</h6>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "15px",
              }}
            >
              {dialogueData?.hashTags
                ? dialogueData?.hashTags?.map((tag, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "5px 12px 0px 0px",
                      borderRadius: "15px",
                      fontSize: "14px",
                      color: "#333",
                    }}
                  >
                    <img
                      src={tag.hashTagBanner}
                      alt={tag.name}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "5px",
                        marginRight: "5px",
                        objectFit: "cover",
                      }}
                    />
                    <b
                      className="text-dark"
                      style={{
                        fontSize: "14px",
                      }}
                    >
                      #{tag.hashTag}
                    </b>
                  </div>
                ))
                : dialogueData?.hashTagId?.map((tag, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "5px 12px 0px 0px",
                      borderRadius: "15px",
                      fontSize: "14px",
                      color: "#333",
                    }}
                  >
                    <img
                      src={tag.hashTagIcon}
                      alt={tag.name}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "5px",
                        marginRight: "5px",
                        objectFit: "cover",
                      }}
                    />
                    <b
                      className="text-dark"
                      style={{
                        fontSize: "14px",
                      }}
                    >
                      #{tag.hashTag}
                    </b>
                  </div>
                ))}
            </div>
          </div>

          <div className="model-footer">
            <div className="p-3 d-flex justify-content-end">
              <Button onClick={() => handleCloseAddCategory()} btnName={"Close"} newClass={"close-model-btn"} />
            </div>
          </div>
        </Box>
      </Modal>

      {dialogOpen && dialogueData?.postImage?.length > 0 && <ImageDialog images={dialogueData.postImage} startIndex={selectedIndex} dialogOpen={dialogOpen} handleClose={handleClose} />}
    </div>
  );
};

export default PostImageDialogue;

const ArrowButton = (props: any) => {
  const { onClick, direction, className } = props;
  if (className?.includes("slick-disabled")) {
    return null;
  }
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        width: "32px",
        height: "32px",
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
};

interface ImageDialogProps {
  images: { url: string }[];
  startIndex: number;
  dialogOpen: boolean;
  handleClose: () => void;
}

const ImageDialog: React.FC<ImageDialogProps> = ({ images, startIndex, dialogOpen, handleClose }) => {
  const sliderRef = React.useRef<Slider | null>(null);

  const [currentSlide, setCurrentSlide] = React.useState(startIndex);

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.slickGoTo(startIndex, true);
      setCurrentSlide(startIndex);
    }
  }, [startIndex]);

  const settings = {
    dots: false, // We have the counter now
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: images.length > 1,
    prevArrow: <ArrowButton direction="left" />,
    nextArrow: <ArrowButton direction="right" />,
    afterChange: (current: number) => setCurrentSlide(current),
  };

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: { xs: "95vw", sm: "500px" },
          height: { xs: "95vw", sm: "500px" },
          // maxWidth: "900px",
          // maxHeight: "600px",
          // minWidth: "500px",
          // minHeight: "350px",
          borderRadius: "8px",
          overflow: "hidden",
          position: "relative",
          backgroundColor: "transparent",
          boxShadow: "none",
        },
      }}
    >
      <IconButton
        onClick={handleClose}
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 10,
          backgroundColor: "rgba(0,0,0,0.6)",
          color: "#fff",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.8)",
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: 0, overflow: "hidden", height: "100%" }}>
        <Box sx={{ position: "relative", width: "100%", height: "100%" }}>

          <Slider ref={sliderRef} {...settings}>
            {images.map((img, idx) => (
              <Box
                key={idx}
                className="bg-black/50 backdrop-blur-md"
                sx={{
                  width: "100%",
                  height: { xs: "95vw", sm: "500px" },
                  display: "flex !important",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <img
                  src={img.url}
                  alt={`image-${idx}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    backgroundColor: "transparent",
                    margin: "auto",
                  }}
                />
              </Box>
            ))}
          </Slider>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
