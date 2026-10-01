import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    Box,
    Modal,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    FormControlLabel,
    IconButton,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { closeDialog } from "@/store/dialogSlice";
import { createRole, editRole, fetchRoles } from "@/store/roleSlice";
import Button from "@/extra/Button";
import Input from "@/extra/Input";
import { permissionError } from "@/util/Alert";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
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
    borderRadius: "12px",
    boxShadow: "24px",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: "0px",
};

const ACTIONS = ["List", "Create", "Edit", "Delete"];

const MODULE_ICONS: { [key: string]: any } = {
    Dashboard: <IconHome size={20} />,
    User: <IconUser size={20} />,
    "Verification Request": <IconUserScan size={20} />,
    Role: <IconShieldLock size={20} />,
    Staff: <IconUserShield size={20} />,
    Banner: <IconCards size={20} />,
    Gift: <IconGift size={20} />,
    Reaction: <IconMoodTongueWink2 size={20} />,
    Hashtag: <IconHash size={20} />,
    Song: <IconMusic size={20} />,
    Post: <IconBrowserShare size={20} />,
    Story: <IconBrandStorybook size={20} />,
    Videos: <IconVideo size={20} />,
    "Live Video": <IconLivePhoto size={20} />,
    // Currency: <IconCurrencyDollar size={20} />,
    "Withdraw Request": <IconUserQuestion size={20} />,
    "Coin Plan": <IconCoins size={20} />,
    "Order History": <IconHistory size={20} />,
    Language: <IconLanguage size={20} />,
    "Support Request": <IconHelpOctagon size={20} />,
    Report: <IconReport size={20} />,
    Setting: <IconSettings size={20} />,
};

const SECTIONS = [
    {
        name: "USER MANAGEMENT",
        modules: ["User", "Verification Request"],
    },
    // {
    //     name: "STAFF MANAGEMENT",
    //     modules: ["Role", "Staff"],
    // },
    {
        name: "CONTENT MANAGEMENT",
        modules: ["Banner", "Gift", "Reaction", "Hashtag"],
    },
    {
        name: "SOCIAL MEDIA",
        modules: ["Song", "Post", "Story", "Videos", "Live Video"],
    },
    {
        name: "FINANCE",
        // modules: ["Currency", "Withdraw Request"],
        modules: ["Withdraw Request"],
    },
    {
        name: "PACKAGE MANAGEMENT",
        modules: ["Coin Plan", "Order History"],
    },
    {
        name: "LANGUAGE MANAGEMENT",
        modules: ["Language"],
    },
    {
        name: "REPORTS & REQUESTS",
        modules: ["Support Request", "Report"],
    },

    // {
    //     name: "SYSTEM",
    //     modules: ["Setting"],
    // },
];

const ALL_MODULES = SECTIONS.flatMap((s) => s.modules);

