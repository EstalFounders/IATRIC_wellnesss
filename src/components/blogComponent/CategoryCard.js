import React from "react";
import { handleViewCateogory } from "../labTestComponent/common/CommonMethod";
import { useDispatch } from "react-redux";

const BlogCategoryCard = (props) => {
  const { categoryDetails, router } = props;
  console.log(router, "router in category card", categoryDetails);
  const cat = categoryDetails;
  const dispatch = useDispatch();
  return (
    <div
      className="card border-0 shadow-sm h-100"
      style={{ minHeight: "400px" }}
    >
      <div
        className="rounded-top"
        style={{
          height: "160px",
          backgroundImage: `url("/images/dentistry.jpg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
        }}
      ></div>

      <div className="card-body d-flex flex-column">
        <h4 className="fw-bold">{cat.title}</h4>
        <p className="text-muted flex-grow-1">{cat.description}</p>

        <div
          className="d-flex justify-content-between align-items-center fw-semibold mt-auto"
          style={{ color: "#8e8333" }}
        >
          <span>{cat.articles} Articles</span>
          <div
            className="text-decoration-none clickable-div text-dark"
            onClick={() => handleViewCateogory(categoryDetails, dispatch, router)}
          >
            Explore →
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCategoryCard;
