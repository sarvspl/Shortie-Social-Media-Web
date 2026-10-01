"use client";

import React, { ReactElement } from "react";
import { NextPage } from "next";
import SettingsLayout from "@/component/settings/SettingsLayout";
import RootLayout from "@/component/layout/Layout";
import GlobalSettings from "@/component/settings/GlobalSettings";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => React.ReactNode;
};

const Settings: NextPageWithLayout = () => {
  return <GlobalSettings />;
};

Settings.getLayout = function getLayout(page: ReactElement) {
  return (
    <RootLayout>
      <SettingsLayout>{page}</SettingsLayout>
    </RootLayout>
  );
};

export default Settings;