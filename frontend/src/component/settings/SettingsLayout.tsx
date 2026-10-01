"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Settings,
  Megaphone,
  Database,
  CreditCard,
  Flag,
  Wallet,
  User,
  LucideIcon,
  SquareUser,
} from "lucide-react";

import styles from "../../styles/SettingsLayout.module.css";
import { useDispatch } from "react-redux";
import { getSetting } from "../../store/settingSlice";

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

interface SettingsLayoutProps {
  children: ReactNode;
}

const navItems: NavItem[] = [
  { path: "/settings", label: "Setting", icon: Settings },
  { path: "/settings/ads", label: "Ads Setting", icon: Megaphone },
  { path: "/settings/storage", label: "Storage", icon: Database },
  { path: "/settings/payment", label: "Payment", icon: CreditCard },
  { path: "/settings/reports", label: "Report Reason", icon: Flag },
  { path: "/settings/currency", label: "Currency", icon: CreditCard },
  { path: "/settings/withdraw", label: "Withdraw", icon: Wallet },
  { path: "/settings/profilemanagement", label: "Profile Management", icon: SquareUser },
  { path: "/settings/profile", label: "Profile", icon: User },
];

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [activePath, setActivePath] = useState(router.pathname);

  useEffect(() => {
    setActivePath(router.pathname);
  }, [router.pathname]);

  return (
    <div className="userPage">
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <h1 className={styles.title}>Setting</h1>
            <p className={styles.subtitle}>
              Manage your application configuration and preferences
            </p>
          </div>
        </header>

        {/* Navigation */}
        <div className={styles.navWrapper} style={{
          height: 40,
          overflowY: "hidden",
          overflowX: "auto",
        }}>
          <div className={styles.navInner}>
            <nav className={styles.nav}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePath === item.path;

                return (
                  <Link key={item.path} href={item.path} legacyBehavior>
                    <a
                      className={`${styles.navLink} ${isActive ? styles.active : ""
                        }`}
                    >
                      <Icon size={16} />
                      {item.label}
                    </a>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
};

export default SettingsLayout;