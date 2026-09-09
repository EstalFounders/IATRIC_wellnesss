import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";

const LEVELS = ["", "debug", "info", "warn", "error", "fatal"];
const TYPES = ["", "out", "error"];
const PAGE_SIZE = 100;
const ENV_TABS = [
  { key: "all", label: "All" },
  { key: "production", label: "Production" },
  { key: "staging", label: "Staging" },
];

function fmtDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
}

function truncate(str, max) {
  const s = String(str || "");
  return s.length > max ? s.slice(0, max) + "…" : s;
}

function levelColor(level) {
  switch (level) {
    case "error": return "#d32f2f";
    case "fatal": return "#b71c1c";
    case "warn": return "#ed6c02";
    case "debug": return "#757575";
    default: return "#1976d2";
  }
}

function toIso(localValue) {
  if (!localValue) return "";
  const d = new Date(localValue);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

function resolveSources(fileList, tab, singleSource) {
  if (singleSource) return [singleSource];
  if (tab === "production" || tab === "staging") {
    const isStage = tab === "staging";
    return (fileList || []).filter((s) =>
      isStage ? /staging/i.test(s) : !/staging/i.test(s)
    );
  }
  return [];
}

const LogDashboardComp = () => {
  const [rows, setRows] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [live, setLive] = useState(false);
  const [envTab, setEnvTab] = useState("all");
  const [fileSources, setFileSources] = useState([]);
  const [filters, setFilters] = useState({
    start: "",
    end: "",
    level: "",
    source: "",
    type: "",
    search: "",
  });
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const envTabRef = useRef(envTab);
  envTabRef.current = envTab;
  const filesRef = useRef(fileSources);
  filesRef.current = fileSources;
  const offsetRef = useRef(0);
  offsetRef.current = rows.length;


  const load = useCallback(async (reset) => {
    setLoading(true);
    try {
      const f = filtersRef.current;
      const p = new URLSearchParams();
      p.set("offset", String(reset ? 0 : rowsRef.current.length));
      p.set("pageSize", String(PAGE_SIZE));
      if (f.level) p.set("level", f.level);
      if (f.type) p.set("type", f.type);
      if (f.search) p.set("search", f.search);
      const eff = resolveSources(
        filesRef.current,
        envTabRef.current,
        String(filtersRef.current.source || "").trim(),
      );
      if (eff.length) p.set("sources", eff.join(","));
      else if (envTabRef.current !== "all") p.set("sources", "__none__");
      const startIso = toIso(f.start);
      const endIso = toIso(f.end);
      if (startIso) p.set("start", startIso);
      if (endIso) p.set("end", endIso);
      const res = await fetch(`/api/logs/entries?${p.toString()}`);
      const json = await res.json();
      if (json.success) {
        const incoming = json.data || [];
        setRows((prev) => (reset ? incoming : [...prev, ...incoming]));
        setHasMore(!!json.hasMore);
      } else {
        setSnack({ open: true, msg: json.message || "Failed to load logs", severity: "error" });
      }
    } catch (err) {
      setSnack({ open: true, msg: "Error loading logs", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetch("/api/logs/files")
      .then((r) => r.json())
      .then((j) => {
        if (j && j.success) {
          const seen = [];
          (j.data || []).forEach((f) => {
            if (!seen.includes(f.source)) seen.push(f.source);
          });
          setFileSources(seen);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const es = new EventSource("/api/logs/stream");
    es.onopen = () => setLive(true);
    es.onerror = () => setLive(false);
    es.addEventListener("connected", () => setLive(true));
    es.addEventListener("log", (event) => {
      let doc;
      try {
        doc = JSON.parse(event.data);
      } catch (err) {
        return;
      }
      const filtersActive =
        envTabRef.current !== "all" ||
        Object.values(filtersRef.current).some(
          (v) => String(v || "").trim() !== ""
        );
      if (!filtersActive && rowsRef.current.length <= PAGE_SIZE) {
        const row = { ...doc, id: Date.now() + "-" + Math.random() };
        setRows((prev) => [row, ...prev].slice(0, PAGE_SIZE));
      }
    });
    return () => es.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOlder = () => load(false);

  const setFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const switchEnv = (key) => {
    setEnvTab(key);
    setFilter("source", "");
    load(true);
  };

  const applyFilters = () => load(true);

  const clearFilters = () => {
    setEnvTab("all");
    setFilters({ start: "", end: "", level: "", source: "", type: "", search: "" });
    load(true);
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap">
        <Typography variant="h5">Log Dashboard (live from PM2 files)</Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: live ? "#2e7d32" : "#9e9e9e",
              display: "inline-block",
            }}
          />
          <Typography variant="body2">
            {live ? "● Live" : "○ Disconnected"}
          </Typography>
        </Box>
      </div>
      <Box mb={2} display="flex" gap={1}>
        {ENV_TABS.map((t) => (
          <Button
            key={t.key}
            size="small"
            variant={envTab === t.key ? "contained" : "outlined"}
            onClick={() => switchEnv(t.key)}
          >
            {t.label}
          </Button>
        ))}
      </Box>
      <Box mb={2} style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <input
          type="datetime-local"
          value={filters.start}
          onChange={(e) => setFilter("start", e.target.value)}
          style={{ padding: "8px", border: "1px solid #ccc", borderRadius: 4 }}
        />
        <input
          type="datetime-local"
          value={filters.end}
          onChange={(e) => setFilter("end", e.target.value)}
          style={{ padding: "8px", border: "1px solid #ccc", borderRadius: 4 }}
        />
        <TextField select size="small" label="Level" value={filters.level}
          onChange={(e) => setFilter("level", e.target.value)} style={{ minWidth: 110 }}>
          {LEVELS.map((l) => (
            <MenuItem key={l} value={l}>{l || "All levels"}</MenuItem>
          ))}
        </TextField>
        <TextField select size="small" label="Type" value={filters.type}
          onChange={(e) => setFilter("type", e.target.value)} style={{ minWidth: 110 }}>
          {TYPES.map((t) => (
            <MenuItem key={t} value={t}>{t || "All types"}</MenuItem>
          ))}
        </TextField>
        <TextField select size="small" label="Process" value={filters.source}
          onChange={(e) => setFilter("source", e.target.value)} style={{ minWidth: 150 }}>
          <MenuItem value="">All processes</MenuItem>
          {fileSources.map((s) => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </TextField>
        <TextField size="small" label="Search message" value={filters.search}
          onChange={(e) => setFilter("search", e.target.value)} style={{ minWidth: 180 }} />
        <Button variant="contained" size="small" onClick={applyFilters}>Search</Button>
        <Button variant="outlined" size="small" onClick={clearFilters}>Clear</Button>
      </Box>
      <Typography variant="caption" color="textSecondary">
        Date filtering is approximate (file modification time is used when a line has no timestamp).
      </Typography>
      <div style={{ overflowX: "auto" }}>
        <table className="table table-sm table-striped align-middle">
          <thead className="table-light">
            <tr>
              <th>Timestamp</th>
              <th>Level</th>
              <th>Process</th>
              <th>Type</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td style={{ whiteSpace: "nowrap" }}>{fmtDate(row.timestamp)}</td>
                <td>
                  <span
                    style={{
                      color: "#fff",
                      background: levelColor(row.level),
                      borderRadius: 4,
                      padding: "1px 6px",
                      fontSize: 12,
                    }}
                  >
                    {row.level}
                  </span>
                </td>
                <td style={{ whiteSpace: "nowrap" }}>{row.source}</td>
                <td>{row.type}</td>
                <td title={row.message}>{truncate(row.message, 160)}</td>
              </tr>
            ))}
            {!rows.length && !loading && (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  No logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {loading && (
        <Typography variant="body2" color="textSecondary" className="py-2">
          Loading…
        </Typography>
      )}
      {hasMore && !loading && (
        <Box display="flex" justifyContent="center" mt={2} mb={2}>
          <Button variant="outlined" size="small" onClick={loadOlder}>
            Load older logs
          </Button>
        </Box>
      )}
      <Snackbar open={snack.open} autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}>
        <Alert severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default LogDashboardComp;
