"use client";

import { useState, useEffect, useRef } from "react";
import styles from "../../styles/ProfileSettings.module.css";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { getSetting, updateProfileManagement } from "@/store/settingSlice";
import { permissionError } from "@/util/Alert";
import { projectName } from "@/util/config";
import axios from "axios";

import SettingsCard from "../ui/SettingsCard";
import Button from "../ui/button";
import { Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { usePermission } from "@/hooks/usePermission";

const ProfileManagementSetting = () => {
  const dispatch = useAppDispatch();
  const { settingData } = useSelector((state: RootStore) => state.setting);

  const { can } = usePermission();
  const canDelete = can("Setting", "Delete");
  const canCreate = can("Setting", "Create");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profileCollection, setProfileCollection] = useState<any[]>([]);
  const [settingsId, setSettingsId] = useState("");
  const [profileFile, setProfileFile] = useState<File[]>([]);

  useEffect(() => {
    dispatch(getSetting({} as any));
  }, [dispatch]);

  useEffect(() => {
    setProfileCollection(settingData?.profilePictureCollection || []);
    setSettingsId(settingData?._id);
  }, [settingData]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setProfileFile((prev) => [...prev, ...files]);
    }
  };

  const handleRemoveStaged = (index: number) => {
    setProfileFile((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {

    const payload: any = {
      settingId: settingsId,
    };

    if (profileFile.length) {
      const folderStructure = `${projectName}/defaultphoto`;
      const formData = new FormData();
      formData.append("folderStructure", folderStructure);
      formData.append("keyName", Date.now().toString());
      profileFile.forEach((item) => {
        formData.append("content", item);
      });

      try {
        const response = await axios.put(`/admin/file/uploadBulkMedia`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response?.data?.status && response?.data.urls) {
          payload.action = "add";
          payload.imageUrls = response.data.urls.toString();
        }
      } catch (error) {
        console.error("Upload failed", error);
      }
    }

    dispatch(updateProfileManagement(payload));
    setProfileFile([]);
  };

  const handleDelete = async (index: number) => {

    const payload = {
      settingId: settingsId,
      action: "remove",
      indexes: index.toString(),
    };
    dispatch(updateProfileManagement(payload));
  };

  const allItems = [...profileCollection, ...profileFile];

  return (
    <div className={styles.wrapper}>
      <SettingsCard
        title="Profile Management"
        description="Manage default profile pictures for users"
        icon={<ImageIcon size={18} />}
      >
        <div style={{ marginBottom: "1rem" }}>
          {canCreate && (
            <Button
              className={styles.uploadBtn}
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
              Select Photos
            </Button>
          )}

          <input
            ref={fileInputRef}
            id="bulkImageUpload"
            type="file"
            multiple
            accept=".png,.jpg,.jpeg"
            style={{ display: "none" }}
            onChange={handleImage}
          />
        </div>

        {profileFile.length > 0 && canCreate && (
          <div style={{ marginBottom: "1rem" }}>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
              {profileFile.length} unsaved photos ready to upload.
            </p>
            <Button size="sm" onClick={handleSubmit}>
              Upload Selected Photos
            </Button>
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "1rem" }}>
          {allItems.length === 0 && (
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              No profile pictures available.
            </p>
          )}

          {allItems.map((item, index) => {
            const isFile = item instanceof File;
            const src = isFile ? URL.createObjectURL(item) : item;

            return (
              <div
                key={index}
                style={{
                  position: "relative",
                  width: "120px",
                  height: "120px",
                  borderRadius: "60px",
                  overflow: "hidden",
                  border: "2px solid var(--border)",
                }}
              >
                <img
                  src={src}
                  alt={`Profile ${index}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.currentTarget.src = "/images/user.png";
                  }}
                />
                {(isFile || canDelete) && (
                  <button
                    onClick={() => (isFile ? handleRemoveStaged(index - profileCollection.length) : handleDelete(index))}
                    style={{
                      position: "absolute",
                      bottom: "8px",
                      right: "36px",
                      background: "var(--danger)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </SettingsCard>
    </div>
  );
};

export default ProfileManagementSetting;