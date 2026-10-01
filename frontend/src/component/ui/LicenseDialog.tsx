"use client";

import React from "react";
import { Cancel } from "@mui/icons-material";
import { Dialog, DialogContent, IconButton, Tooltip } from "@mui/material";

interface LicenseDialogProps {
  open: boolean;
  onClose: () => void;
}

const LicenseDialog = ({ open, onClose }: LicenseDialogProps) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" disableRestoreFocus>
    <IconButton style={{ position: "absolute", right: 10, top: 10, zIndex: 1 }}>
      <Tooltip title="Close">
        <Cancel style={{ color: "#667085" }} onClick={onClose} />
      </Tooltip>
    </IconButton>

    <DialogContent style={{ background: "#ffffff", padding: "32px 24px 24px", borderRadius: "12px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginTop: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            border: "1.5px solid #6c5ce7",
            background: "rgba(108,92,231,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px",
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="11" width="16" height="11" rx="2.5" stroke="#6c5ce7" strokeWidth="1.8" />
            <path d="M8 11V7a4 4 0 018 0v4" stroke="#6c5ce7" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="16.5" r="1.8" fill="#6c5ce7" />
          </svg>
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6c5ce7", margin: "0 0 6px" }}>
          License Required
        </p>
        <h4 style={{ fontSize: 20, fontWeight: 700, color: "#101828", margin: 0 }}>
          Extended License Required
        </h4>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #E4E7EC", margin: "0 0 16px" }} />

      <p style={{ fontSize: 13.5, color: "#667085", textAlign: "center", lineHeight: 1.75, marginBottom: 16 }}>
        Commercial use and monetization features require an active platform license.
      </p>

      {/* Contact Box */}
      <div style={{ background: "#f9fafb", border: "1px solid #E4E7EC", borderRadius: 10, padding: 14, marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#667085", margin: "0 0 10px" }}>
          Platform License
        </p>

        <p style={{ fontSize: 13, color: "#475467", margin: 0, textAlign: "center" }}>
          Your enterprise installation is active and licensed.
        </p>
      </div>

      <button
        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: 42, background: "transparent", color: "#101828", border: "1px solid #E4E7EC", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
        onClick={onClose}
      >
        Close
      </button>
    </DialogContent>
  </Dialog>
);

export default LicenseDialog;