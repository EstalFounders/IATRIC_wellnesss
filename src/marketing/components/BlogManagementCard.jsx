import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../../constant";
import styles from "./css/marketingPanel.module.css";

/**
 * Dashboard tile for the blog module.
 * Clicking navigates to /marketing/blog (full CRUD lives there).
 */
const BlogManagementCard = ({ moduleInfo }) => {
  const router = useRouter();
  const [state, setState] = useState({ loading: true, total: 0, published: 0 });

  useEffect(() => {
    let alive = true;

    const loadSummary = async () => {
      try {
        const response = await fetch(api.marketingBlog, { cache: "no-store" });
        const data = await response.json();
        const posts = Array.isArray(data.posts) ? data.posts : [];

        if (alive) {
          setState({
            loading: false,
            total: posts.length,
            published: posts.filter((post) => post.isPublished !== false).length,
          });
        }
      } catch (error) {
        if (alive) setState({ loading: false, total: 0, published: 0 });
      }
    };

    loadSummary();

    return () => {
      alive = false;
    };
  }, []);

  const openManager = () => router.push("/marketing/blog");
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openManager();
    }
  };

  const isLive = moduleInfo?.status === "live";

  return (
    <section
      className={`${styles.card} ${styles.clickable}`}
      role="button"
      tabIndex={0}
      aria-label="Open blog management"
      onClick={openManager}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>Blog Management</h2>
        <span className={styles.badge}>
          {isLive ? "Live" : `Phase ${moduleInfo?.phase || 4}`}
        </span>
      </div>

      <p className={styles.summary}>
        {moduleInfo?.summary ||
          "Create, publish and edit the posts shown by Demo5Blog1."}
      </p>

      <p className={styles.muted}>
        {state.loading
          ? "Loading posts…"
          : `${state.total} ${state.total === 1 ? "post" : "posts"} · ${
              state.published
            } published`}
      </p>

      <span className={styles.clickableHint}>Manage blog posts →</span>
    </section>
  );
};

export default BlogManagementCard;
