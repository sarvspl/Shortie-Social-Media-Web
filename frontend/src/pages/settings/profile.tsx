 "use client";

import React, { ReactElement } from "react";
import RootLayout from "../../component/layout/Layout";
import SettingsLayout from "../../component/settings/SettingsLayout";
import ProfileSettings from "../../component/settings/ProfileSettings";

const Profile = () => {
  return <ProfileSettings />;
};

export default Profile;

Profile.getLayout = function getLayout(page: ReactElement) {
  return (
    <RootLayout>
      <SettingsLayout>{page}</SettingsLayout>
    </RootLayout>
  );
};