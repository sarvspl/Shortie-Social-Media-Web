"use client";

import React, { ReactElement } from "react";
import RootLayout from "../../component/layout/Layout";
import SettingsLayout from "../../component/settings/SettingsLayout";
import ReportReasons from "../../component/settings/ReportReasons";

const Reports = () => {
  return <ReportReasons />;
};

export default Reports;

Reports.getLayout = function getLayout(page: ReactElement) {
  return (
    <RootLayout>
      <SettingsLayout>{page}</SettingsLayout>
    </RootLayout>
  );
};