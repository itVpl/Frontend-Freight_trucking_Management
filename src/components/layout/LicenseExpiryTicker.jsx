import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { keyframes } from "@mui/system";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import WarningAmber from "@mui/icons-material/WarningAmber";
import { BASE_API_URL } from "../../apiConfig";

const tickerScroll = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const POLL_MS = 60_000;

function formatDisplayDate(value) {
  if (value == null) return "—";
  const s = typeof value === "string" ? value.slice(0, 10) : String(value);
  return s || "—";
}

/**
 * Marquee for trucker: GET /api/v1/driver/license-expiry-ticker
 * Styling inspired by financial tickers: bold symbol, muted labels, accent metrics.
 */
export default function LicenseExpiryTicker({ windowParam }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setItems([]);
      return;
    }
    const q =
      windowParam === "days_30"
        ? "?window=days_30"
        : windowParam === "calendar_month"
          ? "?window=calendar_month"
          : "";
    try {
      const res = await fetch(
        `${BASE_API_URL}/api/v1/driver/license-expiry-ticker${q}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) {
        setItems([]);
        return;
      }
      const body = await res.json();
      const list = body?.data?.items ?? body?.items ?? [];
      setItems(Array.isArray(list) ? list : []);
    } catch {
      setItems([]);
    }
  }, [windowParam]);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  if (!items.length) return null;

  const durationSec = Math.min(90, Math.max(36, items.length * 14));

  const renderStrip = (keyPrefix) =>
    items.map((row, i) => {
      const asLink = keyPrefix === "a";
      const expired = row.tickerStatus === "expired";
      const soon = row.tickerStatus === "expiring_soon";
      const accent = expired ? "#fb7185" : soon ? "#fde047" : "#cbd5e1";
      const accentGlow = expired
        ? "rgba(251, 113, 133, 0.35)"
        : soon
          ? "rgba(253, 224, 71, 0.28)"
          : "rgba(203, 213, 225, 0.2)";
      const date = formatDisplayDate(row.licenseExpiryDate);
      const name = (row.driverName || "Driver").trim() || "Driver";
      const driverHref = `/driver?search=${encodeURIComponent(name)}`;

      const shellSx = {
        display: "inline-flex",
        alignItems: "center",
        flexShrink: 0,
        gap: 1.25,
        py: 0.25,
        pr: 5,
        pl: 0.5,
        borderRight: "1px solid rgba(51, 65, 85, 0.85)",
        textDecoration: "none",
        color: "inherit",
        cursor: "pointer",
        borderRadius: "12px",
        transition: "background-color 0.15s ease",
        "&:hover": {
          bgcolor: "rgba(255,255,255,0.07)",
        },
        "&:focus-visible": {
          outline: "2px solid rgba(96, 165, 250, 0.9)",
          outlineOffset: 2,
        },
      };

      const content = (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: "10px",
              bgcolor: "rgba(15, 23, 42, 0.9)",
              border: `1px solid ${accentGlow}`,
              boxShadow: `0 0 20px ${accentGlow}`,
            }}
          >
            {expired ? (
              <ErrorOutline sx={{ fontSize: 20, color: accent }} aria-hidden />
            ) : soon ? (
              <WarningAmber sx={{ fontSize: 20, color: accent }} aria-hidden />
            ) : (
              <ErrorOutline sx={{ fontSize: 20, color: accent }} aria-hidden />
            )}
          </Box>

          <Box
            sx={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: 1.75,
              flexWrap: "nowrap",
            }}
          >
            <Typography
              component="span"
              title={name}
              sx={{
                color: "#f8fafc",
                fontWeight: 800,
                fontSize: "0.9375rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontFamily:
                  '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
                maxWidth: { xs: 140, sm: 220 },
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {name}
            </Typography>

            <Typography
              component="span"
              sx={{
                color: "#64748b",
                fontWeight: 600,
                fontSize: "0.6875rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontFamily:
                  '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
              }}
            >
              License expires
            </Typography>

            <Typography
              component="span"
              sx={{
                color: accent,
                fontWeight: 800,
                fontSize: "1rem",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "0.02em",
                textShadow:
                  expired || soon
                    ? `0 0 24px ${accentGlow}`
                    : "none",
                fontFamily:
                  '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
              }}
            >
              {date}
            </Typography>

            <Typography
              component="span"
              sx={{
                ml: 0.25,
                color: accent,
                fontWeight: 700,
                fontSize: "0.75rem",
                opacity: 0.92,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {expired
                ? "(expired)"
                : soon
                  ? `(${row.daysUntilExpiry ?? "—"}d)`
                  : ""}
            </Typography>
          </Box>
        </>
      );

      const key = `${keyPrefix}-${row.driverId ?? "d"}-${i}`;

      if (asLink) {
        return (
          <Box
            key={key}
            component={Link}
            to={driverHref}
            aria-label={`Open Driver list filtered to ${name}`}
            onClick={(e) => e.stopPropagation()}
            sx={shellSx}
          >
            {content}
          </Box>
        );
      }

      return (
        <Box
          key={key}
          aria-hidden
          onClick={(e) => {
            e.stopPropagation();
            navigate(driverHref);
          }}
          sx={shellSx}
        >
          {content}
        </Box>
      );
    });

  return (
    <Box
      role="region"
      aria-label="Driver license expiry alerts"
      sx={{
        width: "100%",
        overflow: "hidden",
        position: "sticky",
        top: 0,
        zIndex: 8,
        background:
          "linear-gradient(180deg, #0b1120 0%, #0f172a 42%, #0c1322 100%)",
        borderBottom: "1px solid rgba(30, 41, 59, 0.95)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.25)",
        py: 1.15,
        px: 0,
        maskImage:
          "linear-gradient(90deg, transparent 0%, #000 32px, #000 calc(100% - 32px), transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent 0%, #000 32px, #000 calc(100% - 32px), transparent 100%)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "max-content",
          minHeight: 40,
          animation: `${tickerScroll} ${durationSec}s linear infinite`,
          willChange: "transform",
          "&:hover": { animationPlayState: "paused" },
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            flexShrink: 0,
            pl: 2,
            pr: 3,
          }}
        >
          {renderStrip("a")}
        </Box>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            flexShrink: 0,
            pl: 2,
            pr: 3,
          }}
          aria-hidden
        >
          {renderStrip("b")}
        </Box>
      </Box>
    </Box>
  );
}
