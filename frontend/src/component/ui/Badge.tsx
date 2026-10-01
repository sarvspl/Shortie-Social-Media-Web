import React from "react";
import { Slot } from "@radix-ui/react-slot";
import styles from "../../styles/Badge.module.css";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  asChild?: boolean;
}

function Badge({
  className = "",
  variant = "default",
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp: React.ElementType = asChild ? Slot : "span";

  const badgeClass = `${styles.badge} ${styles[variant]} ${className}`;

  return <Comp className={badgeClass} {...props} />;
}

export default Badge;