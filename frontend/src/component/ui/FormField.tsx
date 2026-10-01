"use client";

import { ReactNode } from "react";
import styles from "../../styles/FormField.module.css";

import Label from "../ui/label";
import Input from "../ui/input";

import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  helper?: string;
  tooltip?: string;
  required?: boolean;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  example?: string;
}

const FormField = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  onFocus,
  readOnly,
  helper,
  tooltip,
  required,
  icon,
  rightIcon,
  example,
}: FormFieldProps) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.labelRow}>
        <Label htmlFor={name} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </Label>

        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle size={14} className={styles.tooltipIcon} />
              </TooltipTrigger>

              <TooltipContent>
                <p className={styles.tooltipText}>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className={styles.inputWrapper}>
        {icon && <div className={styles.icon}>{icon}</div>}

        <Input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          readOnly={readOnly}
          style={readOnly ? { cursor: "pointer" } : undefined}
          className={`${styles.input} ${icon ? styles.inputWithIcon : ""} ${
            rightIcon ? styles.inputWithRightIcon : ""
          }`}
        />

        {rightIcon && <div className={styles.rightIcon}>{rightIcon}</div>}
      </div>

      {helper && <p className={styles.helper}>{helper}</p>}
      {example && <p className={styles.example}>{example}</p>}
    </div>
  );
};

export default FormField;