import Button from "@/extra/Button";
import { usePermission } from "@/hooks/usePermission";
import Input from "@/extra/Input";
import { uploadFile } from "@/store/adminSlice";
import { addCoinPlan, updateCoinPlan } from "@/store/coinPlanSlice";
import { closeDialog } from "@/store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { permissionError } from "@/util/Alert";

import { baseURL, projectName } from "@/util/config";
import { Box, Icon, Modal, Typography, Tooltip } from "@mui/material";
import { IconInfoCircle } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { setToast } from "@/util/toastServices";
import { useSelector } from "react-redux";
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
  // padding: "19px",
};

interface ErrorState {
  coin: String;
  amount: String;
  image: string;
  productKey: string;
}
const CoinPlanDialogue = () => {
  const { dialogue, dialogueData } = useSelector(
    (state: RootStore) => state.dialogue
  );
  const { can } = usePermission();
  const canCreate = can("Coin Plan", "Create");
  const canEdit = can("Coin Plan", "Edit");




  const dispatch = useAppDispatch();
  const [addcoinPlanOpen, setAddcoinPlanOpen] = useState(false);

  const [coin, setCoin] = useState<string>();
  const [mongoId, setMongoId] = useState<string>("");
  const [image, setImage] = useState<any>(null);
  const [imagePath, setImagePath] = useState<any>(null);
  const [amount, setAmount] = useState<string>();
  const [productKey, setProductKey] = useState<string>();


  const [error, setError] = useState<ErrorState>({
    coin: "",
    amount: "",
    image: "",
    productKey: "",
  });

  const [originalData, setOriginalData] = useState<any>(null);

  useEffect(() => {
    if (dialogue) {
      setAddcoinPlanOpen(dialogue);
    }
  }, [dialogue]);

  useEffect(() => {
    if (dialogueData) {
      setMongoId(dialogueData._id);
      setCoin(dialogueData.coin);
      setAmount(dialogueData.amount);
      setProductKey(dialogueData.productKey);
      setImagePath(dialogueData?.icon);
      setOriginalData({
        coin: dialogueData.coin,
        amount: dialogueData.amount,
        productKey: dialogueData.productKey,
        icon: dialogueData?.icon
      });
    }
  }, [dialogueData]);


  let folderStructure: string = `${projectName}/admin/coinplanImage`;

  const handleFileUpload = async (image: any) => {
    if (!image) return null;
    // // Get the uploaded file from the event
    const file = image[0];
    const formData = new FormData();

    formData.append("folderStructure", folderStructure);
    formData.append("keyName", file.name);
    formData.append("content", file);

    // Create a payload for your dispatch
    const payloadformData: any = {
      data: formData,
    };

    if (!canCreate && !canEdit) return null;
    if (formData) {
      const response: any = await dispatch(uploadFile(payloadformData)).unwrap();

      if (response?.data?.status) {

        if (response.data.url) {
          setImage(response.data.url);
          setImagePath(response.data.url);

          return response.data.url
        }
      }
    }
  };


  const handleSubmit = async () => {
    if (dialogueData && !canEdit) return permissionError();
    if (!dialogueData && !canCreate) return permissionError();


    if (!coin || !amount || !productKey) {
      let error = {} as ErrorState;
      if (!coin) error.coin = "Coin Is Required !";
      if (!productKey) error.productKey = "Product Key Is Required!";
      if (!amount) error.amount = "amount Is Required !";

      return setError({ ...error });
    } else {
      if (dialogueData) {
        let hasChanged = false;
        let changedFields: any = {};

        if (String(coin || "").trim() !== String(originalData?.coin || "").trim()) {
          changedFields.coin = coin;
          hasChanged = true;
        }

        if (String(amount || "").trim() !== String(originalData?.amount || "").trim()) {
          changedFields.amount = amount;
          hasChanged = true;
        }

        if (String(productKey || "").trim() !== String(originalData?.productKey || "").trim()) {
          changedFields.productKey = productKey;
          hasChanged = true;
        }

        let url = originalData?.icon;
        if (image) {
          url = await handleFileUpload(image);
          changedFields.icon = url;
          hasChanged = true;
        }

        if (!hasChanged) {
          setToast("info", "No changes made");
          handleCloseAddcoinPlan();
          return;
        }

        let payload: any = {
          ...changedFields,
          coinPlanId: mongoId,
        };
        dispatch(updateCoinPlan(payload));
      } else {
        let url = await handleFileUpload(image);
        let data: any = {
          coin: coin,
          amount: amount,
          icon: url,
          productKey: productKey,
        };
        dispatch(addCoinPlan(data));
      }
      handleCloseAddcoinPlan();
    }
  };

  const handleCloseAddcoinPlan = () => {
    setAddcoinPlanOpen(false);
    dispatch(closeDialog());
    localStorage.setItem("dialogueData", JSON.stringify(dialogueData));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e?.target?.files && e?.target?.files[0]) {
      setImage([e?.target?.files[0]]);
      setImagePath(URL.createObjectURL(e?.target?.files[0]));
    }
  };

  return (
    <div>
      <Modal
        open={addcoinPlanOpen}
        onClose={handleCloseAddcoinPlan}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="">
          <div className="model-header">
            <p className="m-0">
              {dialogueData ? "Edit Coin Plan" : "Add Coin Plan"}
            </p>
          </div>

          <div className="model-body">
            <form>
              <div
                className="row sound-add-box"
                style={{ overflowX: "hidden" }}
              >
                <Input
                  type={"number"}
                  label={"Coin"}
                  name={"coin"}
                  placeholder={"Enter coin"}
                  value={coin}
                  errorMessage={error.coin && error.coin}
                  onChange={(e: any) => {
                    setCoin(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        coin: `coin Is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        coin: "",
                      });
                    }
                  }}
                />
                <Input
                  type={"number"}
                  label={"Amount"}
                  name={"Amount"}
                  placeholder={"Enter Amount"}
                  value={amount}
                  newClass={`mt-3`}
                  errorMessage={error.amount && error.amount}
                  onChange={(e: any) => {
                    setAmount(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        amount: `Amount Is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        amount: "",
                      });
                    }
                  }}
                />
                <div className="mt-3">
                  <label className="m-0" style={{ color: "#404040", fontWeight: 500, marginBottom: "5px", display: "flex" }}>Product Key</label>
                  <div style={{ position: "relative" }}>
                    <Input
                      type={"text"}
                      label={"Product Key"}
                      labelShow={false}
                      name={"Product Key"}
                      placeholder={"Enter Product Key"}
                      value={productKey}
                      style={{ paddingRight: "40px" }}
                      onChange={(e: any) => {
                        setProductKey(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            productKey: `ProductKey Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            productKey: "",
                          });
                        }
                      }}
                    />
                    <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                      <Tooltip
                        title={
                          <div style={{ maxWidth: "300px" }}>
                            <strong>Product Key (In-App Purchase ID)</strong>
                            <br /><br />
                            Please enter the exact Product ID / Product Key that you created in your mobile app store.
                            <br /><br />
                            • For Android apps, create the in-app product in Google Play Console and copy the Product ID.
                            <br />
                            • For iOS apps, create the in-app purchase in App Store Connect and copy the Product ID.
                            <br /><br />
                            <strong>Important:</strong>
                            <br />
                            • The Product Key in this admin panel must be exactly the same as the Product ID created in the store.
                            <br />
                            • Do not change the key after creating it in the store.
                            <br />
                            • The same key will be used by the mobile app to verify purchases.
                          </div>
                        }
                        placement="top"
                        arrow
                        slotProps={{
                          popper: {
                            sx: {
                              zIndex: 10000000,
                            },
                          },
                        }}
                      >
                        <IconInfoCircle size={20} style={{ cursor: "pointer", color: "#667085" }} />
                      </Tooltip>
                    </div>
                  </div>
                  {error.productKey && (
                    <p className="errorMessage">{error.productKey}</p>
                  )}
                </div>
                <div className=" mt-2">
                  <Input
                    type={"file"}
                    label={"Icon"}
                    accept={"image/*"}
                    errorMessage={error.image && error.image}
                    onChange={handleImage}
                  />
                  <p className="fw-medium m-0 text-danger" style={{ fontSize: "small" }}>(Note: Accept .png, .jpg, .jpeg, .gif)</p>
                </div>
                <div className="">
                  {imagePath && (
                    <img
                      src={imagePath}
                      className="mt-3 rounded float-left mb-2"
                      height="100px"
                      width="100px"
                      onError={(e) => {
                        e.currentTarget.src = "/images/user.png";
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
                onClick={handleCloseAddcoinPlan}
                btnName={"Close"}
                newClass={"close-model-btn"}
              />
              {(dialogueData ? canEdit : canCreate) && (
                <Button
                  onClick={handleSubmit}
                  btnName={"Submit"}
                  type={"button"}
                  newClass={"submit-btn"}
                  style={{
                    borderRadius: "0.5rem",
                    width: "80px",
                    marginLeft: "10px",
                  }}
                />
              )}
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default CoinPlanDialogue;
