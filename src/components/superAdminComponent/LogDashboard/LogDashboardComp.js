import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Snackbar,
  Alert,
  Pagination,
} from "@mui/material";

const LEVELS = ["", "debug", "info", "warn", "error", "fatal"];
const TYPES = ["", "out", "error"];
const PAGE_SIZE = 100;

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
    default: return "#3b5f1d";
  }
}

function toIso(localValue) {
  if (!localValue) return "";
  const d = new Date(localValue);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

function resolveSources(singleSource) {
  const s = String(singleSource || "").trim();
  return s ? [s] : [];
}

const LogDashboardComp = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [windowTruncated, setWindowTruncated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [live, setLive] = useState(false);
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
  const pageRef = useRef(page);
  pageRef.current = page;
  const filesRef = useRef(fileSources);
  filesRef.current = fileSources;


  const load = useCallback(async (targetPage) => {
    setLoading(true);
    try {
      const f = filtersRef.current;
      const p = new URLSearchParams();
      p.set("page", String(targetPage || 1));
      p.set("pageSize", String(PAGE_SIZE));
      if (f.level) p.set("level", f.level);
      if (f.type) p.set("type", f.type);
      if (f.search) p.set("search", f.search);
      const eff = resolveSources(filtersRef.current.source);
      if (eff.length) p.set("sources", eff.join(","));
      const startIso = toIso(f.start);
      const endIso = toIso(f.end);
      if (startIso) p.set("start", startIso);
      if (endIso) p.set("end", endIso);
      const res = await fetch(`/api/logs/entries?${p.toString()}`);
      const json = await res.json();
      if (json.success) {
        setRows(json.data || []);
        setPage(json.page || 1);
        setTotalPages(json.totalPages || 1);
        setTotal(json.total || 0);
        setWindowTruncated(!!json.windowTruncated);
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
    load(1);
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
      const filtersActive = Object.values(filtersRef.current).some(
        (v) => String(v || "").trim() !== ""
      );
      if (!filtersActive && pageRef.current === 1) {
        const row = { ...doc, id: Date.now() + "-" + Math.random() };
        setRows((prev) => [row, ...prev].slice(0, PAGE_SIZE));
      }
    });
    return () => es.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (event, value) => load(value);

  const setFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const applyFilters = () => load(1);

  const clearFilters = () => {
    setFilters({ start: "", end: "", level: "", source: "", type: "", search: "" });
    load(1);
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
      {windowTruncated && (
        <Typography variant="caption" color="textSecondary" display="block">
          Showing only the newest lines read per file; older history is beyond the file tail limit.
        </Typography>
      )}
      {total > 0 && (
        <Box display="flex" justifyContent="center" alignItems="center" gap={2} mt={2} mb={2}>
          <Typography variant="body2" color="textSecondary">
            {total} matching logs
          </Typography>
          {totalPages > 1 && (
            <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
          )}
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
