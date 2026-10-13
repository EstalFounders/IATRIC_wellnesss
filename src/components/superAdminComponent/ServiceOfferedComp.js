// ServiceOfferedComp.js - the super-admin /superAdmin/serviceOffered page.
//
// The catalogue of services patients can book: each one carries a fee and its
// tax split (HSN %, HSN code, share, GST, platform/processing fee, freight) plus
// the copy the homepage speciality tabs render (subheading + description, English
// and Hindi, and an image path).
//
// Layout mirrors the other redesigned super-admin panels (green #3b5f1d /
// yellow #8e8333, white 14px-radius cards, serif "TT Ramillas" titles):
//
//   hero ─ category tiles (All / Major / Sub, with counts) ─ services table
//   (search + pagination) ─ "Add new service" card.
//
// Unlike the old version, which only read the redux slice the doctor panel
// hydrated, the page loads its own data from GET /api/superAdmin/serviceOffered on
// mount, so a deep link or a hard refresh is never blank; the slice is still
// mirrored on every change so consumers (DoctorProfileForm, Tabs-1) stay correct.
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "react-bootstrap";
import { MdMedicalServices, MdRefresh } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import styles from "./css/ServiceOffered.module.css";
import { api, serviceCategoryType } from "../../constant";
import { setServiceOffered } from "../../store/slices/superAdmin/homepageSlice";
import PanelPagination from "./ConsultationBooked/PanelPagination";
import ConfirmModal from "./model/ConfirmModel";
import ServicesTable from "./ServiceOffered/ServicesTable";
import EditServiceModal from "./ServiceOffered/EditServiceModal";
import ServiceFormCard from "./ServiceOffered/ServiceFormCard";
import { uploadServiceImage } from "../../services/firebaseStorage";
import {
  EMPTY_SERVICE,
  toPayload,
  validateService,
} from "./ServiceOffered/serviceForm";

const buildSavePayload = async (draft) => {
  const payload = toPayload(draft);
  if (draft.imageFile) {
    payload.image = await uploadServiceImage(draft.imageFile, draft.name);
  }
  return payload;
};

const ROWS_PER_PAGE = 10;

const TILES = [
  { key: "", label: "All services" },
  { key: serviceCategoryType.MAJOR, label: "Major" },
  { key: serviceCategoryType.SUB, label: "Sub" },
];

const readJson = async (response) => {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || `Request failed (${response.status})`);
  }
  return data;
};

// Drop a key from an errors map (used to clear a field's error as it is edited).
const withoutKey = (errors, key) => {
  if (!(key in errors)) return errors;
  const next = { ...errors };
  delete next[key];
  return next;
};

