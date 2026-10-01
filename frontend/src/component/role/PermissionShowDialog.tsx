import React from "react";
import { Box, Modal, Typography, IconButton, Grid, Paper, Chip, Divider } from "@mui/material";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { closeDialog } from "@/store/dialogSlice";
import CloseIcon from "@mui/icons-material/Close";
import {
    IconHome,
    IconUser,
    IconUserScan,
    IconShieldLock,
    IconUserShield,
    IconCards,
    IconGift,
    IconMoodTongueWink2,
    IconHash,
    IconMusic,
    IconBrowserShare,
    IconBrandStorybook,
    IconVideo,
    IconLivePhoto,
    IconCurrencyDollar,
    IconUserQuestion,
    IconCoins,
    IconHistory,
    IconLanguage,
    IconHelpOctagon,
    IconReport,
    IconSettings,
} from "@tabler/icons-react";

const modalBoxSx = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "calc(100vw - 16px)", sm: "calc(100vw - 48px)", md: 800 },
    maxWidth: "100vw",
    backgroundColor: "background.paper",
    borderRadius: "16px",
    boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
    maxHeight: "90vh",
    overflowY: "auto",
};

const MODULE_ICONS: { [key: string]: any } = {
    Dashboard: <IconHome />,
    User: <IconUser />,
    "Verification Request": <IconUserScan />,
    Role: <IconShieldLock />,
    Staff: <IconUserShield />,
    Banner: <IconCards />,
    Gift: <IconGift />,
    Reaction: <IconMoodTongueWink2 />,
    Hashtag: <IconHash />,
    Song: <IconMusic />,
    Post: <IconBrowserShare />,
    Story: <IconBrandStorybook />,
    Videos: <IconVideo />,
    "Live Video": <IconLivePhoto />,
    Currency: <IconCurrencyDollar />,
    "Withdraw Request": <IconUserQuestion />,
    "Coin Plan": <IconCoins />,
    "Order History": <IconHistory />,
    Language: <IconLanguage />,
    "Support Request": <IconHelpOctagon />,
    Report: <IconReport />,
    Setting: <IconSettings />,
};

const ACTION_COLORS: { [key: string]: any } = {
    List: { bg: "#eef7fe", text: "#3498db" },
    Create: { bg: "#edfcf2", text: "#27ae60" },
    Edit: { bg: "#fff7ed", text: "#f39c12" },
    Update: { bg: "#fff7ed", text: "#f39c12" },
    Delete: { bg: "#fff2f0", text: "#e74c3c" },
};

const PermissionShowDialog = () => {
    const { dialogue, dialogueData } = useSelector((state: RootStore) => state.dialogue);
    const dispatch = useAppDispatch();

    if (!dialogueData) return null;

    const handleClose = () => {
        dispatch(closeDialog());
    };

    return (
        <Modal open={dialogue} onClose={handleClose}>
            <Box sx={modalBoxSx}>
                <div className="" style={{ backgroundColor: "#fff", position: "sticky", top: 0, zIndex: 1, borderBottom: "1px solid #f0f0f0" , padding:"15px" }}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333" }}>
                            View Permissions
                        </Typography>
                        <IconButton onClick={handleClose} size="small" sx={{ color: "#333" }}>
                            <CloseIcon />
                        </IconButton>
                    </div>
                    <Typography variant="body2" sx={{ color: "#777" }}>
                        Role: {dialogueData.name}
                    </Typography>
                </div>

                <div className="p-3 p-sm-4 bg-light">
                    <Grid container spacing={3}>
                        {dialogueData.permissions?.map((perm: any, index: number) => {
                            // Deduplicate Edit/Update for display
                            const displayActions = Array.from(new Set(perm.actions.map((a: string) => a === "Update" ? "Edit" : a)));
                            const actionCount = displayActions.length;

                            return (
                                <Grid item xs={12} sm={6} key={index}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: "12px",
                                            border: "1px solid #eee",
                                            backgroundColor: "#fff",
                                            transition: "transform 0.2s",
                                            "&:hover": { transform: "translateY(-4px)" }
                                        }}
                                    >
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        p: 1.2,
                                                        borderRadius: "12px",
                                                        backgroundColor: "#fff0f0", // Subtle pink background
                                                        color: "#ff5a5f", // Theme pink color
                                                    }}
                                                >
                                                    {MODULE_ICONS[perm.module] || <IconHome />}
                                                </Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#333" }}>
                                                    {perm.module}
                                                </Typography>
                                            </div>
                                            <Box sx={{ backgroundColor: "#f5f5f5", px: 1.2, py: 0.4, borderRadius: "20px" }}>
                                                <Typography sx={{ fontSize: "11px", fontWeight: "bold", color: "#666" }}>
                                                    {actionCount} Actions
                                                </Typography>
                                            </Box>
                                        </div>

                                        <Divider sx={{ mb: 2, borderStyle: "dashed" }} />

                                        <div className="d-flex flex-wrap gap-2">
                                            {displayActions.map((action: any, aIndex: number) => {
                                                const colors = ACTION_COLORS[action] || { bg: "#f0f0f0", text: "#666" };
                                                return (
                                                    <Chip
                                                        key={aIndex}
                                                        label={action}
                                                        size="small"
                                                        sx={{
                                                            height: "24px",
                                                            backgroundColor: colors.bg,
                                                            color: colors.text,
                                                            fontWeight: "bold",
                                                            fontSize: "11px",
                                                            border: `1px solid ${colors.text}20`,
                                                            "& .MuiChip-label": { px: 1.5 }
                                                        }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </Paper>
                                </Grid>
                            );
                        })}
                    </Grid>
                </div>
            </Box>
        </Modal>
    );
};

export default PermissionShowDialog;
