"use client";

import React, { ReactElement } from "react";
import RootLayout from "../../component/layout/Layout";
import SettingsLayout from "../../component/settings/SettingsLayout";
import AdsSettings from "../../component/settings/AdsSettings";
import { NextPage } from "next";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => React.ReactNode;
};

const Ads: NextPageWithLayout = () => {
  return <AdsSettings />;
};

export default Ads;

Ads.getLayout = function getLayout(page: ReactElement) {
  return (
    <RootLayout>
      <SettingsLayout>{page}</SettingsLayout>
    </RootLayout>
  );
};