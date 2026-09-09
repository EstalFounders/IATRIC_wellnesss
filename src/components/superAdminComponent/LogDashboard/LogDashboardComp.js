import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Snackbar,
  Alert,
  Checkbox,
  IconButton,
  Pagination,
} from "@mui/material";
import { MdDelete } from "react-icons/md";

const LEVELS = ["", "debug", "info", "warn", "error", "fatal"];
const TYPES = ["", "out", "error"];
const ENV_TABS = [
  { key: "all", label: "All" },
  { key: "production", label: "Production" },
  { key: "staging", label: "Staging" },
];
const PAGE_SIZE = 50;

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

const LogDashboardComp = () => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [live, setLive] = useState(false);
  const [selected, setSelected] = useState([]);
  const [envTab, setEnvTab] = useState("all");
  const [sourceOptions, setSourceOptions] = useState([]);

  const [filters, setFilters] = useState({
    start: "",
    end: "",
    level: "",
    source: "",
    type: "",
    search: "",
  });
  const [confirm, setConfirm] = useState(null); // {mode:'single'|'bulk'|'range', id?, range?}
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const pageRef = useRef(page);
  pageRef.current = page;
  const envTabRef = useRef(envTab);
  envTabRef.current = envTab;
  const srcOptsRef = useRef(sourceOptions);
  srcOptsRef.current = sourceOptions;

  const hasActiveFilters = () =>
    envTabRef.current !== "all" ||
    Object.values(filtersRef.current).some((v) => String(v || "").trim() !== "");
  const fetchLogs = useCallback(async (targetPage) => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      const f = filtersRef.current;
      p.set("page", String(targetPage || 1));
      p.set("pageSize", String(PAGE_SIZE));
      if (f.level) p.set("level", f.level);
      if (f.type) p.set("type", f.type);
      if (f.source) p.set("source", f.source);
      if (f.search) p.set("search", f.search);
      const startIso = toIso(f.start);
      const endIso = toIso(f.end);
      if (startIso) p.set("start", startIso);
      if (endIso) p.set("end", endIso);
      const tab = envTabRef.current;
      if (tab === "production" || tab === "staging") {
        const isStage = tab === "staging";
        const list = (srcOptsRef.current || [])
          .filter((s) =>
            isStage ? /staging/i.test(s.source) : !/staging/i.test(s.source)
          )
          .map((s) => s.source);
        p.set("sources", list.length ? list.join(",") : "__none__");
      }
      const res = await fetch(`/api/logs?${p.toString()}`);
      const json = await res.json();
      if (json.success) {
        setRows(json.data || []);
        setTotal(json.total || 0);
        setPage(json.page || 1);
        setTotalPages(json.totalPages || 0);
        setSelected([]);
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
    fetchLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetch("/api/logs/sources")
      .then((r) => r.json())
      .then((j) => {
        if (j && j.success) setSourceOptions(j.data || []);
      })
      .catch(() => {});
  }, []);

  const handlePageChange = (event, value) => {
    fetchLogs(value);
  };

  const setFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const applyFilters = () => {
    fetchLogs(1);
  };

  const clearFilters = () => {
    setFilters({ start: "", end: "", level: "", source: "", type: "", search: "" });
    setEnvTab("all");
    fetchLogs(1);
  };

  useEffect(() => {
    const es = new EventSource("/api/logs/stream");
    es.onopen = () => setLive(true);
    es.onerror = () => setLive(false); // browser auto-reconnects
    es.addEventListener("connected", () => setLive(true));
    es.addEventListener("log", (event) => {
      let doc;
      try {
        doc = JSON.parse(event.data);
      } catch (err) {
        return;
      }
      if (!hasActiveFilters() && pageRef.current === 1) {
        setRows((prev) => [doc, ...prev].slice(0, PAGE_SIZE));
        setTotal((prev) => prev + 1);
        setTotalPages((prev) => Math.ceil((prev * PAGE_SIZE + 1) / PAGE_SIZE));
      }
    });
    return () => es.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doDelete = async () => {
    if (!confirm) return;
    const c = confirm;
    setConfirm(null);
    try {
      let res;
      if (c.mode === "single") {
        res = await fetch(`/api/logs/${c.id}`, { method: "DELETE" });
      } else if (c.mode === "bulk") {
        res = await fetch("/api/logs/bulk", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selected }),
        });
      } else if (c.mode === "range") {
        res = await fetch("/api/logs/range", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(c.range),
        });
      }
      const json = await res.json();
      const ok = json && json.success;
      setSnack({
        open: true,
        msg: ok ? `Deleted ${json.deletedCount || 0} log(s)` : (json && json.message) || "Delete failed",
        severity: ok ? "success" : "error",
      });
      if (ok) fetchLogs(pageRef.current);
    } catch (err) {
      setSnack({ open: true, msg: "Error deleting logs", severity: "error" });
    }
  };

  const toggleRow = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleAll = () =>
    setSelected((prev) =>
      prev.length === rows.length ? [] : rows.map((r) => r.id)
    );

  const askRangeDelete = () => {
    const startIso = toIso(filters.start);
    const endIso = toIso(filters.end);
    if (!startIso || !endIso) {
      setSnack({ open: true, msg: "Set both start and end date to delete a range", severity: "warning" });
      return;
    }
    setConfirm({ mode: "range", range: { start: startIso, end: endIso } });
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap">
        <Typography variant="h5">Log Dashboard</Typography>
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
            onClick={() => {
              setEnvTab(t.key);
              fetchLogs(1);
            }}
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
        <TextField size="small" label="Process" value={filters.source}
          onChange={(e) => setFilter("source", e.target.value)} style={{ minWidth: 140 }} />
        <TextField size="small" label="Search message" value={filters.search}
          onChange={(e) => setFilter("search", e.target.value)} style={{ minWidth: 180 }} />
        <Button variant="contained" size="small" onClick={applyFilters}>Search</Button>
        <Button variant="outlined" size="small" onClick={clearFilters}>Clear</Button>
      </Box>
      <Box mb={2} display="flex" alignItems="center" gap={1} flexWrap="wrap">
        <Typography variant="body2" color="textSecondary">
          {total} total · {selected.length} selected
        </Typography>
        <Button
          variant="contained"
          color="error"
          size="small"
          disabled={!selected.length}
          onClick={() => setConfirm({ mode: "bulk" })}
        >
          Delete Selected
        </Button>
        <Button variant="outlined" color="error" size="small" onClick={askRangeDelete}>
          Delete by Date Range
        </Button>
      </Box>
      <div style={{ overflowX: "auto" }}>
        <table className="table table-sm table-striped align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ width: 36 }}>
                <Checkbox
                  size="small"
                  indeterminate={selected.length > 0 && selected.length < rows.length}
                  checked={rows.length > 0 && selected.length === rows.length}
                  onChange={toggleAll}
                />
              </th>
              <th>Timestamp</th>
              <th>Level</th>
              <th>Process</th>
              <th>Type</th>
              <th>Message</th>
              <th style={{ width: 70 }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <Checkbox
                    size="small"
                    checked={selected.includes(row.id)}
                    onChange={() => toggleRow(row.id)}
                  />
                </td>
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
                <td title={row.message}>{truncate(row.message, 120)}</td>
                <td>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setConfirm({ mode: "single", id: row.id })}
                  >
                    <MdDelete />
                  </IconButton>
                </td>
              </tr>
            ))}
            {!rows.length && !loading && (
              <tr>
                <td colSpan={7} className="text-center text-muted py-4">
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
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
      <Dialog open={!!confirm} onClose={() => setConfirm(null)} maxWidth="xs">
        <DialogTitle>Delete logs</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure? This permanently deletes the selected logs from MongoDB.
            The underlying PM2 log files are not touched.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={doDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
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
