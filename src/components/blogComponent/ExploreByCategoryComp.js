import React from "react";

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
    description:
      "Overall wellness, preventive care, and medical updates",
    articles: 54,
    image: "/images/generalhealth.jpg",
  },
];

const ExploreByCategoryComp = () => {
  return (
    <div className="container my-5">
      <div className="text-center mb-4">
        <h2 className="fw-bold">Explore by Category</h2>
        <p className="text-muted">
          Browse our comprehensive collection of medical articles organized by
          specialty
        </p>
      </div>

      <div className="row g-4 justify-content-center">
        {categories.map((cat, index) => (
          <div key={index} className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100">
              <div
                className="rounded-top"
                style={{
                  height: "160px",
                //   backgroundImage: `url(${cat.image})`,
                backgroundImage: `url("/images/dentistry.jpg")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderTopLeftRadius: "12px",
                  borderTopRightRadius: "12px",
                }}
              ></div>
              <div className="card-body">
                <h5 className="fw-bold">{cat.title}</h5>
                <p className="text-muted small">{cat.description}</p>
                <div className="d-flex justify-content-between align-items-center font-weight-bold" style={{color: '#8e8333'}}>
                  <span className="fw-semibold">
                    {cat.articles} Articles
                  </span>
                  <a href="#" className="text-decoration-none">
                    Explore →
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExploreByCategoryComp;
