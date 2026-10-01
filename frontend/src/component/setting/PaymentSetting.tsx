import Button from "@/extra/Button";
import useClearSessionStorageOnPopState from "@/extra/ClearStorage";
import Input from "@/extra/Input";
import { getSetting, settingSwitch, updateSetting } from "@/store/settingSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { permissionError } from "@/util/Alert";
import { useTheme } from "@emotion/react";
import { FormControlLabel, Switch, styled } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import InfoTooltip from '../../extra/InfoTooltip';
import { flutterWaveContent, googlePlayContent, razorpayContent, stripeContent, paystackContent, paypalContent, cashfreeContent } from '../../extra/infoContent'
import { setToast } from "@/util/toastServices";

const MaterialUISwitch = styled(Switch)<{ theme: ThemeType }>(({ theme }) => ({
  width: "67px",
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    top: "8px",
    transform: "translateX(10px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(40px)",
      top: "8px",
      "& .MuiSwitch-thumb:before": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M16.5992 5.06724L16.5992 5.06719C16.396 4.86409 16.1205 4.75 15.8332 4.75C15.546 4.75 15.2705 4.86409 15.0673 5.06719L15.0673 5.06721L7.91657 12.2179L4.93394 9.23531C4.83434 9.13262 4.71537 9.05067 4.58391 8.9942C4.45174 8.93742 4.30959 8.90754 4.16575 8.90629C4.0219 8.90504 3.87925 8.93245 3.74611 8.98692C3.61297 9.04139 3.49202 9.12183 3.3903 9.22355C3.28858 9.32527 3.20814 9.44622 3.15367 9.57936C3.0992 9.7125 3.07179 9.85515 3.07304 9.99899C3.07429 10.1428 3.10417 10.285 3.16095 10.4172C3.21742 10.5486 3.29937 10.6676 3.40205 10.7672L7.15063 14.5158L7.15066 14.5158C7.35381 14.7189 7.62931 14.833 7.91657 14.833C8.20383 14.833 8.47933 14.7189 8.68249 14.5158L8.68251 14.5158L16.5992 6.5991L16.5992 6.59907C16.8023 6.39592 16.9164 6.12042 16.9164 5.83316C16.9164 5.54589 16.8023 5.27039 16.5992 5.06724Z" fill="white" stroke="white" strokeWidth="0.5"/></svg>')`,
      },
    },
    "& + .MuiSwitch-track": {
      opacity: 1,
      backgroundColor: theme === "dark" ? "#8796A5" : "#FCF3F4 !important",
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: theme === "dark" ? "#0FB515" : "red",
    width: 24,
    height: 24,
    "&:before": {
      content: "''",
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M14.1665 5.83301L5.83325 14.1663" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><path d="M5.83325 5.83301L14.1665 14.1663" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>')`,
    },
  },
  "& .MuiSwitch-track": {
    borderRadius: "52px",
    border: "0.5px solid rgba(0, 0, 0, 0.14)",
    background: " #FFEDF0",
    boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.08) inset",
    opacity: 1,
    width: "79px",
    height: "28px",
  },
}));

interface SettingData {
  // Define types for setting data
  privacyPolicyLink?: string;
  privacyPolicyText?: string;
  agoraKey?: string;
  zegoAppSignIn?: string;
  adminCommissionOfPaidChannel?: number;
  adminCommissionOfPaidVideo?: number;
  durationOfShorts?: number;
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  razorPayId?: string;
  razorSecretKey?: string;
}

