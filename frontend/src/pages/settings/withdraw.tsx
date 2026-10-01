"use client";

import React, { ReactElement } from "react";
import RootLayout from "../../component/layout/Layout";
import SettingsLayout from "../../component/settings/SettingsLayout";
import WithdrawSettings from "../../component/settings/WithdrawSettings";

const Withdraw = () => {
  return <WithdrawSettings />;
};

export default Withdraw;

Withdraw.getLayout = function getLayout(page: ReactElement) {
  return (
    <RootLayout>
      <SettingsLayout>{page}</SettingsLayout>
    </RootLayout>
  );
};