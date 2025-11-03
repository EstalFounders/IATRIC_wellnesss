import React from "react";
import { Container } from "react-bootstrap";
import { FaCalendarAlt, FaClock, FaUser } from "react-icons/fa";
import { useSelector } from "react-redux";
import { BackButton } from "../labTestComponent/common/CommonMethod";
import { useRouter } from "next/router";

const BlogPostComp = () => {
  const router = useRouter();
  const articleDetails = useSelector(
    (state) => state.utilBlogStoreSlice.articleDetails
  );
  return (
    <div className="blog-post-page py-5">
      <Container style={{ maxWidth: "900px" }}>
        {/* Category */}
        <div
          className="badge mb-3"
          style={{
            backgroundColor: "#dff8ef",
            color: "#008060",
            fontWeight: "500",
            fontSize: "0.9rem",
          }}
        >
          {articleDetails.category}
        </div>

        {/* Title */}
        <h1 className="fw-bold mb-3">{articleDetails.title}</h1>

        {/* Meta info */}
        <div
          className="d-flex flex-wrap align-items-center text-muted mb-4"
          style={{ gap: "20px" }}
        >
          <div className="d-flex align-items-center gap-2">
            <FaCalendarAlt /> <span>{articleDetails.date}</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <FaClock /> <span>{articleDetails.readTime}</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <FaUser /> <span>{articleDetails.author}</span>
          </div>
        </div>

        {/* Blog Content */}
        <div
          className="blog-content text-secondary"
          style={{
            lineHeight: "1.8",
            fontSize: "1.05rem",
            whiteSpace: "pre-line", // supports multi-line content
          }}
        >
          {articleDetails.description}
        </div>
        <div>
          <BackButton Router={router} />
        </div>
      </Container>
    </div>
  );
};

export default BlogPostComp;
