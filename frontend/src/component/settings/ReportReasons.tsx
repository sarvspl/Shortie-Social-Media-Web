"use client";

import { useState, useEffect } from "react";
import styles from "../../styles/ReportReasons.module.css";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { getReportSetting, deleteReportSetting } from "@/store/settingSlice";
import { openDialog } from "@/store/dialogSlice";
import { permissionError, warning } from "@/util/Alert";
import CustomButton from "@/extra/Button";

import SettingsCard from "../ui/SettingsCard";
import Button from "../ui/button";
import Input from "../ui/input";
import Label from "../ui/label";
import dayjs from "dayjs";

import {
  Flag,
  Search,
  Plus,
  Pencil,
  Trash2
} from "lucide-react";

import ReportReasonDialogue from "../reportreason/ReportReasonDialogue";
import { usePermission } from "@/hooks/usePermission";
import { IconEdit, IconTrash } from "@tabler/icons-react";

const ReportReasons = () => {
  const dispatch = useAppDispatch();
  const { settingData } = useSelector((state: RootStore) => state.setting);
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);

  const { can } = usePermission();
  const canEdit = can("Setting", "Edit");
  const canDelete = can("Setting", "Delete");
  const canCreate = can("Setting", "Create");

  const [searchQuery, setSearchQuery] = useState("");
  const [reasons, setReasons] = useState<any[]>([]);

  useEffect(() => {
    dispatch(getReportSetting({} as any));
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(settingData)) {
      setReasons(settingData);
    }
  }, [settingData]);

  const filteredReasons = reasons.filter(
    (reason) =>
      reason.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {

    warning()
      .then((res) => {
        if (res) {
          dispatch(deleteReportSetting(id));
        }
      })
      .catch((err) => console.log(err));
  };

  const handleAdd = () => {
    dispatch(openDialog({ type: "reportreason" }));
  };

  const handleEdit = (row: any) => {
    dispatch(openDialog({ type: "editreportreason", data: row }));
  };

  return (
    <div className={styles.wrapper}>
      {/* Dialogues */}
      {dialogueType === "reportreason" && <ReportReasonDialogue />}
      {dialogueType === "editreportreason" && <ReportReasonDialogue />}

      {/* Header */}
      <div className={styles.headerRow}>
        <div className={styles.headerText}>
          <h2 className={styles.title}>Report Reasons</h2>
          <p className={styles.subtitle}>
            Manage predefined reasons for user reports
          </p>
        </div>

        {canCreate && (
          <Button className={styles.addBtn} onClick={handleAdd}>
            <Plus size={16} />
            Add Reason
          </Button>
        )}
      </div>

      <SettingsCard>

        {/* Search */}
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />

          <Input
            placeholder="Search report reasons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Table */}
        <div className={styles.tableResponsive}>
          <div className={styles.tableWrapper}>

            <table className={styles.table}>

              <thead>
                <tr>
                  <th>No</th>
                  <th>Title</th>
                  {(canEdit || canDelete) && (
                    <th className={styles.actionHead}>Actions</th>
                  )}
                </tr>
              </thead>

              <tbody>

                {filteredReasons.length === 0 ? (
                  <tr>
                    <td colSpan={3} className={styles.emptyState}>

                      {/* <Flag size={40} /> */}

                      <p>No report reasons found</p>

                    </td>
                  </tr>
                ) : (
                  filteredReasons.map((reason, index) => (
                    <tr key={reason._id}>

                      <td>{index + 1}</td>

                      <td className={styles.reasonTitle}>
                        {reason.title}
                      </td>

                      <td>

                        {(canEdit || canDelete) && (
                          <div className="action-button">
                            {canEdit && (
                              <CustomButton
                                btnIcon={<IconEdit className="text-secondary icon-class icon-class" />}
                                onClick={() => handleEdit(reason)}
                              />
                            )}
                            {canDelete && (
                              <CustomButton
                                btnIcon={<IconTrash className="text-secondary icon-class icon-class" />}
                                onClick={() => handleDelete(reason._id)}
                              />
                            )}
                          </div>
                        )}

                      </td>

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

export default ReportReasons;