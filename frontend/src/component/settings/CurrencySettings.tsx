"use client";

import { useState, useEffect } from "react";
import styles from "../../styles/ReportReasons.module.css";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { getAllCurrency, deleteCurrency, setDefaultCurrency } from "@/store/currencySlice";
import { openDialog } from "@/store/dialogSlice";
import { permissionError, warning } from "@/util/Alert";
import CustomButton from "@/extra/Button";

import SettingsCard from "../ui/SettingsCard";
import Button from "../ui/button";
import Switch from "../ui/switch";
import dayjs from "dayjs";

import {
  DollarSign,
  Plus,
  Pencil,
  Trash2
} from "lucide-react";

import CurrencyDialogue from "../currency/CurrencyDialogue";
import { usePermission } from "@/hooks/usePermission";
import { IconEdit, IconTrash } from "@tabler/icons-react";

const CurrencySettings = () => {
  const dispatch = useAppDispatch();
  const { currency } = useSelector((state: RootStore) => state.currency);
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);

  const { can } = usePermission();
  const canEdit = can("Setting", "Edit");
  const canDelete = can("Setting", "Delete");
  const canCreate = can("Setting", "Create");

  const [currencies, setCurrencies] = useState<any[]>([]);

  useEffect(() => {
    dispatch(getAllCurrency());
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(currency)) {
      setCurrencies(currency);
    }
  }, [currency]);

  const handleDelete = (id: string) => {

    warning()
      .then((res) => {
        if (res) {
          dispatch(deleteCurrency(id as any));
        }
      })
      .catch((err) => console.log(err));
  };

  const handleAdd = () => {
    dispatch(openDialog({ type: "currency" }));
  };

  const handleEdit = (row: any) => {
    dispatch(openDialog({ type: "currency", data: row }));
  };

  const handleSetDefault = (row: any) => {

    dispatch(setDefaultCurrency(row?._id as any));
  };

  return (
    <div className={styles.wrapper}>
      {/* Dialogues */}
      {dialogueType === "currency" && <CurrencyDialogue />}

      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.title}>Currency Settings</h2>
          <p className={styles.subtitle}>
            Manage currencies and set default app currency
          </p>
        </div>

        {canCreate && (
          <Button className={styles.addBtn} onClick={handleAdd}>
            <Plus size={16} />
            Add Currency
          </Button>
        )}
      </div>

      <SettingsCard>
        {/* Table */}
        <div className={styles.tableResponsive}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Name</th>
                  <th>Symbol</th>
                  <th>Code</th>
                  <th>Country</th>
                  <th>Date</th>
                  <th>Default</th>
                  {(canEdit || canDelete) && (
                    <th className={styles.actionHead}>Actions</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {currencies.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={styles.emptyState}>
                      <p>No currencies found</p>
                    </td>
                  </tr>
                ) : (
                  currencies.map((curr, index) => (
                    <tr key={curr._id}>
                      <td>{index + 1}</td>
                      <td className={styles.reasonTitle}>{curr.name}</td>
                      <td>{curr.symbol}</td>
                      <td>{curr.currencyCode}</td>
                      <td>{curr.countryCode}</td>
                      <td>
                        {dayjs(curr.createdAt).format("DD MMMM YYYY , hh:mm A")}
                      </td>
                      <td>
                        <Switch
                          checked={curr.isDefault}
                          disabled={!canEdit}
                          onCheckedChange={() => handleSetDefault(curr)}
                        />
                      </td>
                      {(canEdit || canDelete) && (
                        <td>
                          <div className="action-button">
                            {canEdit && (
                              <CustomButton
                                btnIcon={<IconEdit className="text-secondary icon-class icon-class" />}
                                onClick={() => handleEdit(curr)}
                              />
                            )}
                            {canDelete && (
                              <CustomButton
                                btnIcon={<IconTrash className="text-secondary icon-class icon-class" />}
                                onClick={() => handleDelete(curr._id)}
                              />
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
};

export default CurrencySettings;
