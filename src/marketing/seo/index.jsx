import React, { useCallback, useEffect, useState } from "react";
import { Badge, Button, Table } from "react-bootstrap";
import { api } from "../../constant";
import {
  identifierToPath,
  MARKETING_PAGES,
} from "../../api/marketing/utils/seoPayload";
import styles from "../components/css/marketingPanel.module.css";
import EditSEOModal from "../components/seo/EditSEOModal";

/** SEO management view rendered by pages/marketing/seo.js. */
const SeoManagementView = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEntry, setModalEntry] = useState(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(api.marketingSeo, { cache: "no-store" });

      if (response.status === 401) {
        window.location.replace("/marketing/login");
        return;
      }

      const data = await response.json();
      setEntries(Array.isArray(data.entries) ? data.entries : []);
      setError("");
    } catch (err) {
      setError("Could not load the SEO entries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const labelFor = (entry) =>
    MARKETING_PAGES[entry.pageIdentifier]?.label || entry.pageIdentifier;

  const openCreate = () => {
    setModalEntry(null);
    setModalOpen(true);
  };

  const openEdit = (entry) => {
    setModalEntry(entry);
    setModalOpen(true);
  };

  const handleSaved = (message) => {
    setError("");
    setNotice(message);
    loadEntries();
  };

  const handleToggle = async (entry) => {
    setBusyId(entry._id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(api.marketingSeo, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: entry._id, isActive: entry.isActive === false }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        setError(data.message || "Could not update the entry.");
        return;
      }

      setNotice(
        `${labelFor(entry)} is now ${
          entry.isActive === false ? "published" : "unpublished"
        }.`
      );
      await loadEntries();
    } catch (err) {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusyId("");
    }
  };

  const handleDelete = async (entry) => {
    if (!window.confirm(`Delete the SEO entry for ${labelFor(entry)}?`)) return;

    setBusyId(entry._id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`${api.marketingSeo}?id=${entry._id}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        setError(data.message || "Could not delete the entry.");
        return;
      }

      setNotice(`Deleted the entry for ${labelFor(entry)}.`);
      await loadEntries();
    } catch (err) {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusyId("");
    }
  };

  const publishedCount = entries.filter((entry) => entry.isActive !== false).length;

  return (
    <>
      <div className={styles.toolbar}>
        <span className={styles.muted}>
          {loading
            ? "Loading entries…"
            : `${entries.length} ${
                entries.length === 1 ? "page" : "pages"
              } configured · ${publishedCount} published`}
        </span>
        <Button
          size="sm"
          onClick={openCreate}
          style={{ backgroundColor: "#3b5f1d", border: "none" }}
        >
          Add SEO entry
        </Button>
      </div>

      {(error || notice) && (
        <div className={styles.notice} role="status">
          {error || notice}
        </div>
      )}

      <div className={styles.card}>
        {!loading && entries.length === 0 && (
          <p className={styles.muted}>
            No pages configured yet — use &ldquo;Add SEO entry&rdquo; to create one.
          </p>
        )}

        {entries.length > 0 && (
          <Table responsive hover size="sm" className="mb-0">
            <thead>
              <tr>
                <th>Page</th>
                <th>Page title</th>
                <th>Keywords</th>
                <th>Meta description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry._id}>
                  <td>
                    <strong>{labelFor(entry)}</strong>
                    <div className={styles.tableUrl}>
                      {identifierToPath(entry.pageIdentifier) ||
                        entry.pageIdentifier}
                    </div>
                  </td>
                  <td>{entry.pageTitle || "—"}</td>
                  <td>{(entry.seoKeywords || []).length}</td>
                  <td>
                    <span className={styles.muted}>
                      {entry.metaDescription
                        ? `${entry.metaDescription.slice(0, 48)}${
                            entry.metaDescription.length > 48 ? "…" : ""
                          }`
                        : "—"}
                    </span>
                  </td>
                  <td>
                    <Badge bg={entry.isActive === false ? "secondary" : "success"}>
                      {entry.isActive === false ? "Unpublished" : "Published"}
                    </Badge>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        disabled={busyId === entry._id}
                        onClick={() => openEdit(entry)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        disabled={busyId === entry._id}
                        onClick={() => handleToggle(entry)}
                      >
                        {entry.isActive === false ? "Publish" : "Unpublish"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        disabled={busyId === entry._id}
                        onClick={() => handleDelete(entry)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <EditSEOModal
        show={modalOpen}
        entry={modalEntry}
        onHide={() => setModalOpen(false)}
        onSaved={handleSaved}
      />
    </>
  );
};

export default SeoManagementView;
