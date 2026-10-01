"use client";

import { useState, useEffect } from "react";
import styles from "../../styles/WithdrawSettings.module.css";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { getSetting, getWithdrawMethod, updateSetting, activeWithdrawMethod } from "@/store/settingSlice";
import { openDialog } from "@/store/dialogSlice";
import { permissionError } from "@/util/Alert";
import { setToast } from "@/util/toastServices";
import CustomButton from "@/extra/Button";

import SettingsCard from "../ui/SettingsCard";
import FormField from "../ui/FormField";
import Button from "../ui/button";
import Switch from "../ui/switch";

import { Wallet, Coins, DollarSign, Pencil } from "lucide-react";
import AddWithdrawDialogue from "../setting/AddWithdrawDialogue";
import dayjs from "dayjs";
import { usePermission } from "@/hooks/usePermission";
import { IconEdit } from "@tabler/icons-react";
import { withdrawContent } from "@/extra/infoContent";

const WithdrawSettings = () => {
  const dispatch = useAppDispatch();
  const { settingData, withdrawSetting } = useSelector((state: RootStore) => state.setting);
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);

  const { can } = usePermission();
  const canEdit = can("Setting", "Edit");
  const canDelete = can("Setting", "Delete");
  const canCreate = can("Setting", "Create");

  const [minWithdraw, setMinWithdraw] = useState("");
  const [methods, setMethods] = useState<any[]>([]);

  useEffect(() => {
    dispatch(getWithdrawMethod());
    dispatch(getSetting({} as any));
  }, [dispatch]);

  useEffect(() => {
    if (settingData?.minWithdrawalRequestedCoin) {
      setMinWithdrawalRequestedCoin(settingData.minWithdrawalRequestedCoin.toString());
    }
  }, [settingData]);

  useEffect(() => {
    setMethods(withdrawSetting || []);
  }, [withdrawSetting]);

  // Use this for the input field to avoid freezing standard state
  const [minWithdrawalRequestedCoin, setMinWithdrawalRequestedCoin] = useState("");

  const handleSaveMinCoin = () => {


    const minWithdrawalValue = parseInt(minWithdrawalRequestedCoin);
    if (!minWithdrawalValue || minWithdrawalValue <= 0) {
      setToast("error", "Amount Invalid or Required!");
      return;
    }

    const payload: any = {
      settingId: settingData?._id,
      data: { minWithdrawalRequestedCoin: minWithdrawalValue },
    };
    dispatch(updateSetting(payload as any));
  };

  const toggleMethod = (row: any) => {

    dispatch(activeWithdrawMethod(row?._id));
  };

  const handleAddMethod = () => {
    dispatch(openDialog({ type: "withdraw" }));
  };

  const handleEditMethod = (row: any) => {
    dispatch(openDialog({ type: "withdraw", data: row }));
  };

  return (
    <div className={styles.wrapper}>
      {/* Dialog */}
      {dialogueType === "withdraw" && <AddWithdrawDialogue />}

      {/* Minimum Withdrawal */}
      <div>
        <SettingsCard
          title="Minimum Withdrawal"
          description="Set minimum coins required"
          icon={<Wallet size={18} />}
          tooltipTitle="Minimum Withdrawal Setting"
          tooltipContent={withdrawContent}
        >
          <FormField
            label="Minimum Coins"
            name="minWithdraw"
            type="number"
            value={minWithdrawalRequestedCoin}
            placeholder="Minimum Coins"
            onChange={(e) => setMinWithdrawalRequestedCoin(e.target.value)}
            icon={<Coins size={16} />}
          />
          {canEdit && (
            <div className="mt-3">
              <Button size="sm" onClick={handleSaveMinCoin}>Update Limit</Button>
            </div>
          )}
        </SettingsCard>

        {/* <div className={styles.rateCard}>
          <h3 className={styles.rateTitle}>
            <DollarSign size={18} />
            Conversion Rate
          </h3>

          <div className={styles.rateBox}>
            <p>
              Current rate:
              <strong> 100 coins = $1 USD</strong>
            </p>
          </div>

          <div className={styles.rateBox}>
            <p>
              Minimum withdrawal:
              <strong>
                {" "}
                {minWithdrawalRequestedCoin || 0} coins = $
                {((parseInt(minWithdrawalRequestedCoin) || 0) / 100).toFixed(2)}
              </strong>
            </p>
          </div>
        </div> */}
      </div>

      {/* Withdraw Methods */}
      <div className={styles.methodSection}>
        <div className={styles.methodHeader}>
          <div className={styles.titleArea}>
            <h2>Withdraw Payment Method</h2>
          </div>

          {canCreate && (
            <Button size="sm" onClick={handleAddMethod} className={styles.addBtn}>New</Button>
          )}
        </div>

        <div className={styles.tableResponsive}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Details</th>
                  <th>Date</th>
                  <th>Active</th>
                  {canEdit && (
                    <th>Action</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {methods.map((method, index) => (
                  <tr key={method._id}>
                    <td>{index + 1}</td>

                    <td>
                      <div className={styles.iconBox} style={{ overflow: "hidden", padding: 0 }}>
                        {method.image ? (
                          <img
                            src={method.image}
                            alt={method.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    </td>

                    <td className={styles.methodName}>
                      {method.name}
                    </td>

                    <td>
                      <div className={styles.details}>
                        {method.details?.map((detail: string, i: number) => (
                          <span key={i}>{detail}</span>
                        ))}
                      </div>
                    </td>

                    <td>
                      {dayjs(method.createdAt).format("DD MMMM YYYY , hh:mm A")}
                    </td>

                    <td>
                      <Switch
                        checked={method.isActive}
                        disabled={!canEdit}
                        onCheckedChange={() =>
                          toggleMethod(method)
                        }
                      />
                    </td>

                    {canEdit && (
                      <td>
                        <div className="action-button justify-content-start">
                          <CustomButton
                            btnIcon={<IconEdit className="text-secondary icon-class icon-class" />}
                            onClick={() => handleEditMethod(method)}
                          />
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

                {methods.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>
                      No withdrawal methods found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default WithdrawSettings;