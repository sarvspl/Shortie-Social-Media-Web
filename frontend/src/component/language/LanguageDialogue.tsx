import React, { useEffect, useState } from "react";
import { usePermission } from "@/hooks/usePermission";
import { useSelector } from "react-redux";
import { Box, Modal } from "@mui/material";
import Button from "@/extra/Button";
import Input from "@/extra/Input";
import { closeDialog } from "@/store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { permissionError } from "@/util/Alert";
import { createLanguage, updateLanguage } from "@/store/languageSlice";
import { baseURL, projectName } from "@/util/config";
import { uploadFile } from "@/store/adminSlice";
import { toast } from "react-toastify";

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

interface ErrorState {
    languageTitle: string;
    languageCode: string;
    localLanguageTitle: string;
    languageIcon: string;
}

const LanguageDialogue = () => {
    const dispatch = useAppDispatch();
    const { can } = usePermission();
    const canCreate = can("Language", "Create");
    const canEdit = can("Language", "Edit");

    const { dialogue, dialogueData } = useSelector((state: RootStore) => state.dialogue);


    const [open, setOpen] = useState(false);
    const [languageTitle, setLanguageTitle] = useState("");
    const [languageCode, setLanguageCode] = useState("");
    const [localLanguageTitle, setLocalLanguageTitle] = useState("");
    const [languageIcon, setLanguageIcon] = useState<any>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [mongoId, setMongoId] = useState("");

    const [error, setError] = useState<ErrorState>({
        languageTitle: "",
        languageCode: "",
        localLanguageTitle: "",
        languageIcon: "",
    });

    useEffect(() => {
        setOpen(dialogue);
    }, [dialogue]);

    useEffect(() => {
        if (dialogueData) {
            setMongoId(dialogueData._id || "");
            setLanguageTitle(dialogueData.languageTitle || "");
            setLanguageCode(dialogueData.languageCode || "");
            setLocalLanguageTitle(dialogueData.localLanguageTitle || "");
            setImagePreview(dialogueData.languageIcon ? dialogueData.languageIcon : null);
        } else {
            setMongoId("");
            setLanguageTitle("");
            setLanguageCode("");
            setLocalLanguageTitle("");
            setImagePreview(null);
            setLanguageIcon(null);
        }
    }, [dialogueData]);

    const handleClose = () => {
        setOpen(false);
        setLanguageIcon(null);
        setImagePreview(null);
        dispatch(closeDialog());
    };

    const handleImageChange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
            setLanguageIcon(file);
            setImagePreview(URL.createObjectURL(file));
            setError({ ...error, languageIcon: "" });
        }
    };

    let folderStructure: string = `${projectName}/admin/languageImage`;

    const handleFileUpload = async (imageFile: File) => {
        if (!canEdit && !canCreate) return null;
        const formData = new FormData();
        formData.append("folderStructure", folderStructure);
        formData.append("keyName", imageFile.name);
        formData.append("content", imageFile);

        const payloadformData: any = {
            data: formData,
        };

        const response: any = await dispatch(uploadFile(payloadformData)).unwrap();

        if (response?.data?.status) {
            return response.data.url;
        }
        return null;
    };

    const validate = () => {
        let error = {} as ErrorState;
        let isValid = true;

        if (!languageTitle.trim()) {
            error.languageTitle = "Language Name is required!";
            isValid = false;
        }
        if (!languageCode.trim()) {
            error.languageCode = "Language Code is required!";
            isValid = false;
        }
        if (!localLanguageTitle.trim()) {
            error.localLanguageTitle = "Localized Language Title is required!";
            isValid = false;
        }
        if (!mongoId && !languageIcon) {
            error.languageIcon = "Language Icon is required!";
            isValid = false;
        }

        setError(error);
        return isValid;
    };

    const handleSubmit = async () => {
        if (mongoId && !canEdit) return permissionError();
        if (!mongoId && !canCreate) return permissionError();


        if (validate()) {
            if (mongoId) {
                // EDIT MODE: Detect changes and send only updated fields
                const hasTitleChanged = languageTitle.trim() !== (dialogueData?.languageTitle || "");
                const hasCodeChanged = languageCode.trim() !== (dialogueData?.languageCode || "");
                const hasLocalTitleChanged = localLanguageTitle.trim() !== (dialogueData?.localLanguageTitle || "");
                const hasIconChanged = languageIcon !== null;

                if (!hasTitleChanged && !hasCodeChanged && !hasLocalTitleChanged && !hasIconChanged) {
                    toast.info("No changes made");
                    handleClose();
                    return;
                }

                const payload: any = {
                    languageCode: languageCode,
                };
                if (hasTitleChanged) payload.languageTitle = languageTitle;
                if (hasLocalTitleChanged) payload.localLanguageTitle = localLanguageTitle;

                if (hasIconChanged) {
                    const url = await handleFileUpload(languageIcon);
                    if (url) {
                        payload.languageIcon = url;
                    } else {
                        return; // Stop if upload failed
                    }
                }

                dispatch(updateLanguage({ id: mongoId, data: payload }));
            } else {
                // CREATE MODE: Send all required fields
                let uploadedImageUrl = "";

                if (languageIcon) {
                    const url = await handleFileUpload(languageIcon);
                    if (url) {
                        uploadedImageUrl = url;
                    } else {
                        return; // Stop if upload failed
                    }
                }

                const payload: any = {
                    languageTitle,
                    languageCode,
                    localLanguageTitle,
                    languageIcon: uploadedImageUrl,
                };
                dispatch(createLanguage(payload));
            }
            handleClose();
        }
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="language-modal-title"
        >
            <Box sx={style}>
                <div className="model-header">
                    <p className="m-0">{mongoId ? "Edit Language" : "Add Language"}</p>
                </div>
                <div className="model-body">
                    <form>
                        <div className="row sound-add-box" style={{ overflowX: "hidden" }}>
                            <div className="col-12">
                                <Input
                                    label="Language Name"
                                    name="languageTitle"
                                    placeholder="Enter Language Name"
                                    value={languageTitle}
                                    errorMessage={error.languageTitle}
                                    onChange={(e: any) => {
                                        setLanguageTitle(e.target.value);
                                        if (e.target.value) setError({ ...error, languageTitle: "" });
                                    }}
                                />
                            </div>
                            <div className="col-12 mt-3">
                                <Input
                                    label="Language Code"
                                    name="languageCode"
                                    placeholder="Enter Language Code (e.g., en, hi)"
                                    value={languageCode}
                                    errorMessage={error.languageCode}
                                    onChange={(e: any) => {
                                        setLanguageCode(e.target.value);
                                        if (e.target.value) setError({ ...error, languageCode: "" });
                                    }}
                                    disabled={dialogueData}
                                />
                            </div>
                            <div className="col-12 mt-3">
                                <Input
                                    label="Localized Language Title"
                                    name="localLanguageTitle"
                                    placeholder="Enter Localized Language Title"
                                    value={localLanguageTitle}
                                    errorMessage={error.localLanguageTitle}
                                    onChange={(e: any) => {
                                        setLocalLanguageTitle(e.target.value);
                                        if (e.target.value) setError({ ...error, localLanguageTitle: "" });
                                    }}
                                />
                            </div>
                            <div className="col-12 mt-3">
                                <Input
                                    label="Language Icon"
                                    name="languageIcon"
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg , image/webp"
                                    errorMessage={error.languageIcon}
                                    onChange={handleImageChange}
                                />
                                <p className="mt-1" style={{ fontSize: "12px", color: "#a11919ff" }}>
                                    Supported formats: PNG, JPG, JPEG, WEBP
                                </p>
                                {imagePreview && (
                                    <div className="mt-2 text-center">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            style={{
                                                width: "80px",
                                                height: "80px",
                                                borderRadius: "10px",
                                                objectFit: "cover",
                                                border: "1px solid #ddd",
                                            }}
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = "/images/noImage.png";
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
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

export default LanguageDialogue;