type ThemeType = "dark" | "light";
const PaymentSetting = () => {
  const { settingData } = useSelector((state: RootStore) => state.setting);


  const dispatch = useAppDispatch();



  const [data, setData] = useState<SettingData>();

  const [stripePublishableKey, setStripePublishableKey] = useState<string>();
  const [stripeSecretKey, setStripeSecretKey] = useState<string>();
  const [razorPayId, setRazorPayId] = useState<string>();
  const [razorSecretKey, setRazorSecretKey] = useState<string>();
  const [stripeAndroidEnabled, setStripeAndroidEnabled] = useState<boolean>();
  const [stripeIosEnabled, setStripeIosEnabled] = useState<boolean>();
  const [razorpayAndroidEnabled, setRazorpayAndroidEnabled] = useState<boolean>();
  const [razorpayIosEnabled, setRazorpayIosEnabled] = useState<boolean>();
  const [googlePlayAndroidEnabled, setGooglePlayAndroidEnabled] = useState<boolean>();
  const [googlePlayIosEnabled, setGooglePlayIosEnabled] = useState<boolean>();
  const [flutterWaveId, setFlutterWaveId] = useState<string>();
  const [flutterwaveAndroidEnabled, setFlutterwaveAndroidEnabled] = useState<boolean>();
  const [flutterwaveIosEnabled, setFlutterwaveIosEnabled] = useState<boolean>();
  const [paystackPublicKey, setPaystackPublicKey] = useState<string>();
  const [paystackSecretKey, setPaystackSecretKey] = useState<string>();
  const [paystackAndroidEnabled, setPaystackAndroidEnabled] = useState<boolean>();
  const [paystackIosEnabled, setPaystackIosEnabled] = useState<boolean>();
  const [cashfreeClientId, setCashfreeClientId] = useState<string>();
  const [cashfreeClientSecret, setCashfreeClientSecret] = useState<string>();
  const [cashfreeAndroidEnabled, setCashfreeAndroidEnabled] = useState<boolean>();
  const [cashfreeIosEnabled, setCashfreeIosEnabled] = useState<boolean>();
  const [paypalClientId, setPaypalClientId] = useState<string>();
  const [paypalSecretKey, setPaypalSecretKey] = useState<string>();
  const [paypalAndroidEnabled, setPaypalAndroidEnabled] = useState<boolean>();
  const [paypalIosEnabled, setPaypalIosEnabled] = useState<boolean>();
  const [initialValues, setInitialValues] = useState({});
  useClearSessionStorageOnPopState("multiButton");

  const theme: any = useTheme() as ThemeType;

  useEffect(() => {
    setRazorPayId(settingData?.razorPayId);
    setRazorSecretKey(settingData?.razorSecretKey);
    setStripeSecretKey(settingData?.stripeSecretKey);
    setStripePublishableKey(settingData?.stripePublishableKey);
    setStripeAndroidEnabled(settingData?.stripeSwitch);
    setStripeIosEnabled(settingData?.stripeIosEnabled);
    setRazorpayAndroidEnabled(settingData?.razorPaySwitch);
    setRazorpayIosEnabled(settingData?.razorpayIosEnabled);
    setGooglePlayAndroidEnabled(settingData?.googlePlaySwitch);
    setGooglePlayIosEnabled(settingData?.googlePayIosEnabled);
    setFlutterWaveId(settingData?.flutterWaveId);
    setFlutterwaveAndroidEnabled(settingData?.flutterWaveSwitch);
    setFlutterwaveIosEnabled(settingData?.flutterwaveIosEnabled);
    setPaystackPublicKey(settingData?.paystackPublicKey);
    setPaystackSecretKey(settingData?.paystackSecretKey);
    setPaystackAndroidEnabled(settingData?.paystackAndroidEnabled);
    setPaystackIosEnabled(settingData?.paystackIosEnabled);
    setCashfreeClientId(settingData?.cashfreeClientId);
    setCashfreeClientSecret(settingData?.cashfreeClientSecret);
    setCashfreeAndroidEnabled(settingData?.cashfreeAndroidEnabled);
    setCashfreeIosEnabled(settingData?.cashfreeIosEnabled);
    setPaypalClientId(settingData?.paypalClientId);
    setPaypalSecretKey(settingData?.paypalSecretKey);
    setPaypalAndroidEnabled(settingData?.paypalAndroidEnabled);
    setPaypalIosEnabled(settingData?.paypalIosEnabled);
    setInitialValues({
      razorPayId: settingData?.razorPayId,
      razorSecretKey: settingData?.razorSecretKey,
      stripeSecretKey: settingData?.stripeSecretKey,
      stripePublishableKey: settingData?.stripePublishableKey,
      flutterWaveId: settingData?.flutterWaveId,
      paystackPublicKey: settingData?.paystackPublicKey,
      paystackSecretKey: settingData?.paystackSecretKey,
      cashfreeClientId: settingData?.cashfreeClientId,
      cashfreeClientSecret: settingData?.cashfreeClientSecret,
      paypalClientId: settingData?.paypalClientId,
      paypalSecretKey: settingData?.paypalSecretKey,
    });
  }, [settingData]);

  useEffect(() => {
    const payload: any = {};
    dispatch(getSetting(payload));
  }, []);

  const handleChange = (type) => {

    const payload: any = {
      settingId: settingData?._id,
      type: type,
    };
    dispatch(settingSwitch(payload));
  };

  const handleSubmit = () => {
    const currentValues = {
      razorPayId: razorPayId,
      razorSecretKey: razorSecretKey,
      stripeSecretKey: stripeSecretKey,
      stripePublishableKey: stripePublishableKey,
      flutterWaveId: flutterWaveId,
      paystackPublicKey: paystackPublicKey,
      paystackSecretKey: paystackSecretKey,
      cashfreeClientId: cashfreeClientId,
      cashfreeClientSecret: cashfreeClientSecret,
      paypalClientId: paypalClientId,
      paypalSecretKey: paypalSecretKey,
    };

    const changedData: any = {};
    Object.keys(currentValues).forEach(key => {
      if (currentValues[key] !== initialValues[key]) {
        changedData[key] = currentValues[key];
      }
    });

    console.log('Current Values:', currentValues);
    console.log('Initial Values:', initialValues);
    console.log('Changed Data:', changedData);

    if (Object.keys(changedData).length === 0) {
      setToast('error', "No changes detected.");
      return;
    }

    const payload: any = {
      data: changedData,
      settingId: settingData?._id,
    };
    console.log('Payload to updateSetting API:', payload);
    dispatch(updateSetting(payload));
  };
  return (
    <>
      <div className="payment-setting p-0 card1">
        <div className="cardHeader">
          <div className=" align-items-center d-flex flex-wrap justify-content-between p-3">
            <div>
              <p className="m-0 fs-5 fw-medium">
                Payment Setting
              </p>
            </div>
            <Button
              btnName={"Submit"}
              type={"button"}
              onClick={handleSubmit}
              newClass={"submit-btn"}
              style={{
                borderRadius: "0.5rem",
                width: "88px",
                marginLeft: "10px",
              }}
            />

          </div>
        </div>
        <div className="payment-setting-box p-3">
          <div className="row">
            <div className="col-6">
              <div className="withdrawal-box" >
                <h6 className="d-flex align-items-center justify-content-between">Razor Pay Payment Setting
                  <InfoTooltip title="Razorpay Setting" content={razorpayContent} />
                </h6>
                <div className="row  withdrawal-input">
                  <div className="col-12 mt-1 d-flex justify-content-between align-items-center">
                    <button className="payment-content-button">
                      <span>Razor Pay Android (enable/disable for payment in app)</span>
                    </button>
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={razorpayAndroidEnabled === true ? true : false}
                          theme={theme}
                        />
                      }
                      label=""
                      onClick={() => handleChange("razorPay")}
                    />
                  </div>
                  <div className="col-12 mt-1 d-flex justify-content-between align-items-center">
                    <button className="payment-content-button">
                      <span>Razor Pay iOS (enable/disable for payment in app)</span>
                    </button>
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={razorpayIosEnabled === true ? true : false}
                          theme={theme}
                        />
                      }
                      label=""
                      onClick={() => handleChange("razorpayIosEnabled")}
                    />
                  </div>

                  <div className="col-6 withdrawal-input">
                    <Input
                      label={"Razor Pay Id"}
                      name={"razorPayId"}
                      type={"text"}
                      value={razorPayId || ""}
                      placeholder="Razor Pay Id"
                      onChange={(e) => {
                        setRazorPayId(e.target.value);
                      }}
                    />
                  </div>
                  <div className="col-6 withdrawal-input">
                    <Input
                      label={"Razor Secret Key"}
                      name={"durationOfShorts"}
                      type={"text"}
                      value={razorSecretKey || ""}
                      placeholder="Razor Secret Key"
                      onChange={(e) => {
                        setRazorSecretKey(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="withdrawal-box" >
                <h6 className="d-flex align-items-center justify-content-between">Stripe Payment Setting
                  <InfoTooltip title="Stripe Pay Setting" content={stripeContent} />
                </h6>
                <div className="row  withdrawal-input">
                  <div className="col-12 mt-1 d-flex justify-content-between align-items-center ">
                    <button className="payment-content-button">
                      <span>Stripe Android (enable/disable for payment in app)</span>
                    </button>
                    <FormControlLabel
                      label=""
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={stripeAndroidEnabled === true ? true : false}
                          theme={theme}
                        />
                      }
                      onClick={() => handleChange("stripe")}
                    />
                  </div>
                  <div className="col-12 mt-1 d-flex justify-content-between align-items-center ">
                    <button className="payment-content-button">
                      <span>Stripe iOS (enable/disable for payment in app)</span>
                    </button>
                    <FormControlLabel
                      label=""
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={stripeIosEnabled === true ? true : false}
                          theme={theme}
                        />
                      }
                      onClick={() => handleChange("stripeIosEnabled")}
                    />
                  </div>

                  <div className="col-6 withdrawal-input">
                    <Input
                      label={"Stripe Publishable Key"}
                      name={"stripePublishableKey"}
                      type={"text"}
                      value={stripePublishableKey || ""}
                      placeholder="Stripe Publishable Key"
                      onChange={(e) => {
                        setStripePublishableKey(e.target.value);
                      }}
                    />
                  </div>
                  <div className="col-6 withdrawal-input">
                    <Input
                      label={"Stripe Secret Key"}
                      name={"stripeSecretKey"}
                      type={"text"}
                      value={stripeSecretKey || ""}
                      placeholder="Stripe Secret Key"
                      onChange={(e) => {
                        setStripeSecretKey(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 mt-4">
              <div className="withdrawal-box" >
                <h6 className="d-flex align-items-center justify-content-between">Paystack Setting
                  <InfoTooltip title="Paystack Setting" content={paystackContent} />
                </h6>
                <div className="row  withdrawal-input">
                  <div className="col-12 mt-1 d-flex justify-content-between align-items-center">
                    <button className="payment-content-button">
                      <span>Paystack Android (enable/disable for payment in app)</span>
                    </button>
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={paystackAndroidEnabled === true ? true : false}
                          theme={theme}
                        />
                      }
                      label=""
                      onClick={() => handleChange("paystackAndroidEnabled")}
                    />
                  </div>
                  <div className="col-12 mt-1 d-flex justify-content-between align-items-center">
                    <button className="payment-content-button">
                      <span>Paystack iOS (enable/disable for payment in app)</span>
                    </button>
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={paystackIosEnabled === true ? true : false}
                          theme={theme}
                        />
                      }
                      label=""
                      onClick={() => handleChange("paystackIosEnabled")}
                    />
                  </div>

                  <div className="col-6 withdrawal-input">
                    <Input
                      label={"Paystack Public Key"}
                      name={"paystackPublicKey"}
                      type={"text"}
                      value={paystackPublicKey || ""}
                      placeholder="Paystack Public Key"
                      onChange={(e) => {
                        setPaystackPublicKey(e.target.value);
                      }}
                    />
                  </div>
                  <div className="col-6 withdrawal-input">
                    <Input
                      label={"Paystack Secret Key"}
                      name={"paystackSecretKey"}
                      type={"text"}
                      value={paystackSecretKey || ""}
                      placeholder="Paystack Secret Key"
                      onChange={(e) => {
                        setPaystackSecretKey(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 mt-4">
              <div className="withdrawal-box" >
                <h6 className="d-flex align-items-center justify-content-between">Cashfree Setting
                  <InfoTooltip title="Cashfree Setting" content={cashfreeContent} />
                </h6>
                <div className="row  withdrawal-input">
                  <div className="col-12 mt-1 d-flex justify-content-between align-items-center">
                    <button className="payment-content-button">
                      <span>Cashfree Android (enable/disable for payment in app)</span>
                    </button>
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={cashfreeAndroidEnabled === true ? true : false}
                          theme={theme}
                        />
                      }
                      label=""
                      onClick={() => handleChange("cashfreeAndroidEnabled")}
                    />
                  </div>
                  <div className="col-12 mt-1 d-flex justify-content-between align-items-center">
                    <button className="payment-content-button">
                      <span>Cashfree iOS (enable/disable for payment in app)</span>
                    </button>
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={cashfreeIosEnabled === true ? true : false}
                          theme={theme}
                        />
                      }
                      label=""
                      onClick={() => handleChange("cashfreeIosEnabled")}
                    />
                  </div>

                  <div className="col-6 withdrawal-input">
                    <Input
                      label={"Cashfree Client Id"}
                      name={"cashfreeClientId"}
                      type={"text"}
                      value={cashfreeClientId || ""}
                      placeholder="Cashfree Client Id"
                      onChange={(e) => {
                        setCashfreeClientId(e.target.value);
                      }}
                    />
                  </div>
                  <div className="col-6 withdrawal-input">
                    <Input
                      label={"Cashfree Client Secret"}
                      name={"cashfreeClientSecret"}
                      type={"text"}
                      value={cashfreeClientSecret || ""}
                      placeholder="Cashfree Client Secret"
                      onChange={(e) => {
                        setCashfreeClientSecret(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 mt-4">
              <div className="withdrawal-box" >
                <h6 className="d-flex align-items-center justify-content-between">PayPal Setting
                  <InfoTooltip title="PayPal Setting" content={paypalContent} />
                </h6>
                <div className="row  withdrawal-input">
                  <div className="col-12 mt-1 d-flex justify-content-between align-items-center">
                    <button className="payment-content-button">
                      <span>PayPal Android (enable/disable for payment in app)</span>
                    </button>
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={paypalAndroidEnabled === true ? true : false}
                          theme={theme}
                        />
                      }
                      label=""
                      onClick={() => handleChange("paypalAndroidEnabled")}
                    />
                  </div>
                  <div className="col-12 mt-1 d-flex justify-content-between align-items-center">
                    <button className="payment-content-button">
                      <span>PayPal iOS (enable/disable for payment in app)</span>
                    </button>
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={paypalIosEnabled === true ? true : false}
                          theme={theme}
                        />
                      }
                      label=""
                      onClick={() => handleChange("paypalIosEnabled")}
                    />
                  </div>

                  <div className="col-6 withdrawal-input">
                    <Input
                      label={"PayPal Client Id"}
                      name={"paypalClientId"}
                      type={"text"}
                      value={paypalClientId || ""}
                      placeholder="PayPal Client Id"
                      onChange={(e) => {
                        setPaypalClientId(e.target.value);
                      }}
                    />
                  </div>
                  <div className="col-6 withdrawal-input">
                    <Input
                      label={"PayPal Secret Key"}
                      name={"paypalSecretKey"}
                      type={"text"}
                      value={paypalSecretKey || ""}
                      placeholder="PayPal Secret Key"
                      onChange={(e) => {
                        setPaypalSecretKey(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 mt-4">
              <div className="withdrawal-box" >
                <h6 className="d-flex align-items-center justify-content-between">Flutter Wave Setting
                  <InfoTooltip title="Flutterwave Setting" content={flutterWaveContent} />
                </h6>
                <div className="row withdrawal-input">
                  <div className="col-12 mt-1 d-flex justify-content-between align-items-center ">
                    <button className="payment-content-button">
                      <span>Flutter Wave Android (enable/disable for payment in app)</span>
                    </button>
                    <FormControlLabel
                      label=""
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={flutterwaveAndroidEnabled === true ? true : false}
                          theme={theme}
                        />
                      }
                      onClick={() => handleChange("flutterWave")}
                    />
                  </div>
                  <div className="col-12 mt-1 d-flex justify-content-between align-items-center ">
                    <button className="payment-content-button">
                      <span>Flutter Wave iOS (enable/disable for payment in app)</span>
                    </button>
                    <FormControlLabel
                      label=""
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={flutterwaveIosEnabled === true ? true : false}
                          theme={theme}
                        />
                      }
                      onClick={() => handleChange("flutterwaveIosEnabled")}
                    />
                  </div>

                  <div className="col-12 withdrawal-input">
                    <Input
                      label={"Flutter Wave Id"}
                      name={"flutterWaveId"}
                      type={"text"}
                      value={flutterWaveId || ""}
                      placeholder="Flutter Wave Id"
                      onChange={(e) => {
                        setFlutterWaveId(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 mt-4">
              <div className="withdrawal-box" >
                <h6 className="d-flex align-items-center justify-content-between">Google Play Setting
                  <InfoTooltip title="Google Play Setting" content={googlePlayContent} />
                </h6>
                <div className="row  withdrawal-input">
                  <div className="col-12 mt-1 d-flex justify-content-between align-items-center">
                    <button className="payment-content-button">
                      <span>
                        Google Play Android (enable/disable for payment in app)
                      </span>
                    </button>
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={googlePlayAndroidEnabled === true ? true : false}
                          theme={theme}
                        />
                      }
                      label=""
                      onClick={() => handleChange("googlePlay")}
                    />
                  </div>
                  <div className="col-12 mt-1 d-flex justify-content-between align-items-center">
                    <button className="payment-content-button">
                      <span>
                        Google Play iOs (enable/disable for payment in app)
                      </span>
                    </button>
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={googlePlayIosEnabled === true ? true : false}
                          theme={theme}
                        />
                      }
                      label=""
                      onClick={() => handleChange("googlePayIosEnabled")}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSetting;
