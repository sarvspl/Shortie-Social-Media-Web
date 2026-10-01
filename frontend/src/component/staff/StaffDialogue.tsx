import React, { useEffect, useState, useMemo } from "react";
import { Box, Modal, Typography, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { closeDialog } from "@/store/dialogSlice";
import { createStaff, editStaff, fetchStaffList } from "@/store/staffSlice";
import { fetchAssignableRoles } from "@/store/roleSlice";
import Button from "@/extra/Button";
import Input from "@/extra/Input";
import { permissionError } from "@/util/Alert";
import { toast } from "react-toastify";

const modalBoxSx = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "calc(100vw - 24px)", sm: 600 },
    maxWidth: "100vw",
    backgroundColor: "background.paper",
    borderRadius: "5px",
    border: "1px solid #C9C9C9",
    boxShadow: 24,
};

const StaffDialogue = () => {
    const { dialogue, dialogueData, dialogueType } = useSelector((state: RootStore) => state.dialogue);
    const { assignableRoles } = useSelector((state: RootStore) => state.role);


    const dispatch = useAppDispatch();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        roleId: "",
    });

    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        dispatch(fetchAssignableRoles());
    }, [dispatch]);

    useEffect(() => {
        if (dialogueType === "editStaff" && dialogueData) {
            setFormData({
                name: dialogueData.name || "",
                email: dialogueData.email || "",
                password: "", // Not shown in edit
                roleId: dialogueData.role?._id || "",
            });
        } else {
            setFormData({
                name: "",
                email: "",
                password: "",
                roleId: "",
            });
        }
        setErrors({});
    }, [dialogueData, dialogueType]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev: any) => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const e: any = {};
        if (!formData.name.trim()) e.name = "Name is required";
        if (!formData.email.trim()) e.email = "Email is required";

        if (dialogueType === "addStaff") {
            if (!formData.password.trim()) {
                e.password = "Password is required";
            } else {
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
                if (!passwordRegex.test(formData.password)) {
                    e.password = "Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.";
                }
            }
        }

        if (!formData.roleId) e.roleId = "Role is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleClose = () => {
        dispatch(closeDialog());
    };

    const handleSubmit = async () => {

        if (!validate()) return;

        if (dialogueType === "editStaff") {
            const payload: any = { subAdminId: dialogueData._id };
            let changed = false;

            if (formData.name !== dialogueData.name) {
                payload.name = formData.name;
                changed = true;
            }
            if (formData.email !== dialogueData.email) {
                payload.email = formData.email;
                changed = true;
            }
            if (formData.roleId !== (dialogueData.role?._id || "")) {
                payload.roleId = formData.roleId;
                changed = true;
            }

            if (!changed) {
                toast.info("No changes made");
                handleClose();
                return;
            }

            await dispatch(editStaff(payload)).unwrap();
        } else {
            await dispatch(createStaff(formData)).unwrap();
        }

        dispatch(fetchStaffList({ start: 1, limit: 10 }));
        handleClose();
    };

    return (
        <Modal open={dialogue} onClose={handleClose}>
            <Box sx={modalBoxSx}>
                <div className="model-header">
                    <p className="m-0">{dialogueType === "editStaff" ? "Edit Staff" : "Add Staff"}</p>
                </div>
                <form autoComplete="off">
                    <div className="model-body" style={{ padding: "20px" }}>
                        <div className="row">
                            <div className="col-12">
                                <Input
                                    label="Name"
                                    name="name"
                                    placeholder="Enter Name"
                                    value={formData.name}
                                    errorMessage={errors.name}
                                    onChange={handleChange}
                                    autoComplete="off"
                                />
                            </div>
                            <div className="col-12 mt-3">
                                <Input
                                    label="Email"
                                    name="email"
                                    placeholder="Enter Email"
                                    value={formData.email}
                                    errorMessage={errors.email}
                                    onChange={handleChange}
                                    autoComplete="new-email"
                                />
                            </div>
                            {dialogueType === "addStaff" && (
                                <div className="col-12 mt-3">
                                    <Input
                                        label="Password"
                                        name="password"
                                        type="password"
                                        placeholder="Enter Password"
                                        value={formData.password}
                                        errorMessage={errors.password}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                        helperText="(Atleast One A-Z, a-z, 0-9, Special Character $&@)"
                                    />
                                </div>
                            )}
                            <div className="col-12 mt-3">
                                <FormControl fullWidth size="small">
                                    <InputLabel>Select Role</InputLabel>
                                    <Select
                                        name="roleId"
                                        value={formData.roleId}
                                        label="Select Role"
                                        onChange={handleChange}
                                        error={!!errors.roleId}
                                    >
                                        {assignableRoles?.map((r: any) => (
                                            <MenuItem key={r._id} value={r._id}>
                                                {r.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.roleId && <Typography color="error" variant="caption" sx={{ ml: 2 }}>{errors.roleId}</Typography>}
                                </FormControl>
                            </div>
                        </div>
                    </div>
                </form>
                <div className="model-footer">
                    <div className="m-3 d-flex justify-content-end">
                        <Button onClick={handleClose} btnName={"Close"} newClass={"close-model-btn"} />
                        <Button onClick={handleSubmit} btnName={dialogueType === "editStaff" ? "Update" : "Submit"} newClass={"submit-btn ms-2"} />
                    </div>
                </div>
            </Box>
        </Modal>
    );
};

export default StaffDialogue;
