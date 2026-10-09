import { dbConnect } from "../../../src/lib/db";
import ConsultationFee from "../../../src/models/consultationFeeSchema";
import DoctorConsultationFee from "../../../src/models/doctorConsultationFeeSchema";
import { toFee, typeKeyFor } from "../../../src/utils/consultationFee";
import { cacheDelFees } from "../../../src/lib/cache";
import { logErrorToGoogleSheet } from "../helper";

// The super-admin panel posts flat form values: "" means "no fee", and the
// pre-seed rows stored the amount as a String ("198"), so every incoming value
// goes through `toFee` -> Number | null.
const MAX_NAME_LENGTH = 60;

const readName = (value) => String(value ?? "").trim().slice(0, MAX_NAME_LENGTH);

const readFlag = (value, fallback = true) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  const text = String(value).trim().toLowerCase();
  return text === "true" || text === "1" || text === "yes" || text === "on";
};

const readSortOrder = (value, fallback) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

/** "Diet advice" -> "diet_advice", widened until it is unused. */
const uniqueKey = (base, taken) => {
  const root = base || "custom";
  let key = root;
  let suffix = 2;
  while (taken.has(key)) key = `${root}_${suffix++}`;
  return key;
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const consultations = await ConsultationFee.find().sort({
        sortOrder: 1,
        name: 1,
      });
      return res.status(200).json(consultations);
    } catch (error) {
      await logErrorToGoogleSheet({
        apiName: "consultationFee - GET",
        errorMessage: error.message || "Failed to fetch consultations",
        errorCode: "500",
        stackTrace: error.stack,
      });
      return res.status(500).json({ error: "Failed to fetch consultations" });
    }
  }

  if (req.method === "POST") {
    try {
      const name = readName(req.body?.name);
      if (!name) return res.status(400).json({ error: "Name is required" });

      const rows = await ConsultationFee.find({}, { key: 1, sortOrder: 1 });
      const taken = new Set(rows.map((row) => row.key));
      const requestedKey = typeKeyFor(req.body?.key || name);
      const highestOrder = rows.reduce(
        (max, row) => Math.max(max, Number(row.sortOrder) || 0),
        0
      );

      const newConsultation = await ConsultationFee.create({
        key: uniqueKey(requestedKey, taken),
        name,
        fee: toFee(req.body?.fee),
        isActive: readFlag(req.body?.isActive),
        sortOrder: readSortOrder(req.body?.sortOrder, highestOrder + 10),
        // Only the seed script creates the fixed types; everything typed into
        // the panel is a custom (deletable) row.
        isSystem: false,
      });

      await cacheDelFees();
      return res.status(201).json(newConsultation);
    } catch (error) {
      await logErrorToGoogleSheet({
        apiName: "consultationFee - POST",
        errorMessage: error.message || "Failed to create consultation",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: req.body,
      });
      return res.status(500).json({ error: "Failed to create consultation" });
    }
  }

  if (req.method === "PUT") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "id is required" });

    try {
      const consultation = await ConsultationFee.findById(id);
      if (!consultation) {
        return res.status(404).json({ error: "Consultation type not found" });
      }

      // `key` is deliberately immutable: bookings, doctor documents and
      // doctor_consultation_fees rows already point at it, so renaming a type is
      // a `name` change and nothing else.
      if (req.body && "name" in req.body) {
        const name = readName(req.body.name);
        if (!name) return res.status(400).json({ error: "Name cannot be empty" });
        consultation.name = name;
      }
      if (req.body && "fee" in req.body) consultation.fee = toFee(req.body.fee);
      if (req.body && "isActive" in req.body) {
        consultation.isActive = readFlag(req.body.isActive, consultation.isActive);
      }
      if (req.body && "sortOrder" in req.body) {
        consultation.sortOrder = readSortOrder(
          req.body.sortOrder,
          consultation.sortOrder
        );
      }

      await consultation.save();
      await cacheDelFees();
      return res.status(200).json(consultation);
    } catch (error) {
      await logErrorToGoogleSheet({
        apiName: "consultationFee - PUT",
        errorMessage: error.message || "Failed to update consultation",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: { id, ...req.body },
      });
      return res.status(500).json({ error: "Failed to update consultation" });
    }
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "id is required" });

    try {
      const consultation = await ConsultationFee.findById(id);
      if (!consultation) {
        return res.status(404).json({ error: "Consultation type not found" });
      }
      if (consultation.isSystem) {
        return res.status(400).json({
          error: `"${consultation.name}" is a fixed consultation type and can be renamed but not deleted.`,
        });
      }

      // Per-doctor overrides for a deleted type would be unreachable today but
      // would come back to life if a type with the same key were created again.
      const removed = await DoctorConsultationFee.deleteMany({
        typeKey: consultation.key,
      });
      await consultation.deleteOne();
      await cacheDelFees();

      return res.status(200).json({
        message: "Consultation deleted successfully",
        key: consultation.key,
        removedFeeOverrides: removed.deletedCount || 0,
      });
    } catch (error) {
      await logErrorToGoogleSheet({
        apiName: "consultationFee - DELETE",
        errorMessage: error.message || "Failed to delete consultation",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: { id },
      });
      return res.status(500).json({ error: "Failed to delete consultation" });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
