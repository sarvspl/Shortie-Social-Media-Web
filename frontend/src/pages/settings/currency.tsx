"use client";

import React, { ReactElement } from "react";
import RootLayout from "../../component/layout/Layout";
import SettingsLayout from "../../component/settings/SettingsLayout";
import CurrencySettings from "../../component/settings/CurrencySettings";

const CurrencyPage = () => {
  return <CurrencySettings />;
};

export default CurrencyPage;

CurrencyPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <RootLayout>
      <SettingsLayout>{page}</SettingsLayout>
    </RootLayout>
  );
};
