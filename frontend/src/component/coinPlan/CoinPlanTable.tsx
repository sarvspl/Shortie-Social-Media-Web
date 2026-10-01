import Button from "@/extra/Button";
import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import ToggleSwitch from "@/extra/ToggleSwitch";
import {
  activeCoinPlan,
  deleteCoinPlan,
  getAllCoinPlan,
} from "@/store/coinPlanSlice";
import { openDialog } from "@/store/dialogSlice";
import { usePermission } from "@/hooks/usePermission";
import { RootStore, useAppDispatch, useAppSelector } from "@/store/store";
import dayjs from "dayjs";
import NewTitle from "../../extra/Title";
import Image from "next/image";
import EditIcon from "../../assets/icons/EditBtn.svg";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CustomButton from "@/extra/Button";
import AddIcon from "@mui/icons-material/Add";
import { baseURL } from "@/util/config";
import { IconEdit } from "@tabler/icons-react";
import { permissionError } from "@/util/Alert";
import NoImage from "../../assets/images/hashtagbanner.png";
import { getDefaultCurrency } from "@/store/currencySlice";


const CoinPlanTable = () => {
  const { dialogue, dialogueType, dialogueData } = useAppSelector(
    (state: RootStore) => state.dialogue,
  );



  const { coinPlan, totalCoin } = useSelector(
    (state: RootStore) => state.coinPlan,
  );

  const { currency } = useSelector((state: any) => state.currency);

  const dispatch = useAppDispatch();
  const { can } = usePermission();

  const canCreate = can("Coin Plan", "Create");
  const canEdit = can("Coin Plan", "Edit");
  const canDelete = can("Coin Plan", "Delete");
  const canList = can("Coin Plan", "List");

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const handlePageChange = (pageNumber: number) => {
    setPage(pageNumber);
  };

  const handleRowsPerPage = (value: number) => {
    setPage(1);
    setSize(value);
  };

  useEffect(() => {
    dispatch(getAllCoinPlan({ start: page, limit: size }));
  }, [dispatch, page, size]);

  useEffect(() => {
    dispatch(getDefaultCurrency());
  }, []);

  useEffect(() => {
    setData(coinPlan);
  }, [coinPlan]);

  const coinPlanTable = [
    {
      Header: "NO",
      body: "name",
      Cell: ({ index }) => <span>{(page - 1) * size + index + 1}</span>,
    },

    {
      Header: "Icon",
      body: "icon",
      Cell: ({ row }) => (
        <img
          src={row?.icon}
          width="50px"
          height="50px"
          onError={(e) => {
            e.currentTarget.src = "/images/user.png";
          }}
        />
      ),
    },
    {
      Header: "Coin",
      body: "coin",
      Cell: ({ row }) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingLeft: "25%",
            gap: "5px",
          }}
        >
          <img src="/images/coin.png" width="18px" height="18px" />

          <span className="text-capitalize">{row?.coin}</span>
        </div>
      ),
    },

    {
      Header: `Amount (${currency?.symbol})`,
      body: "amount",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {`${row?.amount.toFixed(2)}`} {currency?.symbol}
        </span>
      ),
    },
    {
      Header: "Product key",
      body: "productKey",
      Cell: ({ row }) => (
        <span className="">{row?.productKey ? row?.productKey : "-"}</span>
      ),
    },

    ...(canEdit ? [
      {
        Header: "Is Active",
        body: "isActive",
        Cell: ({ row }) => (
          <>
            {canEdit && (
              <ToggleSwitch
                value={row?.isActive}
                onChange={() => handleIsActive(row)}
              />
            )}
          </>
        ),
      }] : []),
    {
      Header: "Created date",
      body: "createdAt",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.createdAt ? dayjs(row?.createdAt).format("DD MMMM YYYY , hh:mm A") : ""}
        </span>
      ),
    },
    ...(canEdit ? [
      {
        Header: "Action",
        body: "action",
        Cell: ({ row }) => (
          <div className="action-button">
            {canEdit && (
              <CustomButton
                btnIcon={<IconEdit className="text-secondary icon-class icon-class" />}
                onClick={() => handleEditCoinPlan(row)}
              />
            )}
          </div>
        ),
      }] : []),
  ];

  const handleOpenNew = (type: any) => {
    dispatch(openDialog({ type: "coinPlan" }));

    let dialogueData_ = {
      dialogue: true,
      type: type,
    };
    localStorage.setItem("dialogueData", JSON.stringify(dialogueData_));
  };

  const handleEditCoinPlan = (data: any) => {
    dispatch(openDialog({ type: "coinPlan", data: data }));
  };

  const handleIsActive = (row: any) => {


    let payload: any = {
      coinPlanId: row?._id,
    };
    dispatch(activeCoinPlan(payload));
  };
  return (
    <div className=" withdrawal-page">
      <div className=" user-table">
        <div className="user-table-top coinplan-table-top d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            <h5
              style={{
                fontWeight: "500",
                fontSize: "20px",
                marginTop: "5px",
                marginBottom: "4px",
              }}
            >
              Coin Plan
            </h5>
          </div>
          <div className="new-fake-btn">
            {canCreate && (
              <Button
                btnIcon={<AddIcon />}
                btnName={"New"}
                onClick={() => handleOpenNew("coinPlan")}
              />
            )}
          </div>
        </div>
        <div className="">
          <Table
            data={data}
            mapData={coinPlanTable}
            serverPerPage={size}
            serverPage={page}
            type={"server"}
          />
          <div className="">
            <Pagination
              type={"server"}
              activePage={page}
              rowsPerPage={size}
              userTotal={totalCoin}
              setPage={setPage}
              // setData={setData}
              // data={data}
              actionShow={false}
              handleRowsPerPage={handleRowsPerPage}
              handlePageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinPlanTable;
