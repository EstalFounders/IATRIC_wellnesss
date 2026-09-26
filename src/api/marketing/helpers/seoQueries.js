// Database queries for the marketing panel SEO documents (collection: marketingPanel).
import MarketingPanel from "../../../models/marketingPanelSchema";
import { pathToPageIdentifier } from "../utils/seoPayload";

const SORT = { pageIdentifier: 1 };

export const listSeoEntries = () =>
  MarketingPanel.find({}).sort(SORT).lean();

export const findSeoEntryById = (id) =>
  MarketingPanel.findById(id).lean();

export const findSeoEntryByIdentifier = (pageIdentifier) =>
  MarketingPanel.findOne({ pageIdentifier }).lean();

/** Create a panel document (values are pre-sanitised by the caller). */
export const createSeoEntry = (values) => MarketingPanel.create(values);

export const updateSeoEntryById = (id, updates) =>
  MarketingPanel.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).lean();

export const deleteSeoEntryById = (id) =>
  MarketingPanel.findByIdAndDelete(id).lean();

/** Public lookup used by src/marketing/components/SeoMetadata.js. */
export const findActiveSeoEntryForPath = (pathname) => {
  const pageIdentifier = pathToPageIdentifier(pathname);

  if (!pageIdentifier) return null;

  return MarketingPanel.findOne({
    pageIdentifier,
    isActive: true,
  }).lean();
};
