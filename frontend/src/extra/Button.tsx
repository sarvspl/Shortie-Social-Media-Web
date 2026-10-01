"use client";
import Tooltip from "@mui/material/Tooltip";

export default function Button(props: any) {
  const {
    newClass,
    btnColor,
    btnName,
    onClick,
    style,
    btnIcon,
    disabled,
    type,
    toolTipTitle,
  } = props;

  const btnContent = (
      <button
        className={`themeBtn text-center ${newClass || ""} ${btnColor || ""}`}
        onClick={onClick}
        style={style}
        disabled={disabled}
        type={type}
      >
        {btnIcon ? (
          <>
            {btnIcon}
           {btnName}
          </>
        ) : (
          btnName
        )}
      </button>
  );

  return (
    <>
      {toolTipTitle ? (
        <Tooltip title={toolTipTitle} placement="top" arrow>
          <span style={{ cursor: disabled || (style && style.cursor) === 'not-allowed' ? 'not-allowed' : 'pointer' }}>
            {btnContent}
          </span>
        </Tooltip>
      ) : (
        btnContent
      )}
    </>
  );
}
