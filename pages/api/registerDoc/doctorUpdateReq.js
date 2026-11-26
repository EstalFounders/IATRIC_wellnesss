import { dbConnect } from "../../../src/lib/db";
import DoctorDetailsChangeReq from "../../../src/models/docDetailsChangeReqSchema";
import Doctor from "../../../src/models/doctorModel";
import { firstWeeklyRange, normalizeWeeklyAvailability, validateWeeklyAvailability } from "../../../src/customUtils/weeklyAvailability";
import { generateSlotsForDoctor } from "../../../src/lib/slotGeneration";
import { logErrorToGoogleSheet } from "../helper";

export default async function handler(req, res) {
  await dbConnect();
  console.log(req.method, "method");
  if (req.method === "POST") {
    console.log(req.body, "body");
    const { id, name } = req.query;

    const { changedFields } = req.body;
    console.log(changedFields, "changesfields");
    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    try {
      const newRequest = new DoctorDetailsChangeReq({
        doctorId: id,
        name: name,
        updatedFields: changedFields,
      });

      console.log(newRequest, "new request");

      await newRequest.save();

      res
        .status(200)
        .json({ message: "Update request submitted successfully." });
    } catch (error) {
      console.error("Error saving update request:", error);
      await logErrorToGoogleSheet({
        apiName: "doctorUpdateReq - POST",
        errorMessage: error.message || "Failed to submit update request",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: { id, name, changedFields },
      });
      res.status(500).json({ error: "Failed to submit update request." });
    }
  } else if (req.method == "GET") {
    try {
      const requests = await DoctorDetailsChangeReq.find();
      res.status(200).json(requests);
    } catch (error) {
      await logErrorToGoogleSheet({
        apiName: "doctorUpdateReq - GET",
        errorMessage: error.message || "Failed to fetch update requests",
        errorCode: "500",
        stackTrace: error.stack,
      });
      res.status(500).json({ error: "Failed to fetch pending requests." });
    }
  } else if (req.method == "PUT") {
    const { id, action } = req.query;

    console.log(id, action, "id and action");

    try {
      const request = await DoctorDetailsChangeReq.findById(id);
      console.log("82");
      if (!request) {
        return res.status(404).json({ error: "Request not found." });
      }

      if (action === "approve") {
        console.log(request, "82", request.updatedFields);
        const id = request.doctorId.toString();
        const fieldsToUpdate = { ...request.updatedFields };
        if (fieldsToUpdate.weeklyAvailability !== undefined) {
          const error = validateWeeklyAvailability(fieldsToUpdate.weeklyAvailability);
          if (error) return res.status(400).json({ error });
          fieldsToUpdate.weeklyAvailability = normalizeWeeklyAvailability(fieldsToUpdate.weeklyAvailability);
          const first = firstWeeklyRange(fieldsToUpdate.weeklyAvailability);
          const asUtcDate = (time) => {
            const [hours, minutes] = time.split(":").map(Number);
            return new Date(Date.UTC(1970, 0, 1, hours, minutes));
          };
          fieldsToUpdate.slotStartTime = asUtcDate(first.startTime);
          fieldsToUpdate.slotEndTime = asUtcDate(first.endTime);
        }
        const updatedDoctor = await Doctor.findByIdAndUpdate(id, fieldsToUpdate, {
          new: true,
        });
        if (fieldsToUpdate.weeklyAvailability !== undefined) {
          generateSlotsForDoctor(updatedDoctor).catch((slotError) =>
            console.error(`Slot generation failed for doctor ${id}:`, slotError?.message || slotError)
          );
        }
        request.status = "approved";
        request.approvedAt = new Date();

        await request.save();
        res
          .status(200)
          .json({ message: "Request approved and doctor profile updated." });
      } else if (action === "reject") {
        request.status = "rejected";
        request.rejectedAt = new Date();
        await request.save();

        res.status(200).json({ message: "Request rejected." });
      } else {
        res.status(400).json({ error: "Invalid action." });
      }
    } catch (error) {
      await logErrorToGoogleSheet({
        apiName: "doctorUpdateReq - PUT",
        errorMessage: error.message || "Failed to process update request",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: { id, action },
      });
      res.status(500).json({ error: "Failed to process update request." });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
