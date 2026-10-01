"use client";

import { ReactNode } from "react";
import styles from "../../styles/SettingsCard.module.css";
import InfoTooltip from "@/extra/InfoTooltip";

interface SettingsCardProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  tooltipTitle?: string;
  tooltipContent?: any[];
}

const SettingsCard = ({
  title,
  description,
  icon,
  children,
  className = "",
  tooltipTitle,
  tooltipContent,
}: SettingsCardProps) => {
  return (
    <div className={`${styles.card} ${className}`}>
      {(title || icon) && (
        <>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              {icon && <div className={styles.icon}>{icon}</div>}

              <div>
                {title && <h3 className={styles.title}>{title}</h3>}
                {description && (
                  <p className={styles.description}>{description}</p>
                )}
              </div>
            </div>

            {tooltipContent && (
              <div className={styles.headerRight}>
                <InfoTooltip title={tooltipTitle || title} content={tooltipContent} />
              </div>
            )}
          </div>

          <div className={styles.divider} />
        </>
      )}

      <div className={styles.body}>{children}</div>
    </div>
  );
};

export default SettingsCard;