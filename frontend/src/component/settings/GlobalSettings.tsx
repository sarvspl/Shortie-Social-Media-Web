"use client";

import { useState, ChangeEvent, useEffect } from "react";
import styles from "../../styles/GlobalSettings.module.css";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { getSetting, updateSetting, updateWaterMark, settingSwitch } from "@/store/settingSlice";
import { uploadFile } from "@/store/adminSlice";
import { setToast } from "@/util/toastServices";
import { permissionError } from "@/util/Alert";
import { projectName } from "@/util/config";

import {
  appSetting,
  coinSetting,
  zegoSetting,
  mediaModerationSetting,
  firebaseNotificationSetting,
  shortsEffectSetting,
  waterMarkSetting,
  apiKeySetting,
  featureToggleSetting,
  deeplinkSettingContent,
} from "@/extra/infoContent";

import SettingsCard from "../ui/SettingsCard";
import FormField from "../ui/FormField";
import Button from "../ui/button";
import Switch from "../ui/switch";
import Label from "../ui/label";
import Textarea from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/RadioGroup";
import MultiSelectDropdown from "../ui/MultiSelectDropdown";

import {
  Settings2,
  Coins,
  Shield,
  Sparkles,
  Key,
  Video,
  Bell,
  Cpu,
  Link as LinkIcon,
} from "lucide-react";
import { usePermission } from "@/hooks/usePermission";

interface SettingsState {
  websiteUrl: string;
  privacyUrl: string;
  termsUrl: string;
  androidVersion: string;
  iosVersion: string;
  androidAppLink: string;
  iosAppLink: string;

  pkEndTime: string;
  shortsDuration: string;

  waterMark: string;
  watermarkFile: File | null;
  watermarkPreview: string | null;

  loginBonus: string;
  coinAmount: string;
  coinWithdrawal: string;

  openAiKey: string;
  resendApiKey: string;
  androidLicenseKey: string;
  iosLicenseKey: string;
  sightengineUser: string;
  sightengineSecret: string;

  zegoAppId: string;
  zegoAppSignIn: string;
  zegoServerSecret: string;

  videoModerationCategories: any[];
  imageModerationCategories: any[];

  isFakeData: boolean;
  isEffectActive: boolean;

  firebaseJson: string;

  androidAssetLinks: string;
  appleAppSiteAssociation: string;
}

