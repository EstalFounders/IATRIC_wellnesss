import React from "react";
import { handleViewArticle } from "../labTestComponent/common/CommonMethod";
import { useDispatch } from "react-redux";
import { FaCalendarAlt, FaClock } from "react-icons/fa";

const ArticleCard = (props) => {
  const { articleCardDetails, article, router } = props;
  console.log("router in category card", articleCardDetails,router, article);
  const dispatch = useDispatch();
  return (
    <div
      className="card border-0 shadow-lg h-100 p-3 rounded-4 d-flex flex-column"
      onClick={() => handleViewArticle(article, dispatch, router)}
    >
      <span className="mb-2 latest-article-category-badge w-50 text-center">
        {articleCardDetails.category}
      </span>

      {/* This div wraps the title/description and takes up remaining space */}
      <div className="flex-grow-1 mb-3 mt-2">
        <h4 className="fw-bold">{articleCardDetails.title}</h4>
        <p className="text-muted">{articleCardDetails.description}</p>
      </div>

      {/* **FIX: Use mt-auto to push the separator and footer to the bottom** */}
      <hr className="mt-auto" />

      <div className="d-flex justify-content-between align-items-center text-muted small">
        <span>
          <FaCalendarAlt className="me-1" /> {articleCardDetails.date}
        </span>
        <span>
          <FaClock className="me-1" /> {articleCardDetails.readTime}
        </span>
        <span className="fw-semibold text-dark">
          {articleCardDetails.author}
        </span>
      </div>
    </div>
  );
};

export default ArticleCard;
