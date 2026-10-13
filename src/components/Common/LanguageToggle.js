import React from "react";
import { Box } from "@mui/material";
import { FaGlobeAsia, FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "../../i18n/LanguageContext";
import { openSupportWhatsAppChat } from "../../helper";
import { color_schema } from "../../constant";

const LanguageToggle = () => {
  const { lang, setLang, t } = useLanguage();

  const segment = (code, label, title) => {
    const active = lang === code;
    return (
      <Box
        component="button"
        type="button"
        key={code}
        onClick={() => setLang(code)}
        aria-pressed={active}
        aria-label={title}
        title={title}
        sx={{
          height: 26,
          minWidth: 36,
          px: "9px",
          border: 0,
          borderRadius: "999px",
          fontSize: "11.5px",
          fontWeight: 600,
          lineHeight: 1,
          cursor: "pointer",
          bgcolor: active ? color_schema.green : "transparent",
          color: active ? "#fff" : "#6b6b6b",
          boxShadow: active ? "0 1px 3px rgba(59,95,29,0.35)" : "none",
          transition: "background-color .18s ease, color .18s ease",
          "&:hover": {
            bgcolor: active ? color_schema.green : "rgba(59,95,29,0.08)",
            color: active ? "#fff" : color_schema.green,
          },
          "&:focus-visible": {
            outline: `2px solid ${color_schema.yellow}`,
            outlineOffset: "1px",
          },
          "@media (max-width:576px)": { height: 28, minWidth: 38 },
          "@media (prefers-reduced-motion: reduce)": { transition: "none" },
        }}
      >
        {label}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        position: "fixed",
        right: 12,
        bottom: 12,
        // Keep below MUI dialogs (zIndex 1300) so popups cover the toggle.
        zIndex: 1290,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "8px",
        "@media (max-width:576px)": { right: 10, bottom: 10 },
      }}
    >
      {/* Support chat: opens WhatsApp with the Healthpath number. */}
      <Box
        component="button"
        type="button"
        onClick={() => openSupportWhatsAppChat()}
        aria-label={t("footer.whatsapp")}
        title={t("footer.whatsapp")}
        sx={{
          width: 40,
          height: 40,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          border: 0,
          borderRadius: "50%",
          bgcolor: "#25D366",
          color: "#fff",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          transition: "background-color .18s ease, transform .18s ease",
          "&:hover": { bgcolor: "#1ebe5b", transform: "scale(1.05)" },
          "&:focus-visible": {
            outline: `2px solid ${color_schema.yellow}`,
            outlineOffset: "1px",
          },
          "@media (max-width:576px)": { width: 42, height: 42 },
          "@media (prefers-reduced-motion: reduce)": {
            transition: "none",
            "&:hover": { transform: "none" },
          },
        }}
      >
        <FaWhatsapp size={22} />
      </Box>

      <Box
        role="group"
        aria-label="Language selector"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "2px",
          p: "2px 4px 2px 2px",
          bgcolor: "#fff",
          border: "1px solid rgba(142,131,51,0.35)",
          borderRadius: "999px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
        }}
      >
        <FaGlobeAsia
          size={11}
          color={color_schema.yellow}
          style={{ margin: "0 2px 0 5px" }}
        />
        {segment("en", "EN", "English")}
        {segment("hi", "हिं", "हिंदी")}
      </Box>
    </Box>
  );
};

export default LanguageToggle;
