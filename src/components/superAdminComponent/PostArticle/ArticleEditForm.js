import React, { useState, useEffect } from "react";

const ArticleEditForm = ({ initialData, onUpdate }) => {
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    date: "",
    readTime: "",
    author: "",
    description: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        category: initialData.category || "",
        title: initialData.title || "",
        date: initialData.date || "",
        readTime: initialData.readTime || "",
        author: initialData.author || "",
        description: initialData.description || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const body = {
      category: formData.category,
      title: formData.title,
      date: formData.date,
      readTime: formData.readTime,
      author: formData.author,
      description: formData.description,
    };
    onUpdate && onUpdate(body);
  };

  return (
    <form onSubmit={handleUpdate} className="p-3">
      <div className="mb-3">
        <label className="form-label">Category</label>
        <input
          type="text"
          className="form-control"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Enter category"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Title</label>
        <input
          type="text"
          className="form-control"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter title"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Date</label>
        <input
          type="date"
          className="form-control"
          name="date"
          value={formData.date}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Read Time</label>
        <input
          type="text"
          className="form-control"
          name="readTime"
          value={formData.readTime}
          onChange={handleChange}
          placeholder='e.g. "5 min read"'
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Author</label>
        <input
          type="text"
          className="form-control"
          name="author"
          value={formData.author}
          onChange={handleChange}
          placeholder="Enter author name"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea
          className="form-control"
          name="description"
          rows={6}
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter description/content"
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Update Changes
      </button>
    </form>
  );
};

export default ArticleEditForm;
