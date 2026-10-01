"use client";

import { useState, ChangeEvent, useEffect } from "react";
import styles from "../../styles/AdsSettings.module.css";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { getSetting, updateSetting, adSettingSwitch } from "@/store/settingSlice";
import { permissionError } from "@/util/Alert";
import { setToast } from "@/util/toastServices";

import SettingsCard from "../ui/SettingsCard";
import FormField from "../ui/FormField";
import Button from "../ui/button";
import Switch from "../ui/switch";
import Label from "../ui/label";
import Badge from "../ui/Badge";
import Input from "../ui/input";

import {
  globalAdsContent,
  adPositionContent,
  androidAdsContent,
  iosAdsContent,
  adFrequencyContent,
} from "@/extra/infoContent";

import {
  Megaphone,
  Smartphone,
  Apple,
  ToggleLeft,
  Gauge,
} from "lucide-react";
import { usePermission } from "@/hooks/usePermission";

interface AdPositions {
  isVideoAdEnabled: boolean;
  isFeedAdEnabled: boolean;
  isChatAdEnabled: boolean;
  isLiveStreamBackButtonAdEnabled: boolean;
  isChatBackButtonAdEnabled: boolean;
}

interface PlatformAds {
  interstitial: string;
  native: string;
  nativeVideo: string;
}

