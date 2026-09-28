import React, { useCallback, useEffect, useState } from "react";
import { Badge, Button, Table } from "react-bootstrap";
import { api } from "../../constant";
import styles from "../components/css/marketingPanel.module.css";
import EditBlogModal from "../components/blog/EditBlogModal";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

/** Blog management view rendered by pages/marketing/blog.js. */
const BlogManagementView = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPost, setModalPost] = useState(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(api.marketingBlog, { cache: "no-store" });

      if (response.status === 401) {
        window.location.replace("/marketing/login");
        return;
      }

      const data = await response.json();
      setPosts(Array.isArray(data.posts) ? data.posts : []);
      setError("");
    } catch (err) {
      setError("Could not load the blog posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleToggle = async (post) => {
    setBusyId(post._id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(api.marketingBlog, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: post._id, isPublished: post.isPublished === false }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        setError(data.message || "Could not update the post.");
        return;
      }

      setNotice(
        `"${post.title}" is now ${
          post.isPublished === false ? "published" : "unpublished"
        }.`
      );
      await loadPosts();
    } catch (err) {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusyId("");
    }
  };

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;

    setBusyId(post._id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`${api.marketingBlog}?id=${post._id}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        setError(data.message || "Could not delete the post.");
        return;
      }

      setNotice(`Deleted "${post.title}".`);
      await loadPosts();
    } catch (err) {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusyId("");
    }
  };

  const publishedCount = posts.filter((post) => post.isPublished !== false).length;

  return (
    <>
      <div className={styles.toolbar}>
        <span className={styles.muted}>
          {loading
            ? "Loading posts…"
            : `${posts.length} ${
                posts.length === 1 ? "post" : "posts"
              } · ${publishedCount} published`}
        </span>
        <Button
          size="sm"
          onClick={() => {
            setModalPost(null);
            setModalOpen(true);
          }}
          style={{ backgroundColor: "#3b5f1d", border: "none" }}
        >
          New post
        </Button>
      </div>

      {(error || notice) && (
        <div className={styles.notice} role="status">
          {error || notice}
        </div>
      )}

      <div className={styles.card}>
        {!loading && posts.length === 0 && (
          <p className={styles.muted}>
            No posts yet — use &ldquo;New post&rdquo; to add the first one. Until
            then the website keeps showing its static blog cards.
          </p>
        )}

        {posts.length > 0 && (
          <Table responsive hover size="sm" className="mb-0">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Author</th>
                <th>Published</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post._id}>
                  <td>
                    <strong>{post.title}</strong>
                    <div className={styles.tableUrl}>
                      {post.excerpt ? `${post.excerpt.slice(0, 60)}…` : "—"}
                    </div>
                  </td>
                  <td className={styles.tableUrl}>/our-blog/{post.slug}</td>
                  <td>{post.author}</td>
                  <td>{formatDate(post.publishedAt)}</td>
                  <td>
                    <Badge bg={post.isPublished === false ? "secondary" : "success"}>
                      {post.isPublished === false ? "Draft" : "Published"}
                    </Badge>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        disabled={busyId === post._id}
                        onClick={() => {
                          setModalPost(post);
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        disabled={busyId === post._id}
                        onClick={() => handleToggle(post)}
                      >
                        {post.isPublished === false ? "Publish" : "Unpublish"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        disabled={busyId === post._id}
                        onClick={() => handleDelete(post)}
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

      <EditBlogModal
        show={modalOpen}
        post={modalPost}
        onHide={() => setModalOpen(false)}
        onSaved={(message) => {
          setNotice(message);
          loadPosts();
        }}
      />
    </>
  );
};

export default BlogManagementView;
