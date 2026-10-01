import * as React from "react";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";

export default function ToggleSwitch(props: any) {
  const switchElement = (
      <label className="switch me-2" style={props.style}>
      <Switch
        checked={props.value}
        onChange={props.onChange}
        inputProps={{ "aria-label": "controlled" }}
        onClick={(e) => {
          e.stopPropagation();
          props.onClick && props.onClick(e);
        }}
        color="default"
        sx={{
          '& .MuiSwitch-thumb': {
            backgroundColor: props.value ? '#8b82fc' : '#fff',
          },
          '& .MuiSwitch-track': {
            backgroundColor: props.value ? 'rgba(139,130,252,0.5)' : '#c4c4c4',
          },
        }}
        style={{ cursor: "pointer" }}
        disabled={props.disabled}
      />
</label>
  );

  return (
    <>
      {props.toolTipTitle ? (
        <Tooltip title={props.toolTipTitle} placement="top" arrow>
          <span style={{ cursor: props.disabled ? 'not-allowed' : 'pointer' }}>
            {switchElement}
          </span>
        </Tooltip>
      ) : (
        switchElement
      )}
    </>
  );
}
