 "use client";

import React, { ReactElement } from "react";
import RootLayout from "../../component/layout/Layout";
import SettingsLayout from "../../component/settings/SettingsLayout";
import ProfileManagementSetting from "@/component/settings/ProfileManagement";

const ProfileManagement = () => {
  return <ProfileManagementSetting />;
};

export default ProfileManagement;

ProfileManagement.getLayout = function getLayout(page: ReactElement) {
  return (
    <RootLayout>
      <SettingsLayout>{page}</SettingsLayout>
    </RootLayout>
  );
};