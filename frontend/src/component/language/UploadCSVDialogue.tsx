import React, { useEffect, useState } from "react";
import { usePermission } from "@/hooks/usePermission";
import { useSelector } from "react-redux";
import { Box, Modal, Typography } from "@mui/material";
import Button from "@/extra/Button";
import { closeDialog } from "@/store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { permissionError } from "@/util/Alert";
import { uploadTranslations } from "@/store/languageSlice";

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

const UploadCSVDialogue = () => {
    const dispatch = useAppDispatch();
    const { can } = usePermission();
    const canEdit = can("Language", "Edit");

    const { dialogue } = useSelector((state: RootStore) => state.dialogue);

    const { languages } = useSelector((state: RootStore) => state.language);

    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState("");

    const activeLanguages = languages.filter((lang) => lang.isActive);

    useEffect(() => {
        setOpen(dialogue);
    }, [dialogue]);

    const handleClose = () => {
        setOpen(false);
        setFile(null);
        setError("");
        dispatch(closeDialog());
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError("");
        }
    };

    const handleSubmit = () => {


        if (!file) {
            setError("Please select a CSV file!");
            return;
        }

        const formData = new FormData();
        // Since the dropdown is removed, we assume the CSV handles language mapping internally
        formData.append("file", file);

        dispatch(uploadTranslations(formData));
        handleClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="upload-csv-modal-title"
        >
            <Box sx={style}>
                <div className="model-header">
                    <p className="m-0">Upload CSV File</p>
                </div>
                <div className="model-body p-4">
                    <div className="mb-4">
                        <p className="fw-bold mb-2">
                            You currently have {activeLanguages.length} active languages. Please upload a CSV file that includes all these languages.
                        </p>
                        <ul className="list-group" style={{ maxHeight: "150px", overflowY: "auto", borderRadius: "8px" }}>
                            {activeLanguages.map((lang) => (
                                <li key={lang._id} className="list-group-item py-2" style={{ fontSize: "14px" }}>
                                    {lang.languageTitle} ({lang.languageCode})
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="alert alert-info py-2 px-3 mb-4" style={{ backgroundColor: "#e7f3ff", border: "1px solid #b8daff", color: "#004085", borderRadius: "8px" }}>
                        <Typography variant="body2">
                            <strong>Note:</strong> The language code must exist inside the CSV file being uploaded.
                        </Typography>
                    </div>

                    <div>
                        <label className="label-form mb-2 d-block">Select CSV File</label>
                        <input
                            type="file"
                            accept=".csv"
                            className="form-control p-2"
                            onChange={handleFileChange}
                            style={{ height: "auto", borderRadius: "8px", border: "1px solid #ced4da" }}
                        />
                    </div>

                    {error && <p className="errorMessage mt-2 text-danger">{error}</p>}
                </div>
                <div className="model-footer">
                    <div className="p-3 d-flex justify-content-end">
                        <Button
                            onClick={handleClose}
                            btnName="Close"
                            newClass="close-model-btn"
                        />
                        <Button
                            onClick={handleSubmit}
                            btnName="Submit"
                            type="button"
                            newClass="submit-btn"
                            style={{
                                borderRadius: "0.5rem",
                                width: "80px",
                                marginLeft: "10px",
                            }}
                        />
                    </div>
                </div>
            </Box>
        </Modal>
    );
};

export default UploadCSVDialogue;
