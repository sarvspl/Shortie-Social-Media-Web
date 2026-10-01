import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/component/ui/tooltip";
import styles from "../styles/Tooltip.module.css";
import { HelpCircle } from "lucide-react";
export default function Input(props: any) {
  const {
    label,
    name,
    id,
    type,
    onChange,
    newClass,
    value,
    defaultValue,
    errorMessage,
    placeholder,
    disabled,
    onFocus,
    readOnly,
    onKeyPress,
    checked,
    onClick,
    ref,
    required,
    style,
    accept,
    fieldClass,
    labelShow,
    autoComplete,
    tooltip,
    helperText,
    fileName
  } = props;

  const [types, setTypes] = useState(type);

  const hideShow = () => {
    types === "password" ? setTypes("text") : setTypes("password");
  };

  return (
    <>
      <div
        className={`custom-input ${type} ${newClass} ${type === "gender" && "me-2 mb-0"
          }`}
      >
        {labelShow == false ? " " : <label className="m-0" htmlFor={id}>{label}</label>}
        <div className="d-flex align-items-center gap-2">
          <input
            type={types}
            className={`${type === "file" ? "form-control" : "form-input"}  ${fieldClass}`}
            onChange={onChange}
            value={value}
            defaultValue={defaultValue}
            name={name}
            onWheel={(e) => type === "number"}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            onKeyPress={onKeyPress}
            checked={checked}
            onClick={onClick}
            required={required}
            onFocus={onFocus}
            style={style}
            ref={ref}
            accept={accept}
            autoComplete={autoComplete}
          />
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
        {helperText && <p className="helper-text" style={{ fontSize: '12px', color: '#ff0000ff' }}>{helperText}</p>}

        {type !== "search" && errorMessage && (
          <p className="errorMessage">{errorMessage && errorMessage}</p>
        )}

        {type === "password" && (
          <div className="passHideShow" onClick={hideShow}>
            {types === "password" ? (
              <VisibilityIcon sx={{ fill: "#c9c9c9" }} />
            ) : (
              <VisibilityOffIcon sx={{ fill: "#c9c9c9" }} />
            )}
          </div>
        )}
        {type === "search" && !value && (
          <div className="searching">
            <i className="fa-solid fa-magnifying-glass"></i>
          </div>
        )}
      </div>
    </>
  );
}

export const Textarea = (props: any) => {
  const {
    id,
    label,
    row,
    col,
    placeholder,
    name,
    errorMessage,
    onChange,
    readOnly,
    value,
  } = props;
  const [error, setError] = useState("d-none");
  return (
    <div className="inputData text-start">
      <label
        style={{ color: "black", fontWeight: 600, marginBottom: "5px" }}
        htmlFor={id}
      >
        {label}
      </label>
      <textarea
        id={id}
        rows={row}
        cols={col}
        placeholder={placeholder}
        value={value}
        name={name}
        onChange={onChange}
        readOnly={readOnly}
      ></textarea>
      <p
        className={`errorMessage text-start text-danger ${error}`}
        id={`error-${name}`}
      >
        {errorMessage}
      </p>
    </div>
  );
};
