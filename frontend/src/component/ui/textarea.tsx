"use client";

import React from "react";
import styles from "../../styles/Textarea.module.css";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  invalid?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", invalid = false, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`${styles.textarea} ${invalid ? styles.invalid : ""} ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;