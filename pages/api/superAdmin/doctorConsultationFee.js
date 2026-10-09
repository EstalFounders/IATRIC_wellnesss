import mongoose from "mongoose";
import { dbConnect } from "../../../src/lib/db";
import Doctor from "../../../src/models/doctorModel";
import ConsultationFee from "../../../src/models/consultationFeeSchema";
import DoctorConsultationFee from "../../../src/models/doctorConsultationFeeSchema";
import { toFee } from "../../../src/utils/consultationFee";
import { cacheDelFees } from "../../../src/lib/cache";
import { logErrorToGoogleSheet } from "../helper";

// The per-doctor fee matrix behind /superAdmin/consultationFee.
//
//   GET  -> everything the page needs in one round trip:
//           { types, doctors, fees }
//           - types:   every consultation type (active *and* inactive, so the
//                      page can offer "show inactive types")
//           - doctors: every doctor with the fields the matrix prints
//           - fees:    only the explicit overrides. A missing (doctor, type)
//                      pair is not an error, it means "inherit the type default
//                      and, if that is empty too, charge nothing" - the
//                      resolution order in src/utils/consultationFee.js.
//
//   PUT  -> bulk cell save: { updates: [{ doctorId, typeKey, fee }] }
//           `fee: null` removes the override (the cell goes back to the type
//           default); a number >= 0 upserts it. One cache flush for the batch.
const MAX_UPDATES = 500;

const badRequest = (res, error, details) =>
  res.status(400).json(details && details.length ? { error, details } : { error });

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const [types, doctors, fees] = await Promise.all([
        ConsultationFee.find().sort({ sortOrder: 1, name: 1 }).lean(),
        Doctor.find(
          {},
          { name: 1, consultationType: 1, price: 1, isActive: 1 }
        ).sort({ name: 1 }).lean(),
        DoctorConsultationFee.find({}, { doctorId: 1, typeKey: 1, fee: 1 }).lean(),
      ]);

      return res.status(200).json({
        types,
        doctors,
        fees: fees.map((row) => ({
          doctorId: String(row.doctorId),
          typeKey: row.typeKey,
          fee: row.fee,
        })),
      });
    } catch (error) {
      await logErrorToGoogleSheet({
        apiName: "doctorConsultationFee - GET",
        errorMessage: error.message || "Failed to fetch doctor fees",
        errorCode: "500",
        stackTrace: error.stack,
      });
      return res.status(500).json({ error: "Failed to fetch doctor fees" });
    }
  }

  if (req.method === "PUT") {
    const updates = req.body?.updates;

    if (!Array.isArray(updates) || updates.length === 0) {
      return badRequest(res, "updates must be a non-empty array");
    }
    if (updates.length > MAX_UPDATES) {
      return badRequest(res, `updates cannot contain more than ${MAX_UPDATES} cells`);
    }

    try {
      const [types, doctors] = await Promise.all([
        ConsultationFee.find({}, { key: 1 }).lean(),
        Doctor.find({}, { _id: 1 }).lean(),
      ]);
      const knownTypeKeys = new Set(types.map((type) => type.key));
      const knownDoctorIds = new Set(doctors.map((doctor) => String(doctor._id)));

      const details = [];
      const merges = [];

      updates.forEach((update, index) => {
        const doctorId = String(update?.doctorId || "");
        const typeKey = String(update?.typeKey || "").trim();
        const fee = toFee(update?.fee);

        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
          details.push({ index, message: "Unknown doctor" });
          return;
        }
        if (!knownDoctorIds.has(doctorId)) {
          details.push({ index, message: "Doctor no longer exists" });
          return;
        }
        if (!knownTypeKeys.has(typeKey)) {
          details.push({ index, message: `Unknown consultation type "${typeKey}"` });
          return;
        }
        // A value that is neither blank (null -> inherit) nor a valid number is
        // a bad payload, not an inherited cell.
        if (fee === null && String(update?.fee ?? "").trim() !== "") {
          details.push({ index, message: "Fee must be a number 0 or greater" });
          return;
        }

        merges.push({ doctorId, typeKey, fee });
      });

      if (details.length) {
        return badRequest(res, "Some fees could not be saved", details);
      }

      const removals = merges.filter((merge) => merge.fee === null);
      const writes = merges.filter((merge) => merge.fee !== null);

      if (removals.length) {
        await DoctorConsultationFee.deleteMany({
          $or: removals.map(({ doctorId, typeKey }) => ({
            doctorId: new mongoose.Types.ObjectId(doctorId),
            typeKey,
          })),
        });
      }

      if (writes.length) {
        await DoctorConsultationFee.bulkWrite(
          writes.map(({ doctorId, typeKey, fee }) => ({
            updateOne: {
              filter: {
                doctorId: new mongoose.Types.ObjectId(doctorId),
                typeKey,
              },
              update: { $set: { fee } },
              upsert: true,
            },
          })),
          { ordered: false }
        );
      }

      await cacheDelFees();

      return res.status(200).json({
        saved: writes.length,
        removed: removals.length,
        fees: writes.map(({ doctorId, typeKey, fee }) => ({ doctorId, typeKey, fee })),
      });
    } catch (error) {
      await logErrorToGoogleSheet({
        apiName: "doctorConsultationFee - PUT",
        errorMessage: error.message || "Failed to save doctor fees",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: { count: updates.length },
      });
      return res.status(500).json({ error: "Failed to save doctor fees" });
    }
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
