import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import TrashIcon from "../../assets/icons/trashIcon.svg";
import EditIcon from "../../assets/icons/EditBtn.svg";
import Pagination from "../../extra/Pagination";
import Button from "../../extra/Button";
import Table from "../../extra/Table";
import dayjs from "dayjs";
import { openDialog } from "../../store/dialogSlice";
import { permissionError, warning } from "../../util/Alert";
import { deleteFakeVideo } from "../../store/videoSlice";
import { RootStore, useAppDispatch } from "../../store/store";
import Image from "next/image";
import { useRouter } from "next/router";
import { usePermission } from "@/hooks/usePermission";
import { baseURL } from "@/util/config";
import useClearSessionStorageOnPopState from "@/extra/ClearStorage";
import VideoDialogue from "./StoryDialogue";
import FakeVideo from "./FakeStory";
import CreateFakeVideo from "./CreateFakeStory";
import {
    IconEdit,
    IconEye,
    IconTrash,
    IconVideo,
    IconCopy,
} from "@tabler/icons-react";
import { allStory, deleteFakeStory } from "@/store/storySlice";
import ReactAudioPlayer from "react-audio-player";
import NoImage from "../../assets/images/user.png";
import Searching from "@/extra/Searching";
import { toast } from "react-toastify";

interface VideoProps {
    startDate: string;
    endDate: string;
}

