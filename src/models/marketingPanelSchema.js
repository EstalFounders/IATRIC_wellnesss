import mongoose from "mongoose";

const { Schema } = mongoose;

/** One blog post stored inside marketingPanel.blogDetails.posts. */
const blogPostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    excerpt: { type: String, trim: true, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String, trim: true, default: "" },
    author: { type: String, trim: true, default: "Marketing Team" },
    isPublished: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

/**
 * Marketing panel configuration - one document per site page.
 * Collection name is fixed to `marketingPanel` (mongoose would otherwise
 * pluralise the model name to `marketingpanels`).
 */
const marketingPanelSchema = new Schema(
  {
    pageIdentifier: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    pageTitle: {
      type: String,
      trim: true,
      default: "",
    },
    seoKeywords: {
      type: [String],
      default: [],
    },
    metaDescription: {
      type: String,
      trim: true,
      default: "",
    },
    // Published/unpublished switch (additive: lets an entry be parked without
    // deleting it; the public metadata lookup only returns active entries).
    isActive: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: String,
      default: "",
    },
    // Reserved for the next phases (banner popup + Demo5Blog1 management).
    bannerPopup: {
      type: Schema.Types.Mixed,
      default: {},
    },
    // Blog posts managed from the marketing panel (Phase 4).
    blogDetails: {
      posts: { type: [blogPostSchema], default: [] },
    },
  },
  { timestamps: true, collection: "marketingPanel", minimize: false }
);

const modelName = "MarketingPanel";

// Check if the model already exists to prevent overwriting
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

const MarketingPanel = mongoose.model(modelName, marketingPanelSchema);

export default MarketingPanel;
