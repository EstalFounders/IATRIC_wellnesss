import React from "react";
import BlogCategoryCard from "./CategoryCard";
import { useRouter } from "next/router";

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

const ExploreByCategoryComp = () => {
  const router = useRouter();
  return (
    <div className="container my-5">
      <div className="text-center mb-4">
        <span className="fw-bold h1 font-weight-bold">Explore by Category</span>
        <p className="text-muted h4">
          Browse our comprehensive collection of medical articles organized by
          specialty
        </p>
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

export default ExploreByCategoryComp;