const Story: React.FC<VideoProps> = (props) => {
    const router = useRouter();
    const { realStory, totalRealStory } = useSelector(
        (state: RootStore) => state.story,
    );
    const { dialogueType, dialogueData } = useSelector(
        (state: RootStore) => state.dialogue,
    );

    const { can } = usePermission();

    const canEdit = can("Story", "Edit");
    const canDelete = can("Story", "Delete");
    const canList = can("Story", "List");

    const [selectAllChecked, setSelectAllChecked] = useState<boolean>(false);
    const [selectCheckData, setSelectCheckData] = useState<any[]>([]);
    const dispatch = useAppDispatch();
    const [data, setData] = useState<any[]>([]);
    const [page, setPage] = useState<number>(1);
    const [size, setSize] = useState<number>(10);
    const [search, setSearch] = useState<string>("");

    useClearSessionStorageOnPopState("multiButton");
    const { startDate, endDate } = props;



    useEffect(() => {
        const payload: any = {
            includeFake: false,
            start: page,
            limit: size,
            startDate: startDate,
            endDate: endDate,
            search: search ?? "",
        };
        dispatch(allStory(payload));
    }, [page, size, startDate, endDate, search]);

    useEffect(() => {
        setData(realStory);
    }, [realStory]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const handleSelectCheckData = (
        e: React.ChangeEvent<HTMLInputElement>,
        row: any,
    ) => {
        const checked = e.target.checked;
        if (checked) {
            setSelectCheckData((prevSelectedRows) => [...prevSelectedRows, row]);
        } else {
            setSelectCheckData((prevSelectedRows) =>
                prevSelectedRows.filter((selectedRow) => selectedRow._id !== row._id),
            );
        }
    };

    const handleDeleteStory = (row: any) => {

        const data = warning();
        data
            .then((logouts: any) => {
                if (logouts) {
                    dispatch(
                        deleteFakeStory({ storyId: row?._id, userId: row?.user._id }),
                    );
                    console.log(row);
                }
            })
            .catch((err: any) => console.log(err));
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setSelectAllChecked(checked);
        if (checked) {
            setSelectCheckData([...data]);
        } else {
            setSelectCheckData([]);
        }
    };

    const handleEdit = (row: any) => {
        router.push({
            pathname: "/viewProfile",
            query: { id: row?.user?._id, type: "ViewFakeUser", includeFake: false }, // Include fake stories in the query
        });

        localStorage.setItem("postData", JSON.stringify(row));
    };

    const copyToClipboard = (Text: any) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(Text).then(() => {
                toast.success("Copied to clipboard");
            }).catch(() => {
                fallbackCopy(Text);
            });
        } else {
            fallbackCopy(Text);
        }
    };

    const fallbackCopy = (text: any) => {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand("copy");
            toast.success("Copied to clipboard");
        } catch (err) {
            toast.error("Failed to copy");
        }
        document.body.removeChild(textarea);
    };

    const videoTable = [
        {
            Header: "NO",
            body: "name",
            Cell: ({ index }: { index: number }) => (
                <span>{(page - 1) * size + index + 1}</span>
            ),
        },
        {
            Header: "User",
            body: "name",
            Cell: ({ row }: { row: any }) => (
                <>
                    <div
                        className="text-capitalize userText fw-bold d-flex align-items-center"
                        style={{
                            cursor: "pointer",
                        }}
                        onClick={() => handleEdit(row)}
                    >
                        <img
                            src={row?.user?.image}
                            onError={(e) => {
                                e.currentTarget.src = "/images/user.png";
                            }}
                            width="50px"
                            height="50px"
                            style={{ marginRight: "10px" }}
                        />
                        <div className="text-start">
                            <div
                                className="text-capitalize userText"
                                style={{ color: "#5f6870", fontWeight: 400, cursor: "pointer", textAlign: "start" }}
                            >
                                {row?.user?.name}
                                <IconCopy
                                    size={16}
                                    className="ms-1"
                                    style={{ cursor: "pointer" }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(row?.user?.name);
                                    }}
                                />
                            </div>
                            <div
                                className="text-capitalize userText"
                                style={{ color: "#5f6870", fontWeight: 400, cursor: "pointer", textAlign: "start" }}
                            >
                                {row?.user?.userName}
                                <IconCopy
                                    size={16}
                                    className="ms-1"
                                    style={{ cursor: "pointer" }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(row?.user?.userName);
                                    }}
                                />
                            </div>
                            <div
                                className="text-capitalize userText "
                                style={{ color: "#495057", fontWeight: 400, cursor: "pointer", textAlign: "start" }}
                            >
                                {row?.user?.uniqueId}
                                <IconCopy
                                    size={16}
                                    className="ms-1"
                                    style={{ cursor: "pointer" }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(row?.user?.uniqueId);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </>
            ),
        },
        {
            Header: "Story Type",
            body: "storyType",
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize">
                    {row?.storyType == 1 ? "Image" : "Video"}
                </span>
            ),
        },
        {
            Header: "View Count",
            body: "viewsCount",
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize">
                    {row?.viewsCount ? row?.viewsCount : 0}
                </span>
            ),
        },
        {
            Header: "Reaction Count",
            body: "totalLikes",
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize">
                    {row?.reactionsCount ? row?.reactionsCount : 0}
                </span>
            ),
        },
        {
            Header: "Date",
            body: "createdAt",
            Cell: ({ row }: { row: any }) => (
                <span className="text-capitalize">
                    {row?.createdAt ? dayjs(row?.createdAt).format("DD MMMM YYYY , hh:mm A") : ""}
                </span>
            ),
        },
        ...(canList || canDelete ? [
            {
                Header: "Action",
                body: "action",
                Cell: ({ row }: { row: any }) => (
                    <div className="action-button">
                        {canList && (
                            <Button
                                btnIcon={<IconEye className="text-secondary icon-class" />}
                                onClick={() => {
                                    dispatch(openDialog({ type: "viewStory", data: row }));
                                }}
                            />
                        )}
                        {canDelete && (
                            <div className="action-button">
                                <Button
                                    btnIcon={<IconTrash className="text-secondary icon-class" />}
                                    onClick={() => handleDeleteStory(row)}
                                />
                            </div>
                        )}
                    </div>
                ),
            }] : []),
    ];

    const handlePageChange = (pageNumber: number) => {
        setPage(pageNumber);
    };

    const handleRowsPerPage = (value: number) => {
        setPage(1);
        setSize(value);
    };

    const handleDeleteVideo = (row: any) => {

        const data = warning();
        data
            .then((logouts: any) => {
                const yes = logouts;
                if (yes) {
                    dispatch(deleteFakeStory({ storyId: row?._id, userId: row?.userId }));
                }
            })
            .catch((err) => console.log(err));
    };

    return (
        <div>
            <div className="user-table mb-3">
                {dialogueType == "viewStory" && <VideoDialogue />}
                {dialogueType == "fakeStory" && <CreateFakeVideo />}

                <div className="user-table-top story-table-top">
                    <div className="d-flex flex-column flex-md-row justify-content-between w-100 align-items-start align-items-md-center gap-3">
                        <h5
                            className="text-nowrap"
                            style={{
                                fontWeight: "500",
                                fontSize: "20px",
                                marginTop: "5px",
                                marginBottom: "4px",
                            }}
                        >
                            Story
                        </h5>
                        <div className="d-flex flex-column flex-sm-row gap-3 w-100 w-sm-auto justify-content-sm-end align-items-stretch align-items-sm-center">
                            <div className="mobile-search-width" style={{ width: "300px" }}>
                                <Searching
                                    placeholder="Search by Name, Username..."
                                    type="server"
                                    setSearchData={setSearch}
                                    searchValue={search}
                                    actionShow={false}
                                    button={false}
                                    newClass=""
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <Table
                    data={data}
                    mapData={videoTable}
                    serverPerPage={size}
                    serverPage={page}
                    handleSelectAll={handleSelectAll}
                    selectAllChecked={selectAllChecked}
                    type={"server"}
                />
                <div className="mt-3">
                    <Pagination
                        type={"server"}
                        activePage={page}
                        rowsPerPage={size}
                        userTotal={totalRealStory}
                        setPage={setPage}
                        handleRowsPerPage={handleRowsPerPage}
                        handlePageChange={handlePageChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default Story;
