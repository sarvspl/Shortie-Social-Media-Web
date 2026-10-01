import React from "react";
import { Box, Modal } from "@mui/material";
import Button from "@/extra/Button";
import { useRouter } from "next/router";

const style: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    backgroundColor: "background.paper",
    borderRadius: "12px",
    border: "1px solid #C9C9C9",
    boxShadow: "24",
    outline: "none",
    padding: "20px",
};

interface NoLanguageModalProps {
    open: boolean;
}

const NoLanguageModal: React.FC<NoLanguageModalProps> = ({ open }) => {
    const router = useRouter();

    const handleRedirect = () => {
        router.push("/language");
    };

    return (
        <Modal
            open={open}
            aria-labelledby="no-language-modal-title"
            aria-describedby="no-language-modal-description"
            closeAfterTransition
            sx={{ backdropFilter: "blur(4px)" }}
        >
            <Box sx={style}>
                <div className="text-center">
                    <div className="mb-4">
                        <img
                            src="/images/noImage.png"
                            alt="Logo"
                            style={{ width: "60px", height: "60px" }}
                        />
                    </div>
                    <h3 id="no-language-modal-title" className="fw-bold mb-3" style={{ color: "#333" }}>
                        Action Required
                    </h3>
                    <p id="no-language-modal-description" className="text-secondary mb-4" style={{ fontSize: "16px" }}>
                        No languages have been added yet. Please add a language first to access the system modules.
                    </p>
                    <div className="d-flex justify-content-center">
                        <Button
                            onClick={handleRedirect}
                            btnName="Continue"
                            newClass="submit-btn"
                            style={{
                                borderRadius: "0.5rem",
                                padding: "10px 25px",
                                backgroundColor: "#A855F7",
                                color: "white",
                                fontWeight: "600",
                                border: "none",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                            }}
                        />
                    </div>
                </div>
            </Box>
        </Modal>
    );
};

export default NoLanguageModal;
