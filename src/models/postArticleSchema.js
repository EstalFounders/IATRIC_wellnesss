import mongoose from "mongoose";
const { Schema } = mongoose;

const postArticleSchema = new Schema(
  {
    category: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    date: {
      type: String,
    },
    readTime: {
      type: String,
    },
    author: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Use a unique model identifier
const modelName = "ArticlePost";

// Check if the model already exists
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

// Compile the model if it doesn't exist
const ArticlePost = mongoose.model(modelName, postArticleSchema);

export default ArticlePost;
