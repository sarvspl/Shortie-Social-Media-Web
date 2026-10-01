"use client";

import { useState, useEffect } from "react";
import styles from "../../styles/StorageSettings.module.css";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { getSetting, updateSetting, StorageSetting } from "@/store/settingSlice";
import { permissionError } from "@/util/Alert";
import { setToast } from "@/util/toastServices";
import { storageOptionContent, awsContent, digitalOceanContent } from "@/extra/infoContent";

import SettingsCard from "../ui/SettingsCard";
import FormField from "../ui/FormField";
import Button from "../ui/button";

import { HardDrive, Cloud, Anchor, Check } from "lucide-react";
import { usePermission } from "@/hooks/usePermission";

type StorageType = "local" | "awsS3" | "digitalOcean";

const StorageSettings = () => {
  const dispatch = useAppDispatch();
  const { settingData } = useSelector((state: RootStore) => state.setting);

  const { can } = usePermission();
  const canEdit = can("Setting", "Edit");

  const [selectedStorage, setSelectedStorage] = useState<StorageType>("local");

  const [awsConfig, setAwsConfig] = useState({
    awsEndpoint: "",
    awsAccessKey: "",
    awsSecretKey: "",
    awsHostname: "",
    awsBucketName: "",
    awsRegion: "",
  });

  const [doConfig, setDoConfig] = useState({
    doEndpoint: "",
    doAccessKey: "",
    doSecretKey: "",
    doHostname: "",
    doBucketName: "",
    doRegion: "",
  });

  const [initialValues, setInitialValues] = useState<any>({});

  useEffect(() => {
    dispatch(getSetting({} as any));
  }, [dispatch]);

  useEffect(() => {
    if (settingData) {
      const storage = settingData.storage;
      let currentType: StorageType = "local";
      if (storage?.awsS3) currentType = "awsS3";
      else if (storage?.digitalOcean) currentType = "digitalOcean";

      const newState = {
        selectedStorage: currentType,
        awsConfig: {
          awsEndpoint: settingData.awsEndpoint || "",
          awsAccessKey: settingData.awsAccessKey || "",
          awsSecretKey: settingData.awsSecretKey || "",
          awsHostname: settingData.awsHostname || "",
          awsBucketName: settingData.awsBucketName || "",
          awsRegion: settingData.awsRegion || "",
        },
        doConfig: {
          doEndpoint: settingData.doEndpoint || "",
          doAccessKey: settingData.doAccessKey || "",
          doSecretKey: settingData.doSecretKey || "",
          doHostname: settingData.doHostname || "",
          doBucketName: settingData.doBucketName || "",
          doRegion: settingData.doRegion || "",
        },
      };

      setSelectedStorage(newState.selectedStorage);
      setAwsConfig(newState.awsConfig);
      setDoConfig(newState.doConfig);
      setInitialValues(newState);
    }
  }, [settingData]);

  const handleSaveConfig = () => {


    const changedData: any = {};
    let hasChanges = false;

    // Check AWS changes
    Object.keys(awsConfig).forEach((key) => {
      if (awsConfig[key as keyof typeof awsConfig] !== initialValues.awsConfig[key]) {
        changedData[key] = awsConfig[key as keyof typeof awsConfig];
      }
    });

    // Check DO changes
    Object.keys(doConfig).forEach((key) => {
      if (doConfig[key as keyof typeof doConfig] !== initialValues.doConfig[key]) {
        changedData[key] = doConfig[key as keyof typeof doConfig];
      }
    });

    if (Object.keys(changedData).length > 0) {
      hasChanges = true;
      dispatch(updateSetting({ data: changedData, settingId: settingData?._id } as any));
    }

    if (selectedStorage !== initialValues.selectedStorage) {
      hasChanges = true;
      dispatch(StorageSetting({ settingId: settingData?._id, type: selectedStorage }));
    }

    if (!hasChanges) {
      setToast("info", "No changes detected.");
    }
  };

  const storageOptions = [
    {
      id: "local" as StorageType,
      name: "Local Storage",
      description: "Store files on your server",
      icon: HardDrive,
      recommended: true,
    },
    {
      id: "awsS3" as StorageType,
      name: "AWS S3",
      description: "Amazon Web Services S3 bucket",
      icon: Cloud,
      recommended: false,
    },
    {
      id: "digitalOcean" as StorageType,
      name: "DigitalOcean Spaces",
      description: "DigitalOcean object storage",
      icon: Anchor,
      recommended: false,
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div>
        <h2 className={styles.heading}>Storage Provider</h2>
        <p className={styles.subHeading}>
          Select where you want to store media files
        </p>

        <div className="row g-3">
          {storageOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedStorage === option.id;

            return (
              <div key={option.id} className="col-12 col-md-4">
                <button
                  onClick={() => setSelectedStorage(option.id)}
                  className={`${styles.optionCard} ${isSelected ? styles.optionSelected : ""
                    }`}
                >
                  {isSelected && (
                    <div className={styles.checkIcon}>
                      <Check size={14} />
                    </div>
                  )}

                  <div
                    className={`${styles.iconBox} ${isSelected ? styles.iconSelected : ""
                      }`}
                  >
                    <Icon size={24} />
                  </div>

                  <h3 className={styles.optionTitle}>{option.name}</h3>
                  <p className={styles.optionDesc}>{option.description}</p>

                  {option.recommended && (
                    <span className={styles.recommended}>
                      RECOMMENDED
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Local */}
      {selectedStorage === "local" && (
        <SettingsCard>
          <div className={styles.localBox}>
            <div className={styles.successIcon}>
              <Check size={22} />
            </div>

            <div>
              <h3 className={styles.localTitle}>
                Local storage is configured
              </h3>

              <p className={styles.localText}>
                Files will be stored in
                <code className={styles.code}>
                  /storage/media
                </code>
                directory. Make sure server has enough disk space.
              </p>

            </div>
          </div>
        </SettingsCard>
      )}

      {/* AWS */}
      {selectedStorage === "awsS3" && (
        <SettingsCard
          title="AWS S3 Configuration"
          description="Configure your Amazon S3 bucket"
          icon={<Cloud size={20} />}
          tooltipTitle="AWS S3 Setting"
          tooltipContent={awsContent}
        >
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <FormField
                label="Endpoint"
                name="awsEndpoint"
                value={awsConfig.awsEndpoint}
                placeholder="Endpoint"
                onChange={(e) => setAwsConfig({ ...awsConfig, awsEndpoint: e.target.value })}
                required
                example={"e.g https://bucketname.s3.region.amazonaws.com"}
              />
            </div>
            <div className="col-12 col-md-6">
              <FormField
                label="Host Name"
                name="awsHostname"
                value={awsConfig.awsHostname}
                placeholder="Host Name"
                onChange={(e) => setAwsConfig({ ...awsConfig, awsHostname: e.target.value })}
                required
                example={"e.g https://s3.region.amazonaws.com"}
              />
            </div>
            <div className="col-12 col-md-6">
              <FormField
                label="Access Key ID"
                name="awsAccessKey"
                value={awsConfig.awsAccessKey}
                placeholder="Access Key ID"
                onChange={(e) => setAwsConfig({ ...awsConfig, awsAccessKey: e.target.value })}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <FormField
                label="Secret Key"
                name="awsSecretKey"
                value={awsConfig.awsSecretKey}
                placeholder="Secret Key"
                onChange={(e) => setAwsConfig({ ...awsConfig, awsSecretKey: e.target.value })}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <FormField
                label="Bucket"
                name="awsBucketName"
                value={awsConfig.awsBucketName}
                placeholder="Bucket Name"
                onChange={(e) => setAwsConfig({ ...awsConfig, awsBucketName: e.target.value })}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <FormField
                label="Region"
                name="awsRegion"
                value={awsConfig.awsRegion}
                placeholder="Region"
                onChange={(e) => setAwsConfig({ ...awsConfig, awsRegion: e.target.value })}
                required
              />
            </div>
          </div>
        </SettingsCard>
      )}

      {/* DigitalOcean */}
      {selectedStorage === "digitalOcean" && (
        <SettingsCard
          title="DigitalOcean Spaces"
          description="Configure your Spaces credentials"
          icon={<Anchor size={20} />}
          tooltipTitle="DigitalOcean Setting"
          tooltipContent={digitalOceanContent}
        >
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <FormField
                label="Endpoint"
                name="doEndpoint"
                value={doConfig.doEndpoint}
                placeholder="Endpoint"
                onChange={(e) => setDoConfig({ ...doConfig, doEndpoint: e.target.value })}
                required
                example={"e.g https://bucketname.region.digitaloceanspaces.com"}
              />
            </div>
            <div className="col-12 col-md-6">
              <FormField
                label="Host Name"
                name="doHostname"
                value={doConfig.doHostname}
                placeholder="Host Name"
                onChange={(e) => setDoConfig({ ...doConfig, doHostname: e.target.value })}
                required
                example={"e.g https://region.digitaloceanspaces.com"}
              />
            </div>
            <div className="col-12 col-md-6">
              <FormField
                label="Access Key"
                name="doAccessKey"
                value={doConfig.doAccessKey}
                placeholder="Access Key"
                onChange={(e) => setDoConfig({ ...doConfig, doAccessKey: e.target.value })}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <FormField
                label="Secret Key"
                name="doSecretKey"
                value={doConfig.doSecretKey}
                placeholder="Secret Key"
                onChange={(e) => setDoConfig({ ...doConfig, doSecretKey: e.target.value })}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <FormField
                label="Space Name"
                name="doBucketName"
                value={doConfig.doBucketName}
                placeholder="Space Name"
                onChange={(e) => setDoConfig({ ...doConfig, doBucketName: e.target.value })}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <FormField
                label="Region"
                name="doRegion"
                value={doConfig.doRegion}
                placeholder="Region"
                onChange={(e) => setDoConfig({ ...doConfig, doRegion: e.target.value })}
                required
              />
            </div>
          </div>
        </SettingsCard>
      )}

      {canEdit && (
        <div className={styles.saveRow}>
          <Button size="lg" onClick={handleSaveConfig}>Save Changes</Button>
        </div>
      )}
    </div>
  );
};

export default StorageSettings;