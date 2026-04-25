import mongoose from "mongoose";
const { Schema } = mongoose;

const articlePostCategorySchema = new Schema(
  {
    categoryName: {
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
const modelName = "ArticlePostCategory";

// Check if the model already exists
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

// Compile the model if it doesn't exist
const ArticlePostCategory = mongoose.model(modelName, articlePostCategorySchema);

export default ArticlePostCategory;
