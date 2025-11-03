import React from "react";
import {
  BackButton,
  
} from "../labTestComponent/common/CommonMethod";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setCategoryDetails } from "../../store/slices/labTest/labTestCategoryApiData";
import { setViewArticle } from "../../store/slices/blog/utilBlogStore";
import BlogCategoryCard from "./CategoryCard";

const categories = [
  {
    title: "Cardiology",
    description:
      "Heart health, cardiovascular diseases, and latest cardiac research",
    articles: 45,
    image: "/images/cardiology.jpg", // your image path
  },
  {
    title: "Nutrition",
    description: "Diet tips, nutritional science, and healthy eating guides",
    articles: 62,
    image: "/images/nutrition.jpg",
  },
  {
    title: "Mental Health",
    description:
      "Psychological wellness, mental health conditions, and therapy insights",
    articles: 38,
    image: "/images/mentalhealth.jpg",
  },
  {
    title: "General Health",
    description: "Overall wellness, preventive care, and medical updates",
    articles: 54,
    image: "/images/generalhealth.jpg",
  },
];

const AllCategoryComp = () => {
  const router = useRouter();
  return (
    <div className="container my-5">
      <div className="text-center mb-4">
        <span className="fw-bold h1 font-weight-bold">All Category</span>
        <p className="text-muted h4">
          Browse our comprehensive collection of medical articles organized by
          specialty
        </p>
      </div>
      <div className="mb-4">
        <BackButton Router={router} />
      </div>
      <div className="row g-4 justify-content-center">
        {categories.map((cat, index) => (
          <div key={index} className="col-md-6 col-lg-3">
            <BlogCategoryCard categoryDetails={cat} router={router} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllCategoryComp;
