// pages/api/medicines.js
import { dbConnect } from "../../src/lib/db";
import Medicine from "../../src/models/medicineInfo";
import { logErrorToGoogleSheet } from "./helper";

// Escape user input before it reaches a RegExp - a bare "(" used to throw and
// answer 500, which the callers only showed as "no results".
const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const DEFAULT_LIMIT = 50;
// Hard cap on the page size. Without a limit a one-letter search matched the
// whole catalogue (27k documents / ~6 MB), the browser aborted the request and
// the prescription form reported it as "Failed to fetch medicines".
const MAX_LIMIT = 500;

export default async function handler(req, res) {
  const { medicineName, search, alphabet } = req.query;

  try {
    await dbConnect();

    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, 1),
      MAX_LIMIT,
    );
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

    const query = {};
    const alphabetTerm = alphabet ? String(alphabet).trim() : "";
    const nameTerm = medicineName ? String(medicineName).trim() : "";
    const searchTerm = search ? String(search).trim() : "";

    if (alphabetTerm) {
      // Alphabet tab on /medicine/homepage - prefix match on the letter.
      query.name = { $regex: `^${escapeRegex(alphabetTerm)}`, $options: "i" };
    } else if (nameTerm) {
      // Prescription autocomplete - prefix match (behaviour unchanged).
      query.name = { $regex: `^${escapeRegex(nameTerm)}`, $options: "i" };
    } else if (searchTerm) {
      // Free-text search on /medicine/homepage - anywhere in the name.
      query.name = { $regex: escapeRegex(searchTerm), $options: "i" };
    }

    // Sort + page server side so the payload stays small and the caller can
    // walk the full result set instead of downloading it in one go.
    const [medicines, totalCount] = await Promise.all([
      Medicine.find(query)
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Medicine.countDocuments(query),
    ]);

    res.status(200).json({
  medicines,  
      totalCount,
      page,
      limit,
      totalPages: Math.max(Math.ceil(totalCount / limit), 1),
    });

    
  } catch (error) {
    console.error("Error fetching medicine information:", error);
    await logErrorToGoogleSheet({
      apiName: "medicineInfo",
      errorMessage: error.message || "Failed to fetch medicine info",
      errorCode: "500",
      stackTrace: error.stack,
      requestPayload: { medicineName: req.query?.medicineName },
    });
    res.status(500).json({ error: "Failed to fetch medicine information" });
  }
}
