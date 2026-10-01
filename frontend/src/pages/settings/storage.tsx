"use client";

import React, { ReactElement } from "react";
import RootLayout from "../../component/layout/Layout";
import SettingsLayout from "../../component/settings/SettingsLayout";
import StorageSettings from "../../component/settings/StorageSettings";

const Storage = () => {
  return <StorageSettings />;
};

export default Storage;

Storage.getLayout = function getLayout(page: ReactElement) {
  return (
    <RootLayout>
      <SettingsLayout>{page}</SettingsLayout>
    </RootLayout>
  );
};