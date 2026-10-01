"use client";

import React from "react";
import styles from "../../styles/Button.module.css";

type ButtonVariant = "default" | "primary" | "secondary" | "danger";
type ButtonSize = "default" | "sm" | "lg";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "default",
      size = "default",
      className = "",
      ...props
    },
    ref
  ) => {
    const variantClass = styles[variant] || styles.default;

    const sizeClass =
      size === "default"
        ? styles.defaultSize
        : styles[size] || styles.defaultSize;

    return (
      <button
        ref={ref}
        className={`${styles.button} ${variantClass} ${sizeClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;