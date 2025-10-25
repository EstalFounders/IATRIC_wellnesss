import React from "react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";

const articles = [
  {
    category: "Cardiology",
    title:
      "Understanding Heart Disease: Early Warning Signs You Shouldn't Ignore",
    description:
      "Learn to recognize the subtle symptoms that could indicate cardiovascular issues. Early detection can save lives.",
    date: "Jan 15, 2025",
    readTime: "6 min read",
    author: "Dr. Sarah Chen",
  },
  {
    category: "Nutrition",
    title: "The Mediterranean Diet: A Science-Backed Approach to Longevity",
    description:
      "Discover how this eating pattern can reduce inflammation, improve heart health, and promote healthy aging.",
    date: "Jan 12, 2025",
    readTime: "8 min read",
    author: "Dr. Michael Torres",
  },
  {
    category: "Mental Health",
    title: "Breaking the Stigma: Modern Approaches to Anxiety Treatment",
    description:
      "Explore evidence-based therapies and coping strategies that are transforming mental health care.",
    date: "Jan 10, 2025",
    readTime: "7 min read",
    author: "Dr. Emily Watson",
  },
  {
    category: "General Health",
    title: "Sleep Quality: The Hidden Foundation of Good Health",
    description:
      "Why proper sleep is essential for immune function, mental clarity, and overall wellbeing.",
    date: "Jan 8, 2025",
    readTime: "5 min read",
    author: "Dr. James Liu",
  },
  {
    category: "Cardiology",
    title: "Hypertension Management: Beyond Medication",
    description:
      "Lifestyle modifications that can significantly reduce blood pressure and improve cardiovascular outcomes.",
    date: "Jan 5, 2025",
    readTime: "6 min read",
    author: "Dr. Sarah Chen",
  },
  {
    category: "Nutrition",
    title: "Gut Health: The New Frontier in Preventive Medicine",
    description:
      "How your microbiome affects everything from immunity to mental health, with practical dietary tips.",
    date: "Jan 3, 2025",
    readTime: "9 min read",
    author: "Dr. Michael Torres",
  },
];

const LatestArticlesComp = () => {
  return (
    <div className="container my-5">
      {/* Section Header */}
      <div className="text-center mb-5">
        <h2 className="fw-bold">Latest Articles</h2>
        <p className="text-muted">
          Stay updated with the newest medical insights and health research
        </p>
      </div>

      {/* Article Cards */}
      <div className="row g-4">
        {articles.map((article, index) => (
          <div key={index} className="col-md-6 col-lg-4 mb-4">
            {/* Added d-flex flex-column to make it a flex container */}
            <div className="card border-0 shadow-lg h-100 p-3 rounded-4 d-flex flex-column">
              <span className="mb-2 latest-article-category-badge w-50 text-center">
                {article.category}
              </span>

              {/* This div wraps the title/description and takes up remaining space */}
              <div className="flex-grow-1 mb-3">
                <h6 className="fw-bold">{article.title}</h6>
                <p className="text-muted small">{article.description}</p>
              </div>

              {/* **FIX: Use mt-auto to push the separator and footer to the bottom** */}
              <hr className="mt-auto" />

              <div className="d-flex justify-content-between align-items-center text-muted small">
                <span>
                  <FaCalendarAlt className="me-1" /> {article.date}
                </span>
                <span>
                  <FaClock className="me-1" /> {article.readTime}
                </span>
                <span className="fw-semibold text-dark">{article.author}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestArticlesComp;
