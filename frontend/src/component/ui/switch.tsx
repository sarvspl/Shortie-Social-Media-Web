"use client";

import React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import styles from "../../styles/Switch.module.css";

interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  className?: string;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className = "", ...props }, ref) => {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      className={`${styles.switch} ${className}`}
      {...props}
    >
      <SwitchPrimitive.Thumb className={styles.thumb} />
    </SwitchPrimitive.Root>
  );
});

Switch.displayName = "Switch";

export default Switch;