const AdsSettings = () => {
  const dispatch = useAppDispatch();
  const { settingData } = useSelector((state: RootStore) => state.setting);

  const { can } = usePermission();
  const canEdit = can("Setting", "Edit");

  const [isGoogle, setIsGoogle] = useState<boolean>(false);
  const [adPositions, setAdPositions] = useState<AdPositions>({
    isVideoAdEnabled: false,
    isFeedAdEnabled: false,
    isChatAdEnabled: false,
    isLiveStreamBackButtonAdEnabled: false,
    isChatBackButtonAdEnabled: false,
  });

  const [androidAds, setAndroidAds] = useState<PlatformAds>({
    interstitial: "",
    native: "",
    nativeVideo: "",
  });

  const [iosAds, setIosAds] = useState<PlatformAds>({
    interstitial: "",
    native: "",
    nativeVideo: "",
  });

  const [frequency, setFrequency] = useState<number>(3);
  const [initialValues, setInitialValues] = useState<any>({});

  useEffect(() => {
    dispatch(getSetting({} as any));
  }, [dispatch]);

  useEffect(() => {
    if (settingData) {
      const newState = {
        isGoogle: settingData.isGoogle || false,
        adPositions: {
          isVideoAdEnabled: settingData.isVideoAdEnabled || false,
          isFeedAdEnabled: settingData.isFeedAdEnabled || false,
          isChatAdEnabled: settingData.isChatAdEnabled || false,
          isLiveStreamBackButtonAdEnabled: settingData.isLiveStreamBackButtonAdEnabled || false,
          isChatBackButtonAdEnabled: settingData.isChatBackButtonAdEnabled || false,
        },
        androidAds: {
          interstitial: settingData.android?.google?.interstitial || "",
          native: settingData.android?.google?.native || "",
          nativeVideo: settingData.android?.google?.nativeAdVideo || "",
        },
        iosAds: {
          interstitial: settingData.ios?.google?.interstitial || "",
          native: settingData.ios?.google?.native || "",
          nativeVideo: settingData.ios?.google?.nativeAdVideo || "",
        },
        frequency: settingData.adDisplayIndex || 3,
      };
      setIsGoogle(newState.isGoogle);
      setAdPositions(newState.adPositions);
      setAndroidAds(newState.androidAds);
      setIosAds(newState.iosAds);
      setFrequency(newState.frequency);
      setInitialValues(newState);
    }
  }, [settingData]);

  const handleSwitchChange = (type: string) => {

    dispatch(adSettingSwitch({ settingId: settingData?._id, type } as any));
  };

  const handleSave = () => {


    const changedData: any = {};
    let hasChanges = false;

    if (androidAds.interstitial !== initialValues.androidAds.interstitial) changedData.androidGoogleInterstitial = androidAds.interstitial;
    if (androidAds.native !== initialValues.androidAds.native) changedData.androidGoogleNative = androidAds.native;
    if (androidAds.nativeVideo !== initialValues.androidAds.nativeVideo) changedData.androidGoogleNativeAdVideo = androidAds.nativeVideo;

    if (iosAds.interstitial !== initialValues.iosAds.interstitial) changedData.iosGoogleInterstitial = iosAds.interstitial;
    if (iosAds.native !== initialValues.iosAds.native) changedData.iosGoogleNative = iosAds.native;
    if (iosAds.nativeVideo !== initialValues.iosAds.nativeVideo) changedData.iosGoogleNativeAdVideo = iosAds.nativeVideo;

    if (frequency !== initialValues.frequency) changedData.adDisplayIndex = frequency;

    if (Object.keys(changedData).length > 0) {
      hasChanges = true;
      dispatch(updateSetting({ data: changedData, settingId: settingData?._id } as any));
    }

    if (!hasChanges) {
      setToast("info", "No changes detected.");
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Global Ads */}
      <SettingsCard
        tooltipTitle="Global Ads Setting"
        tooltipContent={globalAdsContent}
      >
        <div className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <div className={styles.iconCircle}>
              <Megaphone size={24} />
            </div>

            <div>
              <h3 className={styles.title}>Google Ads</h3>
              <p className={styles.subtitle}>
                Master control for all ad placements
              </p>
            </div>
          </div>

          <div className={styles.switchArea}>
            <Switch
              checked={isGoogle}
              onCheckedChange={() => {
                setIsGoogle(!isGoogle);
                handleSwitchChange("isGoogle");
              }}
            />
          </div>
        </div>
      </SettingsCard>

      {/* Ad Position */}
      <SettingsCard
        title="Ads switch setting"
        description="Control ad placement positions"
        icon={<ToggleLeft size={20} />}
        tooltipTitle="Ad Position Setting"
        tooltipContent={adPositionContent}
      >
        <div className={styles.switchList}>
          <div className={styles.switchRow}>
            <Label>Ad position in video</Label>
            <Switch
              checked={adPositions.isVideoAdEnabled}
              onCheckedChange={() => {
                setAdPositions({ ...adPositions, isVideoAdEnabled: !adPositions.isVideoAdEnabled });
                handleSwitchChange("isVideoAdEnabled");
              }}
            />
          </div>
          <div className={styles.switchRow}>
            <Label>Ad position in Feed</Label>
            <Switch
              checked={adPositions.isFeedAdEnabled}
              onCheckedChange={() => {
                setAdPositions({ ...adPositions, isFeedAdEnabled: !adPositions.isFeedAdEnabled });
                handleSwitchChange("isFeedAdEnabled");
              }}
            />
          </div>
          <div className={styles.switchRow}>
            <Label>Ad position in chat</Label>
            <Switch
              checked={adPositions.isChatAdEnabled}
              onCheckedChange={() => {
                setAdPositions({ ...adPositions, isChatAdEnabled: !adPositions.isChatAdEnabled });
                handleSwitchChange("isChatAdEnabled");
              }}
            />
          </div>
          <div className={styles.switchRow}>
            <Label>Live streaming back button ad</Label>
            <Switch
              checked={adPositions.isLiveStreamBackButtonAdEnabled}
              onCheckedChange={() => {
                setAdPositions({ ...adPositions, isLiveStreamBackButtonAdEnabled: !adPositions.isLiveStreamBackButtonAdEnabled });
                handleSwitchChange("isLiveStreamBackButtonAdEnabled");
              }}
            />
          </div>
          <div className={styles.switchRow}>
            <Label>Chat back button ads</Label>
            <Switch
              checked={adPositions.isChatBackButtonAdEnabled}
              onCheckedChange={() => {
                setAdPositions({ ...adPositions, isChatBackButtonAdEnabled: !adPositions.isChatBackButtonAdEnabled });
                handleSwitchChange("isChatBackButtonAdEnabled");
              }}
            />
          </div>
        </div>
      </SettingsCard>

      {/* Android + IOS */}
      <div className="row g-4">
        {/* Android */}
        <div className="col-12 col-md-6">
          <SettingsCard
            title="Android Ads Configuration"
            description="Configure Google AdMob for Android"
            icon={<Smartphone size={20} />}
            tooltipTitle="Android Ads Setting"
            tooltipContent={androidAdsContent}
          >
            <div className={styles.cardBody}>
              <FormField
                label="Interstitial Ad ID"
                name="android_interstitial"
                value={androidAds.interstitial}
                placeholder="Android Interstitial ID"
                onChange={(e) =>
                  setAndroidAds({
                    ...androidAds,
                    interstitial: e.target.value,
                  })
                }
              />

              <FormField
                label="Native Ad ID"
                name="android_native"
                value={androidAds.native}
                placeholder="Android Native ID"
                onChange={(e) =>
                  setAndroidAds({ ...androidAds, native: e.target.value })
                }
              />

              <FormField
                label="Native Video Ad ID"
                name="android_native_video"
                value={androidAds.nativeVideo}
                placeholder="Android Native Video ID"
                onChange={(e) =>
                  setAndroidAds({ ...androidAds, nativeVideo: e.target.value })
                }
              />
            </div>
          </SettingsCard>
        </div>

        {/* IOS */}
        <div className="col-12 col-md-6">
          <SettingsCard
            title="iOS Ads Configuration"
            description="Configure Google AdMob for iOS"
            icon={<Apple size={20} />}
            tooltipTitle="iOS Ads Setting"
            tooltipContent={iosAdsContent}
          >
            <div className={styles.cardBody}>
              <FormField
                label="Interstitial Ad ID"
                name="ios_interstitial"
                value={iosAds.interstitial}
                placeholder="iOS Interstitial ID"
                onChange={(e) =>
                  setIosAds({
                    ...iosAds,
                    interstitial: e.target.value,
                  })
                }
              />

              <FormField
                label="Native Ad ID"
                name="ios_native"
                value={iosAds.native}
                placeholder="iOS Native ID"
                onChange={(e) =>
                  setIosAds({ ...iosAds, native: e.target.value })
                }
              />

              <FormField
                label="Native Video Ad ID"
                name="ios_native_video"
                value={iosAds.nativeVideo}
                placeholder="iOS Native Video ID"
                onChange={(e) =>
                  setIosAds({ ...iosAds, nativeVideo: e.target.value })
                }
              />
            </div>
          </SettingsCard>
        </div>
      </div>

      {/* Frequency */}
      <SettingsCard
        title="Ad Frequency Control"
        description="Control how often ads appear"
        icon={<Gauge size={20} />}
        tooltipTitle="Ad Frequency Setting"
        tooltipContent={adFrequencyContent}
      >
        <div className={styles.frequencyBox}>
          <Label>Videos between ads</Label>

          <div className={styles.frequencyRow}>
            <Input
              type="number"
              value={frequency}
              min={1}
              placeholder="Ad Frequency"
              onChange={(e) => setFrequency(parseInt(e.target.value) || 1)}
              className={styles.frequencyInput}
            />

            <p className={styles.frequencyText}>
              Show ad after every <b>{frequency}</b> video
              {frequency > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Save */}
      {canEdit && (
        <div className={styles.saveRow}>
          <Button size="lg" onClick={handleSave}>Save Changes</Button>
        </div>
      )}
    </div>
  );
}

export default AdsSettings;