const ServiceOfferedComp = () => {
  const dispatch = useDispatch();
  const storedServices = useSelector(
    (state) => state.superAdminHomePage.serviceOffered
  );

  // Seed from the store for an instant first paint, then refresh from the API.
  const [services, setServices] = useState(
    Array.isArray(storedServices) ? storedServices : []
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const [newDraft, setNewDraft] = useState({ ...EMPTY_SERVICE });
  const [newErrors, setNewErrors] = useState({});
  const [addBusy, setAddBusy] = useState(false);
  const [addNote, setAddNote] = useState(null);

  const [editDraft, setEditDraft] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [editBusy, setEditBusy] = useState(false);
  const [editNote, setEditNote] = useState(null);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [actionNote, setActionNote] = useState(null);

  // Keep the local list and the redux slice in step after any write.
  const persist = useCallback(
    (next) => {
      setServices(next);
      dispatch(setServiceOffered(next));
    },
    [dispatch]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await readJson(await fetch(api.serviceOffered));
      const list = Array.isArray(data) ? data : [];
      persist(list);
    } catch (err) {
      setLoadError(err.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, [persist]);

  useEffect(() => {
    load();
  }, [load]);

  // Any filter change sends the table back to page 1.
  useEffect(() => {
    setPage(1);
  }, [query, category]);

  const updateNew = (field, value) => {
    setNewDraft((prev) => ({ ...prev, [field]: value }));
    setNewErrors((prev) => withoutKey(prev, field));
  };

  const resetNew = () => {
    setNewDraft({ ...EMPTY_SERVICE });
    setNewErrors({});
    setAddNote(null);
  };

  const handleAdd = async () => {
    const errors = validateService(newDraft);
    setNewErrors(errors);
    setAddNote(null);
    if (Object.keys(errors).length) {
      setAddNote({ type: "err", text: "Please fill the required fields." });
      return;
    }

    setAddBusy(true);
    try {
      const created = await readJson(
        await fetch(api.serviceOffered, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(await buildSavePayload(newDraft)),
        })
      );
      persist([created, ...services]);
      setNewDraft({ ...EMPTY_SERVICE });
      setNewErrors({});
      setAddNote({ type: "ok", text: `“${created.name}” was added.` });
    } catch (err) {
      setAddNote({ type: "err", text: err.message || "Failed to add service." });
    } finally {
      setAddBusy(false);
    }
  };

  const openEdit = (service) => {
    setEditDraft({ ...EMPTY_SERVICE, ...service, imageFile: null });
    setEditErrors({});
    setEditNote(null);
  };

  const closeEdit = () => {
    if (editBusy) return;
    setEditDraft(null);
    setEditErrors({});
    setEditNote(null);
  };

  const updateEdit = (field, value) => {
    setEditDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
    setEditErrors((prev) => withoutKey(prev, field));
  };

  const handleEditSave = async () => {
    if (!editDraft) return;

    const errors = validateService(editDraft);
    setEditErrors(errors);
    setEditNote(null);
    if (Object.keys(errors).length) {
      setEditNote({ type: "err", text: "Please fill the required fields." });
      return;
    }

    setEditBusy(true);
    try {
      const updated = await readJson(
        await fetch(`${api.serviceOffered}?id=${editDraft._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(await buildSavePayload(editDraft)),
        })
      );
      persist(services.map((item) => (item._id === updated._id ? updated : item)));
      const name = updated.name;
      setEditDraft(null);
      setEditErrors({});
      setEditNote(null);
      setActionNote({ type: "ok", text: `“${name}” was updated.` });
    } catch (err) {
      setEditNote({ type: "err", text: err.message || "Failed to update service." });
    } finally {
      setEditBusy(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    setDeleteBusy(true);
    try {
      const response = await fetch(
        `${api.serviceOffered}?id=${pendingDelete._id}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete service.");
      }
      persist(services.filter((item) => item._id !== pendingDelete._id));
      setActionNote({ type: "ok", text: `“${pendingDelete.name}” was deleted.` });
      setPendingDelete(null);
    } catch (err) {
      setActionNote({ type: "err", text: err.message || "Failed to delete service." });
      setPendingDelete(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return services.filter((service) => {
      if (category && service.categoryType !== category) return false;
      if (!needle) return true;
      return [service.name, service.subheading, service.hsn_code]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [services, category, query]);

  // A record with no categoryType is treated as Major (the model default).
  const majorCount = services.filter(
    (service) => service.categoryType !== serviceCategoryType.SUB
  ).length;
  const subCount = services.filter(
    (service) => service.categoryType === serviceCategoryType.SUB
  ).length;
  const tileCount = (key) =>
    key === ""
      ? services.length
      : key === serviceCategoryType.MAJOR
      ? majorCount
      : subCount;

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (safePage - 1) * ROWS_PER_PAGE,
    safePage * ROWS_PER_PAGE
  );

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">
          <MdMedicalServices />
        </span>
        <div className={styles.heroInfo}>
          <p className={styles.heroEyebrow}>Catalogue</p>
          <h1 className={styles.heroTitle}>Service offered</h1>
          <p className={styles.heroSubtitle}>
            The services patients can book — fee and tax split, plus the image,
            subheading and description the homepage speciality tabs render. Replace
            a picture here to upload it to Firebase and update the live tab.
          </p>
        </div>
        <div className={styles.heroActions}>
          <Button className={styles.ghostBtn} onClick={load} disabled={loading}>
            <MdRefresh aria-hidden="true" />
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
          <Link className={styles.linkBtn} href="/superAdmin/homepage">
            Back to dashboard
          </Link>
        </div>
      </header>

      {loadError ? (
        <div className={styles.errorBox} role="alert">
          <span>Could not load services: {loadError}</span>
          <button type="button" className={styles.retry} onClick={load}>
            Try again
          </button>
        </div>
      ) : null}

      <div className={styles.tileGrid}>
        {TILES.map((tile) => {
          const active = category === tile.key;
          return (
            <button
              key={tile.key || "all"}
              type="button"
              aria-pressed={active}
              className={`${styles.tile}${active ? ` ${styles.tileActive}` : ""}`}
              onClick={() => setCategory(tile.key)}
            >
              <span className={styles.tileLabel}>{tile.label}</span>
              <span className={styles.tileValue}>{tileCount(tile.key)}</span>
              <span className={styles.tileHint}>
                {active ? "Showing below" : "Click to filter"}
              </span>
            </button>
          );
        })}
      </div>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Services</h2>

        <div className={styles.searchRow}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search by name, subheading or HSN code"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search services"
          />
          <span className={styles.countNote}>
            {filtered.length} of {services.length} shown
          </span>
        </div>

        {actionNote ? (
          <p
            className={`${styles.note} ${
              actionNote.type === "ok" ? styles.noteOk : styles.noteErr
            }`}
            role="status"
          >
            {actionNote.text}
          </p>
        ) : null}

        {loading && services.length === 0 ? (
          <p className={styles.loading}>Loading services…</p>
        ) : filtered.length === 0 ? (
          <p className={styles.empty}>
            {services.length === 0
              ? "No services yet — add the first one below."
              : "No services match this filter."}
          </p>
        ) : (
          <>
            <ServicesTable
              rows={pageRows}
              onEdit={openEdit}
              onDelete={setPendingDelete}
            />
            <PanelPagination
              currentPage={safePage}
              totalItems={filtered.length}
              itemsPerPage={ROWS_PER_PAGE}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      <ServiceFormCard
        draft={newDraft}
        errors={newErrors}
        busy={addBusy}
        note={addNote}
        onChange={updateNew}
        onSubmit={handleAdd}
        onReset={resetNew}
      />

      <EditServiceModal
        show={Boolean(editDraft)}
        draft={editDraft}
        errors={editErrors}
        busy={editBusy}
        note={editNote}
        onChange={updateEdit}
        onClose={closeEdit}
        onSave={handleEditSave}
      />

      <ConfirmModal
        show={Boolean(pendingDelete)}
        title="Delete service"
        message={
          pendingDelete
            ? `Delete “${pendingDelete.name}”? Patients will no longer be able to book it.`
            : ""
        }
        confirmLabel="Delete"
        busy={deleteBusy}
        onClose={() => {
          if (!deleteBusy) setPendingDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default ServiceOfferedComp;