const GlobalSettings = () => {
  const dispatch = useAppDispatch();
  const { settingData } = useSelector((state: RootStore) => state.setting);

  const { can } = usePermission();

  const canEdit = can("Setting", "Edit");

  const [settings, setSettings] = useState<SettingsState>({
    websiteUrl: "",
    privacyUrl: "",
    termsUrl: "",
    androidVersion: "",
    iosVersion: "",
    androidAppLink: "",
    iosAppLink: "",

    pkEndTime: "10",
    shortsDuration: "15",

    waterMark: "inactive",
    watermarkFile: null,
    watermarkPreview: null,

    loginBonus: "1000",
    coinAmount: "1",
    coinWithdrawal: "100",

    openAiKey: "",
    resendApiKey: "",
    androidLicenseKey: "",
    iosLicenseKey: "",
    sightengineUser: "",
    sightengineSecret: "",

    zegoAppId: "",
    zegoAppSignIn: "",
    zegoServerSecret: "",

    videoModerationCategories: [],
    imageModerationCategories: [],

    isFakeData: false,
    isEffectActive: false,

    firebaseJson: "",
    androidAssetLinks: "",
    appleAppSiteAssociation: "",
  });

  const [initialValues, setInitialValues] = useState<any>({});

  useEffect(() => {
    dispatch(getSetting({} as any));
  }, [dispatch]);

  useEffect(() => {
    if (settingData) {
      const videoBanned = settingData?.videoBanned?.map((id: any) => ({
        id,
        name: getModerationName(id),
      })) || [];
      const postBanned = settingData?.postBanned?.map((id: any) => ({
        id,
        name: getModerationName(id),
      })) || [];

      const newState = {
        websiteUrl: settingData?.websiteUrl || "",
        privacyUrl: settingData?.privacyPolicyLink || "",
        termsUrl: settingData?.termsOfUsePolicyLink || "",
        androidVersion: settingData?.androidAppVersion || "",
        iosVersion: settingData?.iosAppVersion || "",
        androidAppLink: settingData?.androidAppLink || "",
        iosAppLink: settingData?.iosAppLink || "",
        pkEndTime: settingData?.pkEndTime || "10",
        shortsDuration: settingData?.durationOfShorts || "15",
        waterMark: settingData?.isWatermarkOn ? "active" : "inactive",
        watermarkPreview: settingData?.watermarkIcon || null,
        watermarkFile: null,
        loginBonus: settingData?.loginBonus || "1000",
        coinAmount: settingData?.coinCharge || "1",
        coinWithdrawal: settingData?.minCoinForCashOut || "100",
        openAiKey: settingData?.openAIKey || "",
        resendApiKey: settingData?.resendApiKey || "",
        androidLicenseKey: settingData?.androidLicenseKey || "",
        iosLicenseKey: settingData?.iosLicenseKey || "",
        sightengineUser: settingData?.sightengineUser || "",
        sightengineSecret: settingData?.sightengineSecret || "",
        zegoAppId: settingData?.zegoAppId || "",
        zegoAppSignIn: settingData?.zegoAppSignIn || "",
        zegoServerSecret: settingData?.zegoServerSecret || "",
        videoModerationCategories: videoBanned,
        imageModerationCategories: postBanned,
        isFakeData: settingData?.isFakeData || false,
        isEffectActive: settingData?.isEffectActive || false,
        firebaseJson: settingData?.privateKey ? JSON.stringify(settingData.privateKey) : "",
        androidAssetLinks: settingData?.androidAssetLinks ? JSON.stringify(settingData.androidAssetLinks, null, 2) : "",
        appleAppSiteAssociation: settingData?.appleAppSiteAssociation ? JSON.stringify(settingData.appleAppSiteAssociation, null, 2) : "",
      };
      setSettings(newState);
      setInitialValues(newState);
    }
  }, [settingData]);

  const moderationOptions = [
    { name: "Nudity and Adult Content", id: "1" },
    { name: "Hate and Offensive Signs", id: "2" },
    { name: "Violence", id: "3" },
    { name: "Gore and Disgusting", id: "4" },
    { name: "Weapons", id: "5" },
    { name: "Smoking and Tobacco Products", id: "6" },
    { name: "Recreational And Medical Drugs", id: "7" },
    { name: "Gambling", id: "8" },
    { name: "Alcoholic Beverages", id: "9" },
    { name: "Money And Banknotes", id: "10" },
    { name: "Selfharm", id: "11" },
  ];

  function getModerationName(id: string) {
    const option = moderationOptions.find((o) => o.id === id);
    return option ? option.name : id;
  }

  const handleWatermarkUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setSettings({
        ...settings,
        watermarkFile: file,
        watermarkPreview: reader.result as string,
      });
    };

    reader.readAsDataURL(file);
  };

  const handleSave = async () => {


    const changedData: any = {};
    let hasChanges = false;

    // Check mapping between SettingsState and API fields for changes
    if (settings.websiteUrl !== initialValues.websiteUrl) changedData.websiteUrl = settings.websiteUrl;
    if (settings.privacyUrl !== initialValues.privacyUrl) changedData.privacyPolicyLink = settings.privacyUrl;
    if (settings.termsUrl !== initialValues.termsUrl) changedData.termsOfUsePolicyLink = settings.termsUrl;
    if (settings.androidVersion !== initialValues.androidVersion) changedData.androidAppVersion = settings.androidVersion;
    if (settings.iosVersion !== initialValues.iosVersion) changedData.iosAppVersion = settings.iosVersion;
    if (settings.androidAppLink !== initialValues.androidAppLink) changedData.androidAppLink = settings.androidAppLink;
    if (settings.iosAppLink !== initialValues.iosAppLink) changedData.iosAppLink = settings.iosAppLink;
    if (settings.pkEndTime !== initialValues.pkEndTime) changedData.pkEndTime = settings.pkEndTime;
    if (settings.shortsDuration !== initialValues.shortsDuration) changedData.durationOfShorts = settings.shortsDuration;
    if (settings.loginBonus !== initialValues.loginBonus) changedData.loginBonus = settings.loginBonus;
    if (settings.coinAmount !== initialValues.coinAmount) changedData.coinCharge = settings.coinAmount;
    if (settings.coinWithdrawal !== initialValues.coinWithdrawal) changedData.minCoinForCashOut = settings.coinWithdrawal;
    if (settings.openAiKey !== initialValues.openAiKey) changedData.openAIKey = settings.openAiKey;
    if (settings.resendApiKey !== initialValues.resendApiKey) changedData.resendApiKey = settings.resendApiKey;
    if (settings.androidLicenseKey !== initialValues.androidLicenseKey) changedData.androidLicenseKey = settings.androidLicenseKey;
    if (settings.iosLicenseKey !== initialValues.iosLicenseKey) changedData.iosLicenseKey = settings.iosLicenseKey;
    if (settings.sightengineUser !== initialValues.sightengineUser) changedData.sightengineUser = settings.sightengineUser;
    if (settings.sightengineSecret !== initialValues.sightengineSecret) changedData.sightengineSecret = settings.sightengineSecret;
    if (settings.zegoAppId !== initialValues.zegoAppId) changedData.zegoAppId = settings.zegoAppId;
    if (settings.zegoAppSignIn !== initialValues.zegoAppSignIn) changedData.zegoAppSignIn = settings.zegoAppSignIn;
    if (settings.zegoServerSecret !== initialValues.zegoServerSecret) changedData.zegoServerSecret = settings.zegoServerSecret;
    if (JSON.stringify(settings.videoModerationCategories) !== JSON.stringify(initialValues.videoModerationCategories)) {
      changedData.videoBanned = settings.videoModerationCategories.map((c: any) => c.id).join(",");
    }
    if (JSON.stringify(settings.imageModerationCategories) !== JSON.stringify(initialValues.imageModerationCategories)) {
      changedData.postBanned = settings.imageModerationCategories.map((c: any) => c.id).join(",");
    }
    if (settings.firebaseJson !== initialValues.firebaseJson) changedData.privateKey = settings.firebaseJson;

    if (settings.androidAssetLinks !== initialValues.androidAssetLinks) {
      if (settings.androidAssetLinks.trim() === "") {
        changedData.androidAssetLinks = [];
      } else {
        try {
          const parsed = JSON.parse(settings.androidAssetLinks);
          if (!Array.isArray(parsed)) {
            return setToast("error", "androidAssetLinks must be a valid JSON array.");
          }
          if (!parsed.every((item: any) => item && typeof item === "object" && Array.isArray(item.relation) && item.target && typeof item.target === "object")) {
            return setToast("error", "androidAssetLinks objects must contain 'relation' array and 'target' object.");
          }
          changedData.androidAssetLinks = parsed;
        } catch (e) {
          return setToast("error", "Invalid JSON format for androidAssetLinks.");
        }
      }
    }

    if (settings.appleAppSiteAssociation !== initialValues.appleAppSiteAssociation) {
      if (settings.appleAppSiteAssociation.trim() === "") {
        changedData.appleAppSiteAssociation = {};
      } else {
        try {
          const parsed = JSON.parse(settings.appleAppSiteAssociation);
          if (typeof parsed !== "object" || Array.isArray(parsed) || parsed === null) {
            return setToast("error", "appleAppSiteAssociation must be a valid JSON object.");
          }
          if (!parsed.applinks || !Array.isArray(parsed.applinks.apps) || !Array.isArray(parsed.applinks.details)) {
            return setToast("error", "appleAppSiteAssociation must contain 'applinks' with 'apps' and 'details' arrays.");
          }
          changedData.appleAppSiteAssociation = parsed;
        } catch (e) {
          return setToast("error", "Invalid JSON format for appleAppSiteAssociation.");
        }
      }
    }

    if (Object.keys(changedData).length > 0) {
      hasChanges = true;
      dispatch(updateSetting({ data: changedData, settingId: settingData?._id } as any));
    }

    // Handle Watermark update if changed or file selected
    if (settings.waterMark !== initialValues.waterMark || settings.watermarkFile) {
      hasChanges = true;
      let url = settings.watermarkPreview;
      if (settings.watermarkFile) {
        const formData = new FormData();
        formData.append("folderStructure", `${projectName}/admin/waterMarkImage`);
        formData.append("keyName", settings.watermarkFile.name);
        formData.append("content", settings.watermarkFile);
        const response: any = await dispatch(uploadFile({ data: formData })).unwrap();
        if (response?.data?.status && response.data.url) {
          url = response.data.url;
          setSettings(prev => ({ ...prev, watermarkFile: null, watermarkPreview: response.data.url }));
        }
      }
      dispatch(updateWaterMark({
        settingId: settingData?._id,
        watermarkType: settings.waterMark === "active" ? "1" : "2",
        watermarkIcon: url,
      } as any));
    }

    // Handle switches if changed
    if (settings.isFakeData !== initialValues.isFakeData) {
      hasChanges = true;
      dispatch(settingSwitch({ settingId: settingData?._id, type: "isFakeData" } as any));
    }
    if (settings.isEffectActive !== initialValues.isEffectActive) {
      hasChanges = true;
      dispatch(settingSwitch({ settingId: settingData?._id, type: "isEffectActive" } as any));
    }

    if (!hasChanges) {
      setToast("info", "No changes detected.");
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* App Configuration */}
      <SettingsCard
        title="App Configuration"
        description="General application settings"
        icon={<Settings2 size={18} />}
        tooltipTitle="App Setting"
        tooltipContent={appSetting}
      >
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <FormField
              label="Privacy Policy Link"
              name="privacyUrl"
              value={settings.privacyUrl}
              placeholder="Privacy Policy Link"
              onChange={(e) =>
                setSettings({ ...settings, privacyUrl: e.target.value })
              }
            />
          </div>

          <div className="col-12 col-md-6">
            <FormField
              label="Terms & Conditions"
              name="termsUrl"
              value={settings.termsUrl}
              placeholder="Terms & Conditions"
              onChange={(e) =>
                setSettings({ ...settings, termsUrl: e.target.value })
              }
            />
          </div>

          <div className="col-12 col-md-6">
            <FormField
              label="Android App Version"
              name="androidVersion"
              value={settings.androidVersion}
              placeholder="Android App Version"
              onChange={(e) =>
                setSettings({ ...settings, androidVersion: e.target.value })
              }
            />
          </div>

          <div className="col-12 col-md-6">
            <FormField
              label="iOS App Version"
              name="iosVersion"
              value={settings.iosVersion}
              placeholder="iOS App Version"
              onChange={(e) =>
                setSettings({ ...settings, iosVersion: e.target.value })
              }
            />
          </div>

          <div className="col-12 col-md-6">
            <FormField
              label="Android App Link"
              name="androidAppLink"
              value={settings.androidAppLink}
              placeholder="Android App Link"
              onChange={(e) =>
                setSettings({ ...settings, androidAppLink: e.target.value })
              }
            />
          </div>

          <div className="col-12 col-md-6">
            <FormField
              label="iOS App Link"
              name="iosAppLink"
              value={settings.iosAppLink}
              placeholder="iOS App Link"
              onChange={(e) =>
                setSettings({ ...settings, iosAppLink: e.target.value })
              }
            />
          </div>

          <div className="col-12 col-md-6">
            <FormField
              label="Website URL"
              name="websiteUrl"
              value={settings.websiteUrl}
              placeholder={"https://yourdomain.com"}
              onChange={(e) =>
                setSettings({ ...settings, websiteUrl: e.target.value })
              }
            />
          </div>
        </div>
      </SettingsCard>

      {/* Video Settings */}
      <SettingsCard
        title="Video Settings"
        description="Control video features"
        icon={<Video size={18} />}
        tooltipTitle="Video Settings"
        tooltipContent={shortsEffectSetting}
      >
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <FormField
              label="PK End Time (In Seconds)"
              name="pkEndTime"
              type="number"
              value={settings.pkEndTime}
              placeholder="PK End Time"
              onChange={(e) =>
                setSettings({ ...settings, pkEndTime: e.target.value })
              }
            />
          </div>

          <div className="col-12 col-md-6">
            <FormField
              label="Shorts Duration (In Seconds)"
              name="shortsDuration"
              type="number"
              value={settings.shortsDuration}
              placeholder="Shorts Duration"
              onChange={(e) =>
                setSettings({ ...settings, shortsDuration: e.target.value })
              }
            />
          </div>

          <div>
            <Label className={styles.label}>Watermark</Label>

            <RadioGroup
              value={settings.waterMark}
              onValueChange={(value) =>
                setSettings({ ...settings, waterMark: value })
              }
              className="d-flex flex-row flex-wrap g-3 mt-1"
            >
              <div className="col-12 col-sm-auto">
                <div className={styles.radioItem}>
                  <RadioGroupItem value="inactive" id="inactive" />
                  <Label htmlFor="inactive" className="mb-0">Inactive</Label>
                </div>
              </div>

              <div className="col-12 col-sm-auto">
                <div className={styles.radioItem}>
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active" className="mb-0">Active</Label>
                </div>
              </div>
            </RadioGroup>

            {settings.waterMark === "active" && (
              <div className={styles.uploadBox}>
                <input type="file" onChange={handleWatermarkUpload} />

                {settings.watermarkPreview && (
                  <img
                    src={settings.watermarkPreview}
                    alt="preview"
                    className={styles.preview}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </SettingsCard>

      {/* Coins */}
      <SettingsCard
        title="Coin Settings"
        description="Configure coin rewards"
        icon={<Coins size={18} />}
        tooltipTitle="Coin Setting"
        tooltipContent={coinSetting}
      >
        <div >
          <FormField
            label="Login Bonus"
            name="loginBonus"
            value={settings.loginBonus}
            placeholder="Login Bonus"
            onChange={(e) =>
              setSettings({ ...settings, loginBonus: e.target.value })
            }
          />
        </div>

        <div className={styles.coinRow}>
          <FormField
            label="Coin Amount ($)"
            name="coinAmount"
            value={settings.coinAmount}
            placeholder="Coin Amount"
            onChange={(e) =>
              setSettings({ ...settings, coinAmount: e.target.value })
            }
          />

          <div className={styles.equalSign}>=</div>

          <FormField
            label="Coin Withdrawal"
            name="coinWithdrawal"
            value={settings.coinWithdrawal}
            placeholder="Coin Withdrawal"
            onChange={(e) =>
              setSettings({ ...settings, coinWithdrawal: e.target.value })
            }
          />
        </div>
      </SettingsCard>

      {/* Zego Settings */}
      <SettingsCard
        title="Zego Configuration"
        description="Configure Zego Cloud settings"
        icon={<Cpu size={18} />}
        tooltipTitle="Zego Setting"
        tooltipContent={zegoSetting}
      >
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <FormField
              label="Zego App ID"
              name="zegoAppId"
              value={settings.zegoAppId}
              placeholder="Zego App ID"
              onChange={(e) =>
                setSettings({ ...settings, zegoAppId: e.target.value })
              }
            />
          </div>

          <div className="col-12 col-md-6">
            <FormField
              label="Zego App Sign In"
              name="zegoAppSignIn"
              value={settings.zegoAppSignIn}
              placeholder="Zego App Sign In"
              onChange={(e) =>
                setSettings({ ...settings, zegoAppSignIn: e.target.value })
              }
            />
          </div>

          <div className="col-12 col-md-6">
            <FormField
              label="Zego Server Secret"
              name="zegoServerSecret"
              value={settings.zegoServerSecret}
              placeholder="Zego Server Secret"
              onChange={(e) =>
                setSettings({ ...settings, zegoServerSecret: e.target.value })
              }
            />
          </div>
        </div>
      </SettingsCard>

      {/* API Keys */}
      <SettingsCard
        title="API Keys"
        description="Configure external service keys"
        icon={<Key size={18} />}
        tooltipTitle="API Keys Setting"
        tooltipContent={apiKeySetting}
      >
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <FormField
              label="Open AI Key"
              name="openAiKey"
              value={settings.openAiKey}
              placeholder="Open AI Key"
              onChange={(e) =>
                setSettings({ ...settings, openAiKey: e.target.value })
              }
            />
          </div>

          <div className="col-12 col-md-6">
            <FormField
              label="Resend API Key"
              name="resendApiKey"
              value={settings.resendApiKey}
              placeholder="Resend API Key"
              onChange={(e) =>
                setSettings({ ...settings, resendApiKey: e.target.value })
              }
            />
          </div>

          <div className="col-12 col-md-6">
            <FormField
              label="Android License Key"
              name="androidLicenseKey"
              value={settings.androidLicenseKey}
              placeholder="Android License Key"
              onChange={(e) =>
                setSettings({ ...settings, androidLicenseKey: e.target.value })
              }
            />
          </div>

          <div className="col-12 col-md-6">
            <FormField
              label="iOS License Key"
              name="iosLicenseKey"
              value={settings.iosLicenseKey}
              placeholder="iOS License Key"
              onChange={(e) =>
                setSettings({ ...settings, iosLicenseKey: e.target.value })
              }
            />
          </div>
        </div>
      </SettingsCard>

      {/* Moderation */}
      <SettingsCard
        title="Content Moderation"
        icon={<Shield size={18} />}
        tooltipTitle="Image and Video Moderation"
        tooltipContent={mediaModerationSetting}
      >
        <div className="row g-3">

          <div className="col-12 col-md-6">
            <FormField
              label="Sightengine User"
              name="sightengineUser"
              value={settings.sightengineUser}
              placeholder="Sightengine User"
              onChange={(e) =>
                setSettings({ ...settings, sightengineUser: e.target.value })
              }
            />
          </div>

          <div className="col-12 col-md-6">
            <FormField
              label="Sightengine Secret"
              name="sightengineSecret"
              value={settings.sightengineSecret}
              placeholder="Sightengine Secret"
              onChange={(e) =>
                setSettings({ ...settings, sightengineSecret: e.target.value })
              }
            />
          </div>

          <div className="col-12 col-md-6">
            <MultiSelectDropdown
              label="Video Moderation"
              options={moderationOptions.map((o) => o.name)}
              value={settings.videoModerationCategories.map((c) => c.name)}
              onChange={(values) => {
                const selected = moderationOptions.filter((o) => values.includes(o.name));
                setSettings({ ...settings, videoModerationCategories: selected });
              }}
            />
          </div>

          <div className="col-12 col-md-6">
            <MultiSelectDropdown
              label="Image Moderation"
              options={moderationOptions.map((o) => o.name)}
              value={settings.imageModerationCategories.map((c) => c.name)}
              onChange={(values) => {
                const selected = moderationOptions.filter((o) => values.includes(o.name));
                setSettings({ ...settings, imageModerationCategories: selected });
              }}
            />
          </div>
        </div>
      </SettingsCard>

      {/* Switches */}
      <SettingsCard
        title="Feature Toggles"
        description="Enable or disable specific features"
        icon={<Sparkles size={18} />}
        tooltipTitle="Fake Data Setting"
        tooltipContent={featureToggleSetting}
      >
        <div className="row g-3">
          <div className={styles.switchItem}>
            <div className={styles.switchInfo}>
              <Label>Fake Data</Label>
              <p className={styles.switchDesc}>Enable/disable fake data generation</p>
            </div>
            <Switch
              checked={settings.isFakeData}
              onCheckedChange={(checked) => {
                setSettings({ ...settings, isFakeData: checked });
                if (settingData?._id) {
                  dispatch(settingSwitch({ settingId: settingData._id, type: "isFakeData" } as any));
                }
              }}
              disabled={!canEdit}
            />
          </div>

          <div className={styles.switchItem}>
            <div className={styles.switchInfo}>
              <Label>Effects State</Label>
              <p className={styles.switchDesc}>Enable/disable video effects</p>
            </div>
            <Switch
              checked={settings.isEffectActive}
              onCheckedChange={(checked) => {
                setSettings({ ...settings, isEffectActive: checked });
                if (settingData?._id) {
                  dispatch(settingSwitch({ settingId: settingData._id, type: "isEffectActive" } as any));
                }
              }}
              disabled={!canEdit}
            />
          </div>
        </div>
      </SettingsCard>

      {/* Firebase */}
      <SettingsCard
        title="Firebase Notification"
        description="Firebase cloud messaging settings"
        icon={<Bell size={18} />}
        tooltipTitle="Firebase Notification Setup"
        tooltipContent={firebaseNotificationSetting}
      >
        <Textarea
          value={settings.firebaseJson}
          onChange={(e) =>
            setSettings({ ...settings, firebaseJson: e.target.value })
          }
          className={styles.textarea}
          placeholder="Paste your Firebase private key JSON here"
        />
      </SettingsCard>

      {/* Deeplink Setting */}
      <SettingsCard
        title="Deeplink Setting"
        description="Configure deep linking for Android and iOS"
        icon={<LinkIcon size={18} />}
        tooltipTitle="Deeplink Setting"
        tooltipContent={deeplinkSettingContent}
      >
        <div className="row g-3">
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Label className={styles.label}>Android Asset Links</Label>
            <Textarea
              value={settings.androidAssetLinks}
              onChange={(e) =>
                setSettings({ ...settings, androidAssetLinks: e.target.value })
              }
              className={styles.textarea}
              placeholder="Paste Android JSON array"
              style={{ minHeight: "200px" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Label className={styles.label}>Apple AppSite Association</Label>
            <Textarea
              value={settings.appleAppSiteAssociation}
              onChange={(e) =>
                setSettings({ ...settings, appleAppSiteAssociation: e.target.value })
              }
              className={styles.textarea}
              placeholder="Paste Apple JSON object"
              style={{ minHeight: "200px" }}
            />
          </div>
        </div>
      </SettingsCard>

      {/* Save */}
      {canEdit &&
        <div className={styles.saveRow}>
          <Button size="lg" onClick={handleSave}>Save Changes</Button>
        </div>
      }
    </div>
  );
};

export default GlobalSettings;