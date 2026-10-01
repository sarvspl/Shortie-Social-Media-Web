"use client";

import React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import styles from "../../styles/Label.module.css";

type LabelProps = React.ComponentPropsWithoutRef<
  typeof LabelPrimitive.Root
> & {
  className?: string;
};

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className = "", children, ...props }, ref) => {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={`${styles.label} ${className}`}
      {...props}
    >
      {children}
    </LabelPrimitive.Root>
  );
});

Label.displayName = "Label";

export default Label;