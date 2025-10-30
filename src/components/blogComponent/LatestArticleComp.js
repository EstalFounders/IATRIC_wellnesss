import React from "react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import ArticleCard from "./ArticleCard";
import { useRouter } from "next/router";

const sampleBlog = {
  category: "Cardiology",
  title:
    "Understanding Heart Disease: Early Warning Signs You Shouldn't Ignore",
  description: `
Heart disease remains one of the leading causes of death globally. Recognizing early symptoms can significantly improve outcomes.

### Common Warning Signs
- Chest pain or discomfort
- Shortness of breath
- Unexplained fatigue
- Dizziness or nausea

### Prevention
Maintain a healthy lifestyle: regular exercise, balanced diet, and routine check-ups.

Early detection saves lives — listen to your body and consult your doctor when in doubt.
  `,
  date: "Jan 15, 2025",
  readTime: "6 min read",
  author: "Dr. Sarah Chen",
};

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
  const router = useRouter();
  return (
    <div className="container my-5">
      {/* Section Header */}
      <div className="text-center mb-5">
        <span className="h1 font-weight-bold">Latest Articles</span>
        <p className="text-muted h4">
          Stay updated with the newest medical insights and health research
        </p>
      </div>

      {/* Article Cards */}
      <div className="row g-4">
        {articles.map((article, index) => (
          <div key={index} className="col-md-6 col-lg-4 mb-4">
            {/* Added d-flex flex-column to make it a flex container */}
            <ArticleCard
              articleCardDetails={article}
              article={sampleBlog}
              router={router}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestArticlesComp;
