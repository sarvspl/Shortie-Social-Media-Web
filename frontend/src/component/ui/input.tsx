"use client";

import React from "react";
import styles from "../../styles/Input.module.css";

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error = false, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={`${styles.input} ${error ? styles.error : ""} ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;