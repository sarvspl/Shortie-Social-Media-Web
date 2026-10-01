import Button from "@/extra/Button";
import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import ToggleSwitch from "@/extra/ToggleSwitch";
import {
    deleteCurrency,
    getAllCurrency,
    setDefaultCurrency,
} from "@/store/currencySlice";
import { RootStore, useAppDispatch, useAppSelector } from "@/store/store";
import { usePermission } from "@/hooks/usePermission";
import { permissionError, warning } from "@/util/Alert";
import dayjs from "dayjs";
import NewTitle from "../../extra/Title";
import TrashIcon from "../../assets/icons/trashIcon.svg";
import EditIcon from "../../assets/icons/EditBtn.svg";
import React, { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { useSelector } from "react-redux";
import { openDialog } from "@/store/dialogSlice";
import CustomButton from "@/extra/Button";
import Image from "next/image";
import { IconEdit, IconTrash } from "@tabler/icons-react";

const CurrencyTable = () => {
    const { currency, totalCurrency } = useSelector(
        (state: RootStore) => state.currency,
    );

    const dispatch = useAppDispatch();
    const { can } = usePermission();

    const canCreate = can("Currency", "Create");
    const canEdit = can("Currency", "Edit");
    const canDelete = can("Currency", "Delete");
    const canList = can("Currency", "List");

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
        dispatch(getAllCurrency());
    }, [dispatch]);

    useEffect(() => {
        setData(currency);
    }, [currency]);

    const handleDeleteCurrency = (id: any) => {

        const data = warning();
        data
            .then((res) => {
                if (res) {
                    dispatch(deleteCurrency(id));
                }
            })
            .catch((err) => console.log(err));
    };

    const contactUsTable = [
        {
            Header: "NO",
            body: "name",
            Cell: ({ index }) => <span>{index + 1}</span>,
        },

        {
            Header: "Name",
            body: "name",
            Cell: ({ row }) => <span className="text-capitalize">{row?.name}</span>,
        },

        {
            Header: "Symbol",
            body: "symbol",
            Cell: ({ row }) => <span className="text-capitalize">{row?.symbol}</span>,
        },
        {
            Header: "Currency code",
            body: "currencyCode",
            Cell: ({ row }) => (
                <span className="text-capitalize">{row?.currencyCode}</span>
            ),
        },
        {
            Header: "Country code",
            body: "countryCode",
            Cell: ({ row }) => (
                <span className="text-capitalize">{row?.countryCode}</span>
            ),
        },
        ...(canEdit ? [
            {
                Header: "Is Default",
                body: "isActive",
                Cell: ({ row }) => (
                    <>
                        {canEdit && (
                            <ToggleSwitch
                                value={row?.isDefault}
                                disabled={row?.isDefault === true ? true : false}
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
                    {row?.createdAt ? dayjs(row?.createdAt).format("DD MMMM YYYY") : ""}
                </span>
            ),
        },
        ...(canEdit || canDelete ? [
            {
                Header: "Action",
                body: "action",
                Cell: ({ row }) => (
                    <div className="action-button">
                        {canEdit && (
                            <CustomButton
                                btnIcon={<IconEdit className="text-secondary icon-class" />}
                                onClick={() => handleOpenDialog("currency", row)}
                            />
                        )}
                        {canDelete && (
                            <CustomButton
                                btnIcon={<IconTrash className="text-secondary icon-class" />}
                                onClick={() => handleDeleteCurrency(row?._id)}
                            />
                        )}
                    </div>
                ),
            }] : []),
    ];

    const handleOpenDialog = (type: any, data = null) => {
        dispatch(openDialog({ type, data }));
    };

    const handleIsActive = (row: any) => {


        dispatch(setDefaultCurrency(row?._id));
    };

    return (
        <>
            <div className=" withdrawal-page">
                <div className=" user-table">
                    <div className="user-table-top currency-table-top">
                        <div className="w-100">
                            <h5
                                style={{
                                    fontWeight: "500",
                                    fontSize: "20px",
                                    marginTop: "5px",
                                    marginBottom: "4px",
                                }}
                            >
                                Currency
                            </h5>
                        </div>
                        {canCreate && (
                            <div className="col-12 col-sm-6 col-md-6 col-lg-6 mt-2 m-sm-0 new-fake-btn d-flex justify-content-end">
                                <Button
                                    btnIcon={<AddIcon />}
                                    btnName={"New"}
                                    onClick={() => handleOpenDialog("currency")}
                                />
                            </div>
                        )}
                    </div>
                    <>
                        <Table
                            data={data}
                            mapData={contactUsTable}
                            serverPerPage={size}
                            serverPage={page}
                            type={"server"}
                        />
                        <div className="">
                            <Pagination
                                type={"server"}
                                activePage={page}
                                rowsPerPage={size}
                                userTotal={totalCurrency}
                                setPage={setPage}
                                // setData={setData}
                                // data={data}
                                actionShow={false}
                                handleRowsPerPage={handleRowsPerPage}
                                handlePageChange={handlePageChange}
                            />
                        </div>
                    </>
                </div>
            </div>
        </>
    );
};

export default CurrencyTable;