const RoleDialogue = () => {
    const { dialogue, dialogueData, dialogueType } = useSelector((state: RootStore) => state.dialogue);


    const dispatch = useAppDispatch();
    const [name, setName] = useState("");
    const [initialName, setInitialName] = useState("");
    const [errors, setErrors] = useState({ name: "" });

    const emptyRow = useCallback(() => ({ List: false, Create: false, Edit: false, Delete: false }), []);

    const [perms, setPerms] = useState<{ [key: string]: any }>({});
    const [initialPerms, setInitialPerms] = useState<{ [key: string]: any }>({});

    useEffect(() => {
        const base: any = {};
        ALL_MODULES.forEach((m) => {
            base[m] = emptyRow();
        });

        if (dialogueData && dialogueData.permissions) {
            dialogueData.permissions.forEach((p: any) => {
                if (base[p.module]) {
                    p.actions.forEach((a: string) => {
                        // Internally, Edit and Update are the same for the UI "Edit" checkbox
                        if (a === "Edit" || a === "Update") {
                            base[p.module]["Edit"] = true;
                        } else if (base[p.module][a] !== undefined) {
                            base[p.module][a] = true;
                        }
                    });
                }
            });
            setName(dialogueData.name || "");
            setInitialName(dialogueData.name || "");
        } else {
            setName("");
            setInitialName("");
        }
        setPerms(base);
        setInitialPerms(JSON.parse(JSON.stringify(base)));
        setErrors({ name: "" });
    }, [dialogueData, emptyRow]);

    const toggleAction = (module: string, action: string) => {
        setPerms((prev) => ({
            ...prev,
            [module]: { ...prev[module], [action]: !prev[module][action] },
        }));
    };

    const toggleRowAll = (module: string, value: boolean) => {
        const nextRow: any = {};
        ACTIONS.forEach((a) => (nextRow[a] = value));
        setPerms((prev) => ({
            ...prev,
            [module]: nextRow,
        }));
    };

    const toggleSectionAll = (sectionModules: string[], value: boolean) => {
        setPerms((prev) => {
            const nextPerms = { ...prev };
            sectionModules.forEach((m) => {
                const nextRow: any = {};
                ACTIONS.forEach((a) => (nextRow[a] = value));
                nextPerms[m] = nextRow;
            });
            return nextPerms;
        });
    };

    const activeModulesCount = useMemo(() => {
        return Object.values(perms).filter((p: any) => Object.values(p).some((v) => v)).length;
    }, [perms]);

    const handleClose = () => {
        dispatch(closeDialog());
    };

    const handleSubmit = async () => {

        if (!name.trim()) {
            setErrors({ name: "Role Name is required" });
            return;
        }

        if (activeModulesCount === 0) {
            toast.error("At least one permission must be selected");
            return;
        }

        const permissionsArray = Object.entries(perms)
            .map(([module, actionsObj]) => {
                const actions: string[] = [];
                if (actionsObj.List) actions.push("List");
                if (actionsObj.Create) actions.push("Create");
                if (actionsObj.Edit) actions.push("Edit");
                if (actionsObj.Delete) actions.push("Delete");

                if (actions.length === 0) return null;
                return { module, actions };
            })
            .filter(Boolean);

        if (dialogueType === "editRole") {
            const hasNameChanged = name.trim() !== initialName.trim();
            const hasPermsChanged = JSON.stringify(perms) !== JSON.stringify(initialPerms);

            if (!hasNameChanged && !hasPermsChanged) {
                toast.info("No changes made");
                dispatch(closeDialog());
                return;
            }

            const payload: any = { roleId: dialogueData._id };
            if (hasNameChanged) payload.name = name.trim();
            if (hasPermsChanged) payload.permissions = permissionsArray;

            await dispatch(editRole(payload)).unwrap();
        } else {
            const payload: any = {
                name: name.trim(),
                permissions: permissionsArray,
            };
            await dispatch(createRole(payload)).unwrap();
        }

        dispatch(fetchRoles({ start: 1, limit: 20 }));
        dispatch(closeDialog());
    };

    return (
        <Modal open={dialogue} onClose={handleClose}>
            <Box sx={modalBoxSx}>
                <div className="model-header d-flex justify-content-between align-items-center" style={{ padding: "15px 20px", borderBottom: "1px solid #f0f0f0" }}>
                    <div>
                        <h5 className="m-0 fw-bold">{dialogueType === "editRole" ? "Edit Role" : "Create Role"}</h5>
                        <p className="m-0 text-muted" style={{ fontSize: "13px" }}>
                            This role has access to {activeModulesCount} modules with various permission levels.
                        </p>
                    </div>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </div>

                <div className="model-body" style={{ padding: "20px" }}>
                    <div className="mb-4">
                        <Input
                            label="Role Name"
                            placeholder="Enter Role Name"
                            value={name}
                            errorMessage={errors.name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setErrors({ name: "" });
                            }}
                        />
                    </div>

                    {SECTIONS.map((section) => {
                        const isSectionAllChecked = section.modules.every((m) => ACTIONS.every((a) => perms[m]?.[a]));

                        return (
                            <div key={section.name} className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#666" }}>
                                        {section.name}
                                    </Typography>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={isSectionAllChecked}
                                                onChange={(e) => toggleSectionAll(section.modules, e.target.checked)}
                                            />
                                        }
                                        label={<Typography sx={{ fontSize: "12px", color: "#666" }}>Grant all in section</Typography>}
                                        labelPlacement="start"
                                    />
                                </div>

                                <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: "8px", overflow: "hidden" }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: "#fafafa" }}>
                                                <TableCell sx={{ fontWeight: "bold", py: 1.5 }}>Module</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: "bold" }}>All</TableCell>
                                                {ACTIONS.map((a) => (
                                                    <TableCell key={a} align="center" sx={{ fontWeight: "bold" }}>{a}</TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {section.modules.map((m) => {
                                                const row = perms[m] || emptyRow();
                                                const isModuleAllChecked = ACTIONS.every((a) => row[a]);
                                                return (
                                                    <TableRow key={m} hover>
                                                        <TableCell sx={{ py: 1.5 }}>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <Box sx={{ display: "flex", p: 0.8, borderRadius: "8px", backgroundColor: "#f0f2f5", color: "#666" }}>
                                                                    {MODULE_ICONS[m] || <IconHome size={20} />}
                                                                </Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>{m}</Typography>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Checkbox
                                                                size="small"
                                                                checked={isModuleAllChecked}
                                                                onChange={(e) => toggleRowAll(m, e.target.checked)}
                                                            />
                                                        </TableCell>
                                                        {ACTIONS.map((a) => (
                                                            <TableCell key={a} align="center">
                                                                <Checkbox
                                                                    size="small"
                                                                    checked={row[a] || false}
                                                                    onChange={() => toggleAction(m, a)}
                                                                />
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </div>
                        );
                    })}
                </div>

                <div className="model-footer d-flex justify-content-end p-3 gap-2" style={{ borderTop: "1px solid #f0f0f0" }}>
                    <Button onClick={handleClose} btnName={"Close"} newClass={"btn-light border text-dark"} style={{ height: "40px", borderRadius: "8px", padding: "0 25px" }} />
                    <Button onClick={handleSubmit} btnName={dialogueType === "editRole" ? "Update" : "Create"} newClass={"submit-btn"} style={{ height: "40px", borderRadius: "8px", padding: "0 25px" }} />
                </div>
            </Box>
        </Modal>
    );
};

export default RoleDialogue;
