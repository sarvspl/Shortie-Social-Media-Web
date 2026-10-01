import BannerDialogue from "@/component/banner/BannerDialogue";
import BannerImageDialog from "@/component/banner/BannerImageDialog";
import RootLayout from "@/component/layout/Layout";
import Button from "@/extra/Button";
import Pagination from "@/extra/Pagination";
import TrashIcon from "../assets/icons/trashIcon.svg";
import EditIcon from "../assets/icons/EditBtn.svg";
import Table from "@/extra/Table";
import Title from "@/extra/Title";
import ToggleSwitch from "@/extra/ToggleSwitch";
import { activeBanner, deleteBanner, getBanner } from "@/store/bannerSlice";
import { openDialog } from "@/store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { permissionError, warning } from "@/util/Alert";
import { baseURL } from "@/util/config";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AddIcon from "@mui/icons-material/Add";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import NoImage from "../assets/images/noImage.png";
import { usePermission } from "@/hooks/usePermission";

interface BannerData {
  _id: string;
  image: string;
  isActive: false;
}

const Banner = () => {
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);

  const { banner, totalBanner } = useSelector(
    (state: RootStore) => state.banner,
  );

  const dispatch = useAppDispatch();
  const { can } = usePermission();

  const canCreate = can("Banner", "Create");
  const canEdit = can("Banner", "Edit");
  const canDelete = can("Banner", "Delete");
  const canList = can("Banner", "List");

  const [data, setData] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [page, setPage] = useState<any>(1);
  const [size, setSize] = useState(10);

  const handlePageChange = (pageNumber: number) => {
    setPage(pageNumber);
  };

  const handleRowsPerPage = (value: number) => {
    setPage(1);
    setSize(value);
  };



  useEffect(() => {
    dispatch(getBanner());
  }, [dispatch]);

  useEffect(() => {
    setData(banner);
  }, [banner]);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleDeleteBanner = (row: any) => {

    const data = warning();
    data
      .then((res) => {
        if (res) {
          dispatch(deleteBanner(row?._id));
        }
      })
      .catch((err) => console.log(err));
  };

  const handleOpenDialog = (type: string, data: any = null) => {
    dispatch(openDialog({ type, data }));
  };

  const bannerTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span>{page * parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Banner Image",
      Cell: ({ row, index }: { row: BannerData; index: number }) => (
        <div className="userProfile">
          <img
            src={row?.image}
            style={{ height: "75px", width: "150px", borderRadius: "8px", cursor: "pointer", objectFit: "cover" }}
            alt={`Banner`}
            onClick={() => handleOpenDialog("bannerImage", row?.image)}
            onError={(e) => {
              e.currentTarget.src = "/images/user.png";
            }}
          />
        </div>
      ),
    },

    ...(canEdit ? [{
      Header: "Active Status",
      body: "isActive",
      sorting: { type: "client" },
      Cell: ({ row }: { row: BannerData }) => (
        <>
          <ToggleSwitch
            value={row?.isActive}
            onClick={() => {

              const id: any = row?._id;
              dispatch(activeBanner(id));
            }}
          />
        </>
      ),
    }] : []),

    ...(canEdit || canDelete
      ? [
        {
          Header: "Action",
          Cell: ({ row }: { row: BannerData }) => (
            <>
              <div className="action-button">
                {canEdit && (
                  <Button
                    btnIcon={<IconEdit className="text-secondary icon-class" />}
                    onClick={() => {
                      handleOpenDialog("editbanner", row);
                    }}
                  />
                )}

                {canDelete && (
                  <Button
                    btnIcon={<IconTrash className="text-secondary icon-class" />}
                    onClick={() => handleDeleteBanner(row)}
                  />
                )}
              </div>
            </>
          ),
        },
      ]
      : []),
  ];

  return (
    <>
      {dialogueType === "banner" && <BannerDialogue />}
      {dialogueType === "editbanner" && <BannerDialogue />}
      {dialogueType === "bannerImage" && <BannerImageDialog />}

      <div className="userPage">
        <div className="user-table real-user banner-table mb-3">
          <div className="user-table-top banner-table-top mb-3">
            <div>
              <h5
                style={{
                  fontWeight: "500",
                  fontSize: "20px",
                  marginTop: "5px",
                  marginBottom: "4px",
                }}
              >
                Recharge Banner
              </h5>
            </div>
            <div className="new-fake-btn">
              {canCreate && (
                <Button
                  btnIcon={<AddIcon />}
                  btnName={"New"}
                  onClick={() => handleOpenDialog("banner")}
                />
              )}
            </div>
          </div>
          <Table
            data={data}
            mapData={bannerTable}
            serverPerPage={size}
            serverPage={page}
            type={"server"}
          />
          <Pagination
            type={"server"}
            activePage={page}
            rowsPerPage={size}
            userTotal={totalBanner}
            setPage={setPage}
            // setData={setData}
            // data={data}
            actionShow={false}
            handleRowsPerPage={handleRowsPerPage}
            handlePageChange={handlePageChange}
          />
        </div>
      </div>
    </>
  );
};
Banner.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};
export default Banner;
