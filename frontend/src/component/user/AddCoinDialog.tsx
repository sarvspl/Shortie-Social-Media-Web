import React, { useState, useEffect } from "react";
import { Box, Modal, Typography, IconButton } from "@mui/material";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { closeDialog } from "@/store/dialogSlice";
import { manageUserCoin } from "@/store/userSlice";
import Button from "@/extra/Button";
import Input from "@/extra/Input";
import { permissionError } from "@/util/Alert";
import CloseIcon from "@mui/icons-material/Close";

const style: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 550,
  backgroundColor: "background.paper",
  borderRadius: "12px",
  boxShadow: "24px",
  padding: "0px",
  maxHeight: "90vh",
  overflowY: "auto",
};

const AddCoinDialog = () => {
  const { dialogue, dialogueData, dialogueType } = useSelector((state: RootStore) => state.dialogue);

  const dispatch = useAppDispatch();
  const [coinAmount, setCoinAmount] = useState<string>("");
  const [actionType, setActionType] = useState<"add" | "remove">("add");
  const [errors, setErrors] = useState({ coinAmount: "" });

  useEffect(() => {
    if (dialogue) {
      setCoinAmount("");
      setActionType("add");
      setErrors({ coinAmount: "" });
    }
  }, [dialogue]);

  const handleClose = () => {
    dispatch(closeDialog());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d+$/.test(val)) {
      setCoinAmount(val);
      setErrors({ coinAmount: "" });
    }
  };

  const handleSubmit = async () => {

    if (!coinAmount.trim()) {
      setErrors({ coinAmount: "Coin amount is required" });
      return;
    }
    const amountNum = Number(coinAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setErrors({ coinAmount: "Please enter a valid amount greater than 0" });
      return;
    }

    if (actionType === "remove" && amountNum > (dialogueData?.coin || 0)) {
      setErrors({ coinAmount: "Cannot remove more coins than the current balance" });
      return;
    }

    const payload = {
      userId: dialogueData?._id,
      coin: amountNum,
      action: actionType === "add" ? "add" : "deduct"
    };

    try {
      await dispatch(manageUserCoin(payload)).unwrap();
      dispatch(closeDialog());
    } catch (error) {
      console.error(error);
    }
  };

  if (dialogueType !== "manageCoin") return null;

  return (
    <Modal open={dialogue} onClose={handleClose}>
      <Box sx={style}>
        <div className="model-header d-flex justify-content-between align-items-center" style={{ padding: "15px 20px", borderBottom: "1px solid #f0f0f0" }}>
          <div>
            <h5 className="m-0 fw-bold">Adjust Coins for <span className="text-capitalize">{dialogueData?.name}</span></h5>
          </div>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>

        <div className="model-body" style={{ padding: "20px" }}>
          <div className="mb-4 d-flex align-items-center">
            <Typography variant="body1" className="fw-bold d-flex align-items-center">
              <span className="text-muted me-2" style={{ fontSize: "16px" }}>Current Coin Balance :</span>
              <div style={{ backgroundColor: "#FFB000", borderRadius: "50%", width: "18px", height: "18px", display: "inline-block", marginRight: "6px", border: "2px solid #E69D00" }}></div>
              <span className="fw-bold" style={{ fontSize: '18px' }}>
                {dialogueData?.coin || 0}
              </span>
            </Typography>
          </div>

          <div className="mb-4 d-flex gap-3">
            <button
              type="button"
              onClick={() => {
                setActionType("add");
                setErrors({ coinAmount: "" });
                setCoinAmount("");
              }}
              className="fw-bold px-4 py-2"
              style={{
                backgroundColor: actionType === "add" ? "#806CFF" : "transparent",
                border: "1px solid #806CFF",
                color: actionType === "add" ? "white" : "#806CFF",
                borderRadius: "6px",
                fontSize: "14px",
                transition: "all 0.2s ease-in-out"
              }}
            >
              Add Coins
            </button>
            <button
              type="button"
              onClick={() => {
                setActionType("remove");
                setErrors({ coinAmount: "" });
                setCoinAmount("");
              }}
              className="fw-bold px-4 py-2"
              style={{
                backgroundColor: actionType === "remove" ? "#ff4d4f" : "transparent",
                border: "1px solid #ff4d4f",
                color: actionType === "remove" ? "white" : "#ff4d4f",
                borderRadius: "6px",
                fontSize: "14px",
                transition: "all 0.2s ease-in-out"
              }}
            >
              Remove Coins
            </button>
          </div>

          <div className="mb-4">
            <Input
              type="number"
              label={actionType === "add" ? "Coins to Add" : "Coins to Remove"}
              placeholder=""
              value={coinAmount}
              errorMessage={errors.coinAmount}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="model-footer d-flex justify-content-end p-3 gap-2" style={{ borderTop: "1px solid #f0f0f0" }}>
          <Button onClick={handleClose} btnName={"Cancel"} newClass={"btn-light border text-dark"} style={{ height: "40px", borderRadius: "8px", padding: "0 25px" }} />
          <Button onClick={handleSubmit} btnName={"Update"} newClass={"submit-btn"} style={{ height: "40px", borderRadius: "8px", padding: "0 25px" }} />
        </div>
      </Box>
    </Modal>
  );
};

export default AddCoinDialog;
