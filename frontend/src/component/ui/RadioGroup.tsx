"use client";

import React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import styles from "../../styles/RadioGroup.module.css";

type RadioGroupProps = React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Root
> & {
  className?: string;
};

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className = "", ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      className={`${styles.radioGroup} ${className}`}
      {...props}
    />
  );
});

RadioGroup.displayName = "RadioGroup";

type RadioGroupItemProps = React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
> & {
  className?: string;
};

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className = "", ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={`${styles.radioItem} ${className}`}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className={styles.indicator}>
        <span className={styles.innerCircle}></span>
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});

RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };