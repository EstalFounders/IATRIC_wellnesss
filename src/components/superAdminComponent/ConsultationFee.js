// ConsultationFee.js - the super-admin /superAdmin/consultationFee page.
//
// Two cards, both backed by the keyed consultation-type model:
//
//   1. "Consultation types" - the five fixed types (audio / video / clinic /
//      home_visit / other) plus any custom type the admin adds. The name is
//      editable copy ("Other" -> "Diet advice"); `key` is never editable because
//      bookings, doctor documents and the fee matrix all point at it. The four
//      fixed types can be renamed but not deleted; everything else can be
//      removed.
//
//   2. "Fees by doctor" - the matrix. One row per doctor, one column per type,
//      one rupee box per cell. A blank cell means "inherit": the type's default
//      fee applies and, when that is empty too, the consultation is free and
//      still bookable (see src/utils/consultationFee.js). Cells are edited
//      locally and shipped in one bulk save; clearing a filled cell and saving
//      deletes the override and sends that cell back to the inherited default.
//
// Both cards read their data from a single GET (/api/superAdmin/doctorConsultationFee),
// so the page never depends on the redux slice the old version hydrated from.
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MdDelete } from "react-icons/md";
import styles from "./css/ConsultationFee.module.css";
import { api } from "../../constant";
import {
  SYSTEM_CONSULTATION_TYPES,
  consultationTypeName,
  formatConsultationTypePrices,
  formatFee,
  resolveFee,
  toFee,
  typeKeyFor,
} from "../../utils/consultationFee";
import PanelPagination from "./ConsultationBooked/PanelPagination";

const DOCTOR_FEES_API = "/api/superAdmin/doctorConsultationFee";
const ROWS_PER_PAGE = 10;

// "other" and custom types are the catch-all, so a doctor is never marked as not
// offering them; for the four fixed types the doctor's own `consultationType`
// list decides.
const SYSTEM_KEYS = new Set(SYSTEM_CONSULTATION_TYPES.map((type) => type.key));

const cellKey = (doctorId, typeKey) => `${doctorId}|${typeKey}`;

// "default free" / "default ₹199" under a matrix column header.
const defaultFeeLabel = (type) =>
  type.fee === null || type.fee === undefined
    ? "free"
    : formatFee(type.fee).toLowerCase();

const offersType = (doctor, type) => {
  if (type.key === "other" || !SYSTEM_KEYS.has(type.key)) return true;

  const listed = Array.isArray(doctor.consultationType)
    ? doctor.consultationType
    : [];
  // A doctor created before the types were normalised may carry no list at all;
  // an empty list must not blank out the whole row.
  if (!listed.length) return true;

  return listed.some((name) => typeKeyFor(consultationTypeName(name)) === type.key);
};

const readJson = async (response) => {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.error || `Request failed (${response.status})`);
    // The bulk fee save answers 400 with a per-cell `details` list; keep it on
    // the error so the matrix can mark the offending cells instead of failing
    // the whole batch silently.
    if (Array.isArray(data?.details)) error.details = data.details;
    throw error;
  }
  return data;
};

