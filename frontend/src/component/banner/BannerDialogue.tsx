import Button from "@/extra/Button";
import { usePermission } from "@/hooks/usePermission";
import Input from "@/extra/Input";
import { adminProfileUpdate, uploadFile } from "@/store/adminSlice";
import { createBanner, getBanner, updateBanner } from "@/store/bannerSlice";
import { closeDialog } from "@/store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { permissionError } from "@/util/Alert";
import { projectName } from "@/util/config";
import { Box, Modal, Skeleton, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import NoImageUser from "../../assets/images/user.png";
import { setToast } from "@/util/toast";
const style: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "600px",
  backgroundColor: "background.paper",
  borderRadius: "5px",
  border: "1px solid #C9C9C9",
  boxShadow: "24px",
  outline: "none",
  // padding: "19px",
};

interface ErrorState {
  image: string;
  serviceId: string;
  type: string;
  url: string;
}
const BannerDialogue = () => {
  const { dialogue, dialogueData, dialogueType } = useSelector(
    (state: RootStore) => state.dialogue,
  );
  const { can } = usePermission();
  const canCreate = can("Banner", "Create");
  const canEdit = can("Banner", "Edit");

  // useEffect(() => {
  //   const payload: any = {
  //     start: 0,
  //     limit: 100,
  //     search: "ALL",
  //   };
  //   dispatch(getBanner(payload));
  // }, [0, 100, "ALL"]);

  const dispatch = useAppDispatch();
  const [image, setImage] = useState<any>();
  const [imagePath, setImagePath] = useState<any>();
  const [addCurrencyOpen, setAddCurrencyOpen] = useState(false);

  const [imgLoading, setImgLoading] = useState(true);

  const [error, setError] = useState({
    image: "",
    type: "",
  });
  const [originalData, setOriginalData] = useState<any>(null);

  useEffect(() => {
    if (dialogue) {
      setAddCurrencyOpen(dialogue);
    }
  }, [dialogue]);

  useEffect(() => {
    if (dialogueData) {
      setImagePath(dialogueData?.image);
      setOriginalData({
        image: dialogueData?.image || "",
      });
    }
  }, [dialogueData]);

  const handleCloseAddCurrency = () => {
    setAddCurrencyOpen(false);
    dispatch(closeDialog());
    localStorage.setItem("dialogueData", JSON.stringify(dialogueData));
  };

  let folderStructure: string = `${projectName}/admin/bannerImage`;

  const handleFileUpload = async (image) => {
    // Get the uploaded file from the event
    const file = image;
    const formData = new FormData();

    formData.append("folderStructure", folderStructure);
    formData.append("keyName", file[0]?.name);
    formData.append("content", file[0]);

    // Create a payload for your dispatch
    const payloadformData: any = {
      data: formData,
    };

    if (!canCreate && !canEdit) return null;
    if (formData) {
      const response: any = await dispatch(
        uploadFile(payloadformData),
      ).unwrap();

      if (response?.data?.status) {
        if (response.data.url) {
          setImage(response.data.url);
          setImagePath(response.data.url);

          return response.data.url;
        }
      }
    }
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage([e.target.files[0]]);
      setImagePath(URL.createObjectURL(e.target.files[0]));
    }
  };



  const handleSubmit = async (e: any) => {
    if (dialogueData && !canEdit) return permissionError();
    if (!dialogueData && !canCreate) return permissionError();


    if (dialogueData) {
      // Update logic
      let hasChanged = false;
      let changedFields: any = {};

      if (image) {
        const url = await handleFileUpload(image);
        changedFields.image = url;
        hasChanged = true;
      }

      if (!hasChanged) {
        setToast("info", "No changes made");
        dispatch(closeDialog());
        return;
      }

      const payload: any = {
        id: dialogueData?._id,
        ...changedFields,
      };

      dispatch(updateBanner(payload));
      dispatch(closeDialog());
    } else {
      // Create logic
      if (!image) {
        let error = {} as ErrorState;
        error.image = "Image is required";
        return setError({ ...error });
      }

      const url = await handleFileUpload(image);

      let payload: any = {
        image: url,
      };

      dispatch(createBanner(payload));
      dispatch(closeDialog());
    }
  };

  return (
    <div>
      <Modal
        open={addCurrencyOpen}
        onClose={handleCloseAddCurrency}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="">
          <div className="model-header">
            <p className="m-0">{dialogueData ? "Edit Banner" : "Add Banner"}</p>
          </div>
          <div className="model-body">
            <form>
              <div className="row sound-add-box  gift-banner-row">
                <Input
                  type={"file"}
                  label={"Image"}
                  accept={"image/png, image/jpeg"}
                  errorMessage={error.image && error.image}
                  onChange={handleImage}
                />
                <p className="gift-banner-note">
                  (Note: Accept only .png and .jpg)
                </p>

                {imagePath && (
                  <Box className="banner-preview-box">
                    {/* Skeleton */}
                    {imgLoading && (
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height="100%"
                        animation="wave"
                        className="gift-banner-preview-skeleton"
                      />
                    )}

                    {/* Image */}
                    <img
                      src={imagePath}
                      loading="lazy"
                      alt="image"
                      onLoad={() => setImgLoading(false)}
                      onError={(e) => {
                        setImgLoading(false);
                        e.currentTarget.src = "/images/user.png";
                      }}
                      className={`gift-banner-preview-img ${imgLoading ? "gift-banner-blur" : ""} w-100 h-100 object-fit-cover`}
                    />
                  </Box>
                )}
              </div>
            </form>
          </div>
          <div className="model-footer">
            <div className="m-3 d-flex justify-content-end gap-3 gift-banner-footer">
              <Button
                onClick={handleCloseAddCurrency}
                btnName={"Close"}
                newClass={"close-model-btn"}
              />
              {(dialogueData ? canEdit : canCreate) && (
                <Button
                  onClick={handleSubmit}
                  btnName={dialogueData ? "Update" : "Submit"}
                  type={"button"}
                  newClass={"submit-btn gift-banner-submit-btn"}
                />
              )}
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default BannerDialogue;
