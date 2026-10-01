"use client";

import { useState, useEffect } from "react";
import styles from "../../styles/PaymentSettings.module.css";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { getSetting } from "@/store/settingSlice";
import {
  razorpayContent,
  stripeContent,
  paystackContent,
  cashfreeContent,
  paypalContent,
  flutterWaveContent,
  googlePlayContent,
} from "@/extra/infoContent";
import InfoTooltip from "@/extra/InfoTooltip";

import SettingsCard from "../ui/SettingsCard";
import FormField from "../ui/FormField";
import Button from "../ui/button";
import Switch from "../ui/switch";
import LicenseDialog from "../ui/LicenseDialog";

import { Smartphone, Apple, Globe, CreditCard, DollarSign } from "lucide-react";

interface PaymentState {
  enabled: boolean;
  androidEnabled: boolean;
  iosEnabled: boolean;
  [key: string]: any;
}

/* Transparent overlay placed on top of a switch to intercept clicks */
const SwitchOverlay = ({ onClick }: { onClick: () => void }) => (
  <div
    onClick={onClick}
    style={{
      position: "absolute",
      inset: 0,
      zIndex: 10,
      cursor: "pointer",
    }}
  />
);

const PaymentSettings = () => {
  const dispatch = useAppDispatch();
  const { settingData } = useSelector((state: RootStore) => state.setting);

  const [licenseOpen, setLicenseOpen] = useState(false);
  const showLicense = () => setLicenseOpen(true);

  const [razorPay, setRazorPay] = useState<PaymentState>({
    enabled: false, androidEnabled: false, iosEnabled: false,
    razorpayWebEnabled: false, razorPayId: "", razorSecretKey: "",
  });
  const [stripe, setStripe] = useState<PaymentState>({
    enabled: false, androidEnabled: false, iosEnabled: false,
    stripeWebEnabled: false, stripePublishableKey: "", stripeSecretKey: "",
  });
  const [paystack, setPaystack] = useState<PaymentState>({
    enabled: false, androidEnabled: false, iosEnabled: false,
    paystackWebEnabled: false, paystackPublicKey: "", paystackSecretKey: "",
  });
  const [cashfree, setCashfree] = useState<PaymentState>({
    enabled: false, androidEnabled: false, iosEnabled: false,
    cashfreeWebEnabled: false, cashfreeClientId: "", cashfreeClientSecret: "",
  });
  const [paypal, setPaypal] = useState<PaymentState>({
    enabled: false, androidEnabled: false, iosEnabled: false,
    paypalWebEnabled: false, paypalClientId: "", paypalSecretKey: "",
  });
  const [flutterwave, setFlutterwave] = useState<PaymentState>({
    enabled: false, androidEnabled: false, iosEnabled: false,
    flutterwaveWebEnabled: false, flutterWaveId: "",
  });
  const [googlePlay, setGooglePlay] = useState<PaymentState>({
    enabled: false, androidEnabled: false, iosEnabled: false,
  });

  useEffect(() => {
    dispatch(getSetting({} as any));
  }, [dispatch]);

  useEffect(() => {
    if (!settingData) return;
    setRazorPay({
      enabled: settingData.razorPaySwitch || settingData.razorpayIosEnabled || settingData.razorpayWebEnabled || false,
      androidEnabled: settingData.razorPaySwitch || false,
      iosEnabled: settingData.razorpayIosEnabled || false,
      razorpayWebEnabled: settingData.razorpayWebEnabled || false,
      razorPayId: settingData.razorPayId || "",
      razorSecretKey: settingData.razorSecretKey || "",
    });
    setStripe({
      enabled: settingData.stripeSwitch || settingData.stripeIosEnabled || settingData.stripeWebEnabled || false,
      androidEnabled: settingData.stripeSwitch || false,
      iosEnabled: settingData.stripeIosEnabled || false,
      stripeWebEnabled: settingData.stripeWebEnabled || false,
      stripePublishableKey: settingData.stripePublishableKey || "",
      stripeSecretKey: settingData.stripeSecretKey || "",
    });
    setPaystack({
      enabled: settingData.paystackAndroidEnabled || settingData.paystackIosEnabled || settingData.paystackWebEnabled || false,
      androidEnabled: settingData.paystackAndroidEnabled || false,
      iosEnabled: settingData.paystackIosEnabled || false,
      paystackWebEnabled: settingData.paystackWebEnabled || false,
      paystackPublicKey: settingData.paystackPublicKey || "",
      paystackSecretKey: settingData.paystackSecretKey || "",
    });
    setCashfree({
      enabled: settingData.cashfreeAndroidEnabled || settingData.cashfreeIosEnabled || settingData.cashfreeWebEnabled || false,
      androidEnabled: settingData.cashfreeAndroidEnabled || false,
      iosEnabled: settingData.cashfreeIosEnabled || false,
      cashfreeWebEnabled: settingData.cashfreeWebEnabled || false,
      cashfreeClientId: settingData.cashfreeClientId || "",
      cashfreeClientSecret: settingData.cashfreeClientSecret || "",
    });
    setPaypal({
      enabled: settingData.paypalAndroidEnabled || settingData.paypalIosEnabled || settingData.paypalWebEnabled || false,
      androidEnabled: settingData.paypalAndroidEnabled || false,
      iosEnabled: settingData.paypalIosEnabled || false,
      paypalWebEnabled: settingData.paypalWebEnabled || false,
      paypalClientId: settingData.paypalClientId || "",
      paypalSecretKey: settingData.paypalSecretKey || "",
    });
    setFlutterwave({
      enabled: settingData.flutterWaveSwitch || settingData.flutterwaveIosEnabled || settingData.flutterwaveWebEnabled || false,
      androidEnabled: settingData.flutterWaveSwitch || false,
      iosEnabled: settingData.flutterwaveIosEnabled || false,
      flutterwaveWebEnabled: settingData.flutterwaveWebEnabled || false,
      flutterWaveId: settingData.flutterWaveId || "",
    });
    setGooglePlay({
      enabled: settingData.googlePlaySwitch || settingData.googlePayIosEnabled || false,
      androidEnabled: settingData.googlePlaySwitch || false,
      iosEnabled: settingData.googlePayIosEnabled || false,
    });
  }, [settingData]);

  return (
    <>
      <LicenseDialog open={licenseOpen} onClose={() => setLicenseOpen(false)} />

      <div className={styles.wrapper}>
        <div className="row g-4">

          {/* Razorpay */}
          <div className="col-12 col-lg-6">
            <SettingsCard>
              <div className={styles.gatewayWrapper}>
                <div className={styles.gatewayHeader}>
                  <div className={styles.gatewayInfo}>
                    <div className={styles.logoBox}><CreditCard size={24} /></div>
                    <div>
                      <h3 className={styles.gatewayTitle}>Razorpay</h3>
                      <p className={styles.gatewayDesc}>Payment gateway for India</p>
                    </div>
                  </div>
                  <InfoTooltip title="Razorpay Setting" content={razorpayContent} />
                </div>
                <div className={styles.gatewayBody}>
                  <div className={styles.platformGrid}>
                    <div className={styles.platformCard} style={{ position: "relative" }}>
                      <div className={styles.platformInfo}><Smartphone size={16} /> Android</div>
                      <Switch checked={razorPay.androidEnabled} onCheckedChange={() => { }} className={styles.smallToggle} />
                      <SwitchOverlay onClick={showLicense} />
                    </div>
                    <div className={styles.platformCard} style={{ position: "relative" }}>
                      <div className={styles.platformInfo}><Apple size={16} /> iOS</div>
                      <Switch checked={razorPay.iosEnabled} onCheckedChange={() => { }} className={styles.smallToggle} />
                      <SwitchOverlay onClick={showLicense} />
                    </div>
                    <div className={styles.platformCard} style={{ position: "relative" }}>
                      <div className={styles.platformInfo}><Globe size={16} /> Web</div>
                      <Switch checked={razorPay.razorpayWebEnabled} onCheckedChange={() => { }} className={styles.smallToggle} />
                      <SwitchOverlay onClick={showLicense} />
                    </div>
                  </div>
                  <div className={styles.formArea}>
                    <FormField label="Razorpay Key" name="razorPayId" value={razorPay.razorPayId} placeholder="Razorpay Key" readOnly onFocus={showLicense} onChange={() => { }} />
                    <FormField label="Secret Key" name="razorSecretKey" value={razorPay.razorSecretKey} placeholder="Razorpay Secret Key" readOnly onFocus={showLicense} onChange={() => { }} />
                  </div>
                </div>
              </div>
            </SettingsCard>
          </div>

          {/* Stripe */}
          <div className="col-12 col-lg-6">
            <SettingsCard>
              <div className={styles.gatewayWrapper}>
                <div className={styles.gatewayHeader}>
                  <div className={styles.gatewayInfo}>
                    <div className={styles.logoBox}><DollarSign size={24} /></div>
                    <div>
                      <h3 className={styles.gatewayTitle}>Stripe</h3>
                      <p className={styles.gatewayDesc}>Global payment gateway</p>
                    </div>
                  </div>
                  <InfoTooltip title="Stripe Setting" content={stripeContent} />
                </div>
                <div className={styles.gatewayBody}>
                  <div className={styles.platformGrid}>
                    <div className={styles.platformCard} style={{ position: "relative" }}>
                      <div className={styles.platformInfo}><Smartphone size={16} /> Android</div>
                      <Switch checked={stripe.androidEnabled} onCheckedChange={() => { }} className={styles.smallToggle} />
                      <SwitchOverlay onClick={showLicense} />
                    </div>
                    <div className={styles.platformCard} style={{ position: "relative" }}>
                      <div className={styles.platformInfo}><Apple size={16} /> iOS</div>
                      <Switch checked={stripe.iosEnabled} onCheckedChange={() => { }} className={styles.smallToggle} />
                      <SwitchOverlay onClick={showLicense} />
                    </div>
                    <div className={styles.platformCard} style={{ position: "relative" }}>
                      <div className={styles.platformInfo}><Globe size={16} /> Web</div>
                      <Switch checked={stripe.stripeWebEnabled} onCheckedChange={() => { }} className={styles.smallToggle} />
                      <SwitchOverlay onClick={showLicense} />
                    </div>
                  </div>
                  <div className={styles.formArea}>
                    <FormField label="Publishable Key" name="stripePublishableKey" value={stripe.stripePublishableKey} placeholder="Stripe Publishable Key" readOnly onFocus={showLicense} onChange={() => { }} />
                    <FormField label="Secret Key" name="stripeSecretKey" value={stripe.stripeSecretKey} placeholder="Stripe Secret Key" readOnly onFocus={showLicense} onChange={() => { }} />
                  </div>
                </div>
              </div>
            </SettingsCard>
          </div>

          {/* Paystack */}
          <div className="col-12 col-lg-6">
            <SettingsCard>
              <div className={styles.gatewayWrapper}>
                <div className={styles.gatewayHeader}>
                  <div className={styles.gatewayInfo}>
                    <div className={styles.logoBox}><CreditCard size={24} /></div>
                    <div>
                      <h3 className={styles.gatewayTitle}>Paystack</h3>
                      <p className={styles.gatewayDesc}>African payment gateway</p>
                    </div>
                  </div>
                  <InfoTooltip title="Paystack Setting" content={paystackContent} />
                </div>
                <div className={styles.gatewayBody}>
                  <div className={styles.platformGrid}>
                    <div className={styles.platformCard} style={{ position: "relative" }}>
                      <div className={styles.platformInfo}><Smartphone size={16} /> Android</div>
                      <Switch checked={paystack.androidEnabled} onCheckedChange={() => { }} className={styles.smallToggle} />
                      <SwitchOverlay onClick={showLicense} />
                    </div>
                    <div className={styles.platformCard} style={{ position: "relative" }}>
                      <div className={styles.platformInfo}><Apple size={16} /> iOS</div>
                      <Switch checked={paystack.iosEnabled} onCheckedChange={() => { }} className={styles.smallToggle} />
                      <SwitchOverlay onClick={showLicense} />
                    </div>
                    <div className={styles.platformCard} style={{ position: "relative" }}>
                      <div className={styles.platformInfo}><Globe size={16} /> Web</div>
                      <Switch checked={paystack.paystackWebEnabled} onCheckedChange={() => { }} className={styles.smallToggle} />
                      <SwitchOverlay onClick={showLicense} />
                    </div>
                  </div>
                  <div className={styles.formArea}>
                    <FormField label="Public Key" name="paystackPublicKey" value={paystack.paystackPublicKey} placeholder="Paystack Public Key" readOnly onFocus={showLicense} onChange={() => { }} />
                    <FormField label="Secret Key" name="paystackSecretKey" value={paystack.paystackSecretKey} placeholder="Paystack Secret Key" readOnly onFocus={showLicense} onChange={() => { }} />
                  </div>
                </div>
              </div>
            </SettingsCard>
          </div>

          {/* Cashfree */}
          <div className="col-12 col-lg-6">
            <SettingsCard>
              <div className={styles.gatewayWrapper}>
                <div className={styles.gatewayHeader}>
                  <div className={styles.gatewayInfo}>
                    <div className={styles.logoBox}><CreditCard size={24} /></div>
                    <div>
                      <h3 className={styles.gatewayTitle}>Cashfree</h3>
                      <p className={styles.gatewayDesc}>Payment and API banking</p>
                    </div>
                  </div>
                  <InfoTooltip title="Cashfree Setting" content={cashfreeContent} />
                </div>
                <div className={styles.gatewayBody}>
                  <div className={styles.platformGrid}>
                    <div className={styles.platformCard} style={{ position: "relative" }}>
                      <div className={styles.platformInfo}><Smartphone size={16} /> Android</div>
                      <Switch checked={cashfree.androidEnabled} onCheckedChange={() => { }} className={styles.smallToggle} />
                      <SwitchOverlay onClick={showLicense} />
                    </div>
                    <div className={styles.platformCard} style={{ position: "relative" }}>
                      <div className={styles.platformInfo}><Apple size={16} /> iOS</div>
                      <Switch checked={cashfree.iosEnabled} onCheckedChange={() => { }} className={styles.smallToggle} />
                      <SwitchOverlay onClick={showLicense} />
                    </div>
                    <div className={styles.platformCard} style={{ position: "relative" }}>
                      <div className={styles.platformInfo}><Globe size={16} /> Web</div>
                      <Switch checked={cashfree.cashfreeWebEnabled} onCheckedChange={() => { }} className={styles.smallToggle} />
                      <SwitchOverlay onClick={showLicense} />
                    </div>
                  </div>
                  <div className={styles.formArea}>
                    <FormField label="Client ID" name="cashfreeClientId" value={cashfree.cashfreeClientId} placeholder="Cashfree Client ID" readOnly onFocus={showLicense} onChange={() => { }} />
                    <FormField label="Client Secret" name="cashfreeClientSecret" value={cashfree.cashfreeClientSecret} placeholder="Cashfree Client Secret" readOnly onFocus={showLicense} onChange={() => { }} />
                  </div>
                </div>
              </div>
            </SettingsCard>
          </div>

          {/* PayPal */}
          <div className="col-12 col-lg-6">
            <SettingsCard>
              <div className={styles.gatewayWrapper}>
                <div className={styles.gatewayHeader}>
                  <div className={styles.gatewayInfo}>
                    <div className={styles.logoBox}><CreditCard size={24} /></div>
                    <div>
                      <h3 className={styles.gatewayTitle}>PayPal</h3>
                      <p className={styles.gatewayDesc}>Global online payments</p>
                    </div>
                  </div>
                  <InfoTooltip title="PayPal Setting" content={paypalContent} />
                </div>
                <div className={styles.gatewayBody}>
                  <div className={styles.platformGrid}>
                    <div className={styles.platformCard} style={{ position: "relative" }}>
                      <div className={styles.platformInfo}><Smartphone size={16} /> Android</div>
                      <Switch checked={paypal.androidEnabled} onCheckedChange={() => { }} className={styles.smallToggle} />
                      <SwitchOverlay onClick={showLicense} />
                    </div>
                    <div className={styles.platformCard} style={{ position: "relative" }}>
                      <div className={styles.platformInfo}><Apple size={16} /> iOS</div>
                      <Switch checked={paypal.iosEnabled} onCheckedChange={() => { }} className={styles.smallToggle} />
                      <SwitchOverlay onClick={showLicense} />
                    </div>
                    <div className={styles.platformCard} style={{ position: "relative" }}>
                      <div className={styles.platformInfo}><Globe size={16} /> Web</div>
                      <Switch checked={paypal.paypalWebEnabled} onCheckedChange={() => { }} className={styles.smallToggle} />
                      <SwitchOverlay onClick={showLicense} />
                    </div>
                  </div>
                  <div className={styles.formArea}>
                    <FormField label="Client ID" name="paypalClientId" value={paypal.paypalClientId} placeholder="PayPal Client ID" readOnly onFocus={showLicense} onChange={() => { }} />
                    <FormField label="Secret Key" name="paypalSecretKey" value={paypal.paypalSecretKey} placeholder="PayPal Secret Key" readOnly onFocus={showLicense} onChange={() => { }} />
                  </div>
                </div>
              </div>
            </SettingsCard>
          </div>

          {/* Flutterwave */}
          <div className="col-12 col-lg-6">
            <SettingsCard>
              <div className={styles.gatewayWrapper}>
                <div className={styles.gatewayHeader}>
                  <div className={styles.gatewayInfo}>
                    <div className={styles.logoBox}><CreditCard size={24} /></div>
                    <div>
                      <h3 className={styles.gatewayTitle}>Flutterwave</h3>
                      <p className={styles.gatewayDesc}>Payment infrastructure</p>
                    </div>
                  </div>
                  <InfoTooltip title="Flutterwave Setting" content={flutterWaveContent} />
                </div>
                <div className={styles.gatewayBody}>
                  <div className={styles.platformGrid}>
                    <div className={styles.platformCard} style={{ position: "relative" }}>
                      <div className={styles.platformInfo}><Smartphone size={16} /> Android</div>
                      <Switch checked={flutterwave.androidEnabled} onCheckedChange={() => { }} className={styles.smallToggle} />
                      <SwitchOverlay onClick={showLicense} />
                    </div>
                    <div className={styles.platformCard} style={{ position: "relative" }}>
                      <div className={styles.platformInfo}><Apple size={16} /> iOS</div>
                      <Switch checked={flutterwave.iosEnabled} onCheckedChange={() => { }} className={styles.smallToggle} />
                      <SwitchOverlay onClick={showLicense} />
                    </div>
                    <div className={styles.platformCard} style={{ position: "relative" }}>
                      <div className={styles.platformInfo}><Globe size={16} /> Web</div>
                      <Switch checked={flutterwave.flutterwaveWebEnabled} onCheckedChange={() => { }} className={styles.smallToggle} />
                      <SwitchOverlay onClick={showLicense} />
                    </div>
                  </div>
                  <div className={styles.formArea}>
                    <FormField label="Flutterwave ID" name="flutterWaveId" value={flutterwave.flutterWaveId} placeholder="Flutterwave ID" readOnly onFocus={showLicense} onChange={() => { }} />
                  </div>
                </div>
              </div>
            </SettingsCard>
          </div>

          {/* Google Play */}
          <div className="col-12 col-lg-6">
            <SettingsCard>
              <div className={styles.gatewayWrapper}>
                <div className={styles.gatewayHeader}>
                  <div className={styles.gatewayInfo}>
                    <div className={styles.logoBox}><CreditCard size={24} /></div>
                    <div>
                      <h3 className={styles.gatewayTitle}>Google Play In-App Review</h3>
                      <p className={styles.gatewayDesc}>In-App purchases</p>
                    </div>
                  </div>
                  <InfoTooltip title="Google Play Setting" content={googlePlayContent} />
                </div>
                <div className={styles.gatewayBody}>
                  <div className={styles.platformGrid}>
                    <div className={styles.platformCard} style={{ position: "relative" }}>
                      <div className={styles.platformInfo}><Smartphone size={16} /> Android</div>
                      <Switch checked={googlePlay.androidEnabled} onCheckedChange={() => { }} className={styles.smallToggle} />
                      <SwitchOverlay onClick={showLicense} />
                    </div>
                    <div className={styles.platformCard} style={{ position: "relative" }}>
                      <div className={styles.platformInfo}><Apple size={16} /> iOS</div>
                      <Switch checked={googlePlay.iosEnabled} onCheckedChange={() => { }} className={styles.smallToggle} />
                      <SwitchOverlay onClick={showLicense} />
                    </div>
                  </div>
                </div>
              </div>
            </SettingsCard>
          </div>

        </div>

        {/* Save */}
        <div className={styles.saveRow}>
          <Button size="lg" onClick={showLicense}>Save Changes</Button>
        </div>
      </div>
    </>
  );
};

export default PaymentSettings;