// One row of the "Consultation types" table. Kept out of the main component so
// the two edit states (this row's draft vs. the stored row) stay readable.
const TypeRow = ({
  type,
  index,
  typeCount,
  isEditing,
  hasDefault,
  draft,
  busy,
  onChangeDraft,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onMove,
}) => {
  const updateDraft = (patch) => onChangeDraft({ ...draft, ...patch });

  return (
    <tr className={isEditing ? styles.editingRow : undefined}>
      <th scope="row" className={styles.typeNameCell}>
        {isEditing ? (
          <input
            className={styles.input}
            value={draft.name}
            aria-label={`Name for ${type.name}`}
            onChange={(event) => updateDraft({ name: event.target.value })}
          />
        ) : (
          <span className={styles.typeName}>{type.name}</span>
        )}
        {type.isSystem ? (
          <span
            className={styles.systemTag}
            title="Fixed type: renameable, not deletable"
          >
            Fixed
          </span>
        ) : null}
      </th>

      <td>
        <code className={styles.keyChip}>{type.key}</code>
      </td>

      <td className={styles.num}>
        {isEditing ? (
          <input
            className={styles.input}
            inputMode="numeric"
            placeholder="No default"
            value={draft.fee}
            aria-label={`Default fee for ${type.name}`}
            onChange={(event) => updateDraft({ fee: event.target.value })}
          />
        ) : hasDefault ? (
          <span className={styles.feeValue}>{formatFee(type.fee)}</span>
        ) : (
          <span className={styles.muted}>No default</span>
        )}
      </td>

      <td>
        {isEditing ? (
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={(event) => updateDraft({ isActive: event.target.checked })}
            />
            <span>{draft.isActive ? "Active" : "Inactive"}</span>
          </label>
        ) : (
          <span
            className={`${styles.pill} ${
              type.isActive ? styles.pillOn : styles.pillOff
            }`}
          >
            {type.isActive ? "Active" : "Inactive"}
          </span>
        )}
      </td>

      <td className={styles.actions}>
        {isEditing ? (
          <>
            <button
              type="button"
              className={styles.primary}
              onClick={onSave}
              disabled={busy}
            >
              {busy ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className={styles.ghost}
              onClick={onCancelEdit}
              disabled={busy}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={styles.iconBtn}
              title="Move up"
              aria-label={`Move ${type.name} up`}
              disabled={index === 0 || busy}
              onClick={() => onMove(type, -1)}
            >
              ↑
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              title="Move down"
              aria-label={`Move ${type.name} down`}
              disabled={index === typeCount - 1 || busy}
              onClick={() => onMove(type, 1)}
            >
              ↓
            </button>
            <button
              type="button"
              className={styles.ghost}
              onClick={() => onStartEdit(type)}
            >
              Edit
            </button>
            <button
              type="button"
              className={styles.danger}
              title={
                type.isSystem
                  ? "Fixed types can be renamed but not deleted"
                  : `Delete ${type.name}`
              }
              aria-label={`Delete ${type.name}`}
              disabled={type.isSystem || busy}
              onClick={() => onDelete(type)}
            >
              <MdDelete size={20} />
            </button>
          </>
        )}
      </td>
    </tr>
  );
};

const ConsultationFeeComponent = () => {
  const [types, setTypes] = useState([]);
  const [doctors, setDoctors] = useState([]);
  // cellKey -> explicit override, in rupees. Absent = inherit the type default.
  const [fees, setFees] = useState({});

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState(null); // { tone: "ok" | "error", text }

  // --- types card state ----------------------------------------------------
  const [editingId, setEditingId] = useState(null);
  const [typeDraft, setTypeDraft] = useState({ name: "", fee: "", isActive: true });
  const [newType, setNewType] = useState({ name: "", fee: "" });
  const [typeBusy, setTypeBusy] = useState(false);

  // --- matrix state --------------------------------------------------------
  const [cellEdits, setCellEdits] = useState({}); // cellKey -> raw input string
  const [cellErrors, setCellErrors] = useState({}); // cellKey -> message
  const [search, setSearch] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [showInactiveTypes, setShowInactiveTypes] = useState(false);
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await readJson(await fetch(DOCTOR_FEES_API));
      setTypes(Array.isArray(data.types) ? data.types : []);
      setDoctors(Array.isArray(data.doctors) ? data.doctors : []);

      const nextFees = {};
      (data.fees || []).forEach((row) => {
        const value = toFee(row.fee);
        if (value !== null) nextFees[cellKey(row.doctorId, row.typeKey)] = value;
      });
      setFees(nextFees);
      setCellEdits({});
      setCellErrors({});
    } catch (error) {
      setLoadError(error.message || "Could not load consultation fees");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Dirty cells are the only thing standing between the admin and closing the
  // tab, so warn before the work is lost.
  const dirtyCount = Object.keys(cellEdits).length;
  useEffect(() => {
    if (!dirtyCount) return undefined;

    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirtyCount]);

  // Reloading throws the in-progress edits away, so ask first.
  const refresh = () => {
    if (
      dirtyCount &&
      !window.confirm(
        `Reloading discards ${dirtyCount} unsaved cell${
          dirtyCount === 1 ? "" : "s"
        }. Continue?`
      )
    ) {
      return;
    }
    load();
  };

  const sortedTypes = useMemo(
    () =>
      [...types].sort(
        (a, b) =>
          (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) ||
          String(a.name).localeCompare(String(b.name))
      ),
    [types]
  );

  const visibleTypes = useMemo(
    () => sortedTypes.filter((type) => showInactiveTypes || type.isActive),
    [sortedTypes, showInactiveTypes]
  );

  const hasOverdueFee = useCallback(
    (doctor) =>
      visibleTypes.some(
        (type) =>
          type.isActive &&
          offersType(doctor, type) &&
          fees[cellKey(doctor._id, type.key)] === undefined
      ),
    [visibleTypes, fees]
  );

  const filteredDoctors = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return doctors.filter((doctor) => {
      if (needle && !String(doctor.name || "").toLowerCase().includes(needle)) {
        return false;
      }
      if (onlyMissing && !hasOverdueFee(doctor)) return false;
      return true;
    });
  }, [doctors, search, onlyMissing, hasOverdueFee]);

  // Any filter change invalidates the current page number.
  useEffect(() => {
    setPage(1);
  }, [search, onlyMissing, showInactiveTypes]);

  const pageCount = Math.max(1, Math.ceil(filteredDoctors.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const pagedDoctors = filteredDoctors.slice(
    (safePage - 1) * ROWS_PER_PAGE,
    safePage * ROWS_PER_PAGE
  );

  // --- matrix cell handlers ------------------------------------------------

  const cellValue = (doctorId, typeKey) => {
    const key = cellKey(doctorId, typeKey);
    if (key in cellEdits) return cellEdits[key];

    const override = fees[key];
    return override === undefined ? "" : String(override);
  };

  const setCell = (doctorId, typeKey, raw) => {
    const key = cellKey(doctorId, typeKey);
    setCellEdits((prev) => ({ ...prev, [key]: raw }));
    setCellErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const discardCells = () => {
    setCellEdits({});
    setCellErrors({});
    setNotice(null);
  };

  const saveCells = async () => {
    const problems = {};
    const updates = [];

    Object.entries(cellEdits).forEach(([key, raw]) => {
      const [doctorId, typeKey] = key.split("|");
      const text = String(raw).trim();

      if (text === "") {
        // Clearing a cell that already inherits is a no-op.
        if (fees[key] === undefined) return;
        updates.push({ doctorId, typeKey, fee: null });
        return;
      }

      const value = toFee(text);
      if (value === null) {
        problems[key] = "Fee must be a number 0 or greater";
        return;
      }
      if (fees[key] === value) return;
      updates.push({ doctorId, typeKey, fee: value });
    });

    if (Object.keys(problems).length) {
      setCellErrors(problems);
      setNotice({ tone: "error", text: "Some fees are not valid numbers." });
      return;
    }

    if (!updates.length) {
      setCellEdits({});
      return;
    }

    setSaving(true);
    try {
      const data = await readJson(
        await fetch(DOCTOR_FEES_API, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates }),
        })
      );

      setFees((prev) => {
        const next = { ...prev };
        updates.forEach(({ doctorId, typeKey, fee }) => {
          const key = cellKey(doctorId, typeKey);
          if (fee === null) delete next[key];
          else next[key] = fee;
        });
        return next;
      });
      setCellEdits({});
      setCellErrors({});
      setNotice({
        tone: "ok",
        text: `Saved ${data.saved || 0} override${
          data.saved === 1 ? "" : "s"
        }, reset ${data.removed || 0} cell${data.removed === 1 ? "" : "s"}.`,
      });
    } catch (error) {
      if (Array.isArray(error.details)) {
        const nextErrors = {};
        error.details.forEach((detail) => {
          const update = updates[detail.index];
          if (update) {
            nextErrors[cellKey(update.doctorId, update.typeKey)] =
              detail.message || "Could not save this fee";
          }
        });
        setCellErrors(nextErrors);
      }
      setNotice({ tone: "error", text: error.message || "Could not save the fees" });
    } finally {
      setSaving(false);
    }
  };

  // --- consultation type handlers -----------------------------------------

  const startEditType = (type) => {
    setEditingId(type._id);
    setTypeDraft({
      name: type.name || "",
      fee: type.fee === null || type.fee === undefined ? "" : String(type.fee),
      isActive: type.isActive !== false,
    });
    setNotice(null);
  };

  const cancelEditType = () => {
    setEditingId(null);
    setTypeDraft({ name: "", fee: "", isActive: true });
  };

  const saveType = async () => {
    if (!editingId) return;

    const name = typeDraft.name.trim();
    if (!name) {
      setNotice({ tone: "error", text: "A consultation type needs a name." });
      return;
    }

    setTypeBusy(true);
    try {
      const saved = await readJson(
        await fetch(`${api.consiltationFee}?id=${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            fee: typeDraft.fee,
            isActive: typeDraft.isActive,
          }),
        })
      );

      setTypes((prev) => prev.map((type) => (type._id === saved._id ? saved : type)));
      cancelEditType();
      setNotice({ tone: "ok", text: `"${saved.name}" updated.` });
    } catch (error) {
      setNotice({ tone: "error", text: error.message || "Could not update the type" });
    } finally {
      setTypeBusy(false);
    }
  };

  const addType = async () => {
    const name = newType.name.trim();
    if (!name) {
      setNotice({ tone: "error", text: "A consultation type needs a name." });
      return;
    }

    setTypeBusy(true);
    try {
      const created = await readJson(
        await fetch(api.consiltationFee, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, fee: newType.fee }),
        })
      );

      setTypes((prev) => [...prev, created]);
      setNewType({ name: "", fee: "" });
      setNotice({ tone: "ok", text: `"${created.name}" added.` });
    } catch (error) {
      setNotice({ tone: "error", text: error.message || "Could not add the type" });
    } finally {
      setTypeBusy(false);
    }
  };

  const deleteType = async (type) => {
    if (type.isSystem) return;
    if (
      !window.confirm(
        `Delete "${type.name}"? Any per-doctor fees recorded for it are removed as well.`
      )
    ) {
      return;
    }

    setTypeBusy(true);
    try {
      const result = await readJson(
        await fetch(`${api.consiltationFee}?id=${type._id}`, { method: "DELETE" })
      );

      setTypes((prev) => prev.filter((row) => row._id !== type._id));
      setFees((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          if (key.endsWith(`|${type.key}`)) delete next[key];
        });
        return next;
      });
      if (editingId === type._id) cancelEditType();
      setNotice({ tone: "ok", text: result.message || "Consultation type deleted." });
    } catch (error) {
      setNotice({ tone: "error", text: error.message || "Could not delete the type" });
    } finally {
      setTypeBusy(false);
    }
  };

  // Reordering is a swap of `sortOrder` with the neighbouring row.
  const moveType = async (type, direction) => {
    const index = sortedTypes.findIndex((row) => row._id === type._id);
    if (index < 0) return;

    const neighbour = sortedTypes[index + direction];
    if (!neighbour) return;

    const orders = [
      { id: type._id, sortOrder: (index + direction) * 10 },
      { id: neighbour._id, sortOrder: index * 10 },
    ];

    setTypeBusy(true);
    try {
      const saved = await Promise.all(
        orders.map((entry) =>
          fetch(`${api.consiltationFee}?id=${entry.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sortOrder: entry.sortOrder }),
          }).then(readJson)
        )
      );

      setTypes((prev) =>
        prev.map((row) => saved.find((entry) => entry._id === row._id) || row)
      );
    } catch (error) {
      setNotice({ tone: "error", text: error.message || "Could not reorder the types" });
    } finally {
      setTypeBusy(false);
    }
  };

  const typeCount = sortedTypes.length;

  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>Consultation fees</h1>
          <p className={styles.subtitle}>
            Set a default fee per consultation type, then override it per doctor.
            A blank cell inherits the type default; when nothing is set anywhere
            the consultation is free and still bookable.
          </p>
        </div>
        <button type="button" className={styles.ghost} onClick={refresh} disabled={loading}>
          ↻ Refresh
        </button>
      </header>

      {notice ? (
        <div
          className={`${styles.notice} ${
            notice.tone === "error" ? styles.noticeError : styles.noticeOk
          }`}
          role={notice.tone === "error" ? "alert" : "status"}
        >
          <span>{notice.text}</span>
          <button
            type="button"
            className={styles.noticeClose}
            aria-label="Dismiss"
            onClick={() => setNotice(null)}
          >
            ×
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className={styles.stateBox} role="status">
          Loading consultation fees…
        </div>
      ) : loadError ? (
        <div className={`${styles.stateBox} ${styles.stateError}`} role="alert">
          <p>{loadError}</p>
          <button type="button" className={styles.primary} onClick={load}>
            Try again
          </button>
        </div>
      ) : (
        <>
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>Consultation types</h2>
              <p className={styles.cardHint}>
                Names are yours to change at any time — the key behind each type
                never moves, so renaming never breaks a booking or a saved fee.
                The four fixed types can be renamed but not deleted.
              </p>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <caption className={styles.caption}>
                  {typeCount} consultation type{typeCount === 1 ? "" : "s"} and
                  their default fee
                </caption>
                <colgroup>
                  <col style={{ width: "40%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "15%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col">Type name</th>
                    <th scope="col">Key</th>
                    <th scope="col" className={styles.num}>
                      Default fee
                    </th>
                    <th scope="col">Status</th>
                    <th scope="col" className={styles.actions}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTypes.map((type, index) => {
                    const isEditing = editingId === type._id;
                    const hasDefault = type.fee !== null && type.fee !== undefined;

                    return (
                      <TypeRow
                        key={type._id}
                        type={type}
                        index={index}
                        typeCount={typeCount}
                        isEditing={isEditing}
                        hasDefault={hasDefault}
                        draft={typeDraft}
                        busy={typeBusy}
                        onChangeDraft={setTypeDraft}
                        onStartEdit={startEditType}
                        onCancelEdit={cancelEditType}
                        onSave={saveType}
                        onDelete={deleteType}
                        onMove={moveType}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={styles.addRow}>
              <h3 className={styles.addTitle}>Add a consultation type</h3>
              <div className={styles.addGrid}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Name</span>
                  <input
                    className={styles.input}
                    value={newType.name}
                    placeholder="e.g. Diet advice"
                    onChange={(event) =>
                      setNewType({ ...newType, name: event.target.value })
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Default fee (₹)</span>
                  <input
                    className={styles.input}
                    inputMode="numeric"
                    value={newType.fee}
                    placeholder="Blank = free"
                    onChange={(event) =>
                      setNewType({ ...newType, fee: event.target.value })
                    }
                  />
                </label>
                <button
                  type="button"
                  className={styles.primary}
                  onClick={addType}
                  disabled={typeBusy || !newType.name.trim()}
                >
                  {typeBusy ? "Adding…" : "Add type"}
                </button>
              </div>
              <p className={styles.addHint}>
                A new type starts active. Its key is derived from the name once
                and never changes, so the name stays safe to edit later.
              </p>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>Fees by doctor</h2>
              <p className={styles.cardHint}>
                Leave a cell blank to use the type default. Type 0 to make that
                consultation free for the doctor; clear a filled cell and save to
                fall back to the default.
              </p>
            </div>

            <div className={styles.toolbar}>
              <input
                className={styles.search}
                type="search"
                placeholder="Search doctors"
                value={search}
                aria-label="Search doctors"
                onChange={(event) => setSearch(event.target.value)}
              />
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={onlyMissing}
                  onChange={(event) => setOnlyMissing(event.target.checked)}
                />
                <span>Only doctors with missing fees</span>
              </label>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={showInactiveTypes}
                  onChange={(event) => setShowInactiveTypes(event.target.checked)}
                />
                <span>Show inactive types</span>
              </label>
              <span className={styles.spacer} />
              <span className={styles.dirtyCount} aria-live="polite">
                {dirtyCount
                  ? `${dirtyCount} unsaved cell${dirtyCount === 1 ? "" : "s"}`
                  : "All changes saved"}
              </span>
              <button
                type="button"
                className={styles.ghost}
                onClick={discardCells}
                disabled={!dirtyCount || saving}
              >
                Discard
              </button>
              <button
                type="button"
                className={styles.primary}
                onClick={saveCells}
                disabled={!dirtyCount || saving}
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>

            {visibleTypes.length === 0 ? (
              <div className={styles.stateBox} role="status">
                No active consultation types. Activate one above (or tick “Show
                inactive types”) to set per-doctor fees.
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className={styles.stateBox} role="status">
                No doctor matches{" "}
                {search.trim() ? `“${search.trim()}”` : "the current filter"}.
              </div>
            ) : (
              <>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <caption className={styles.caption}>
                      {filteredDoctors.length} doctor
                      {filteredDoctors.length === 1 ? "" : "s"} ×{" "}
                      {visibleTypes.length} consultation type
                      {visibleTypes.length === 1 ? "" : "s"}
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col" className={styles.stickyCol}>
                          Doctor
                        </th>
                        {visibleTypes.map((type) => (
                          <th key={type.key} scope="col" className={styles.num}>
                            <span className={styles.colName}>{type.name}</span>
                            <span className={styles.colDefault}>
                              default {defaultFeeLabel(type)}
                            </span>
                            {type.isActive ? null : (
                              <span className={styles.pillOff}>Inactive</span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>

                      {pagedDoctors.map((doctor) => (
                        <tr key={doctor._id}>
                          <th
                            scope="row"
                            className={`${styles.stickyCol} ${styles.doctorCell}`}
                          >
                            <span className={styles.doctorName}>{doctor.name}</span>
                            <span className={styles.doctorMeta}>
                              {doctor.isActive === false
                                ? "Inactive doctor"
                                : formatConsultationTypePrices(
                                    doctor.consultationType
                                  ) || "—"}
                            </span>
                          </th>
                          {visibleTypes.map((type) => {
                            const key = cellKey(doctor._id, type.key);
                            const offered = offersType(doctor, type);
                            const dirty = key in cellEdits;
                            const error = cellErrors[key];

                            return (
                              <td
                                key={type.key}
                                className={`${styles.num} ${
                                  dirty ? styles.cellDirty : ""
                                }`}
                              >
                                {offered ? (
                                  <>
                                    <input
                                      className={`${styles.cellInput} ${
                                        error ? styles.cellInputError : ""
                                      }`}
                                      inputMode="numeric"
                                      value={cellValue(doctor._id, type.key)}
                                      placeholder={formatFee(resolveFee({ type }))}
                                      title={`Inherited default: ${formatFee(
                                        resolveFee({ type })
                                      )}`}
                                      aria-label={`${type.name} fee for ${doctor.name}`}
                                      aria-invalid={error ? true : undefined}
                                      onChange={(event) =>
                                        setCell(
                                          doctor._id,
                                          type.key,
                                          event.target.value
                                        )
                                      }
                                    />
                                    {error ? (
                                      <span className={styles.cellError} role="alert">
                                        {error}
                                      </span>
                                    ) : null}
                                  </>
                                ) : (
                                  <span
                                    className={styles.notOffered}
                                    title={`${doctor.name} does not list ${type.name} in their profile`}
                                  >
                                    Not offered
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <PanelPagination
                  currentPage={safePage}
                  totalItems={filteredDoctors.length}
                  itemsPerPage={ROWS_PER_PAGE}
                  onPageChange={setPage}
                />
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default ConsultationFeeComponent;

