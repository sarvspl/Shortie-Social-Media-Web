import React, { useState } from "react";
import { Box, Modal } from "@mui/material";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { closeDialog } from "@/store/dialogSlice";
import { editStaff } from "@/store/staffSlice";
import Button from "@/extra/Button";
import Input from "@/extra/Input";
import { permissionError } from "@/util/Alert";

const modalBoxSx = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "calc(100vw - 24px)", sm: 500 },
    maxWidth: "100vw",
    backgroundColor: "background.paper",
    borderRadius: "5px",
    border: "1px solid #C9C9C9",
    boxShadow: "24px",
};

const StaffPasswordUpdateDialog = () => {
    const { dialogue, dialogueData } = useSelector((state: RootStore) => state.dialogue);


    const dispatch = useAppDispatch();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<any>({});

    const handleClose = () => {
        dispatch(closeDialog());
    };

    const validate = () => {
        const e: any = {};

        if (!password) { e.password = "Password is required" }
        else {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
            if (!passwordRegex.test(password)) {
                e.password = "Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.";
            }
        }
        if (!confirmPassword) { e.confirmPassword = "Confirm Password is required" }
        else {
            if (password !== confirmPassword) { e.confirmPassword = "Passwords do not match" }
        };
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {

        if (!validate()) return;

        const payload = {
            subAdminId: dialogueData._id,
            password: password,
        };

        await dispatch(editStaff(payload)).unwrap();
        handleClose();
    };

    return (
        <Modal open={dialogue} onClose={handleClose}>
            <Box sx={modalBoxSx}>
                <div className="model-header">
                    <p className="m-0">Update Password - {dialogueData?.name}</p>
                </div>
                <form autoComplete="off">
                    <div className="model-body" style={{ padding: "20px" }}>
                        <Input
                            label="New Password"
                            type="password"
                            placeholder="Enter New Password"
                            value={password}
                            errorMessage={errors.password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setErrors({});
                            }}
                            autoComplete="new-password"
                        />
                        <div className="mt-3">
                            <Input
                                label="Confirm Password"
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                errorMessage={errors.confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setErrors({});
                                }}
                                autoComplete="new-password"
                            />
                        </div>
                    </div>
                </form>
                <div className="model-footer">
                    <div className="m-3 d-flex justify-content-end">
                        <Button onClick={handleClose} btnName={"Close"} newClass={"close-model-btn"} />
                        <Button onClick={handleSubmit} btnName={"Update"} newClass={"submit-btn ms-2"} />
                    </div>
                </div>
            </Box>
        </Modal>
    );
};

export default StaffPasswordUpdateDialog;
