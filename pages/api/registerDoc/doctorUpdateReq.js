import { dbConnect } from "../../../src/lib/db";
import DoctorDetailsChangeReq from "../../../src/models/docDetailsChangeReqSchema";
import multiparty from "multiparty";
import GlobalVar from "../../../src/models/globalVarSchema";
import Doctor from "../../../src/models/doctorModel";

export default async function handler(req, res) {
  await dbConnect();
  console.log(req.method, "method");
  if (req.method === "POST") {
    // Extract id from query parameters
    console.log(req.body, "body");
    const { id, name } = req.query;

    const { changedFields } = req.body;
    console.log(changedFields, "changesfields");
    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    try {
      // Count existing requests
      const totalRequests = await DoctorDetailsChangeReq.countDocuments();

      // Update global count
      await GlobalVar.findOneAndUpdate(
        { name: "doctorUpdateRequestCount" },
        { value: totalRequests },
        { upsert: true, new: true }
      );

      // Create new request
      const newRequest = new DoctorDetailsChangeReq({
        doctorId: id,
        name: name,
        updatedFields: changedFields,
      });

      await newRequest.save();

      res
        .status(200)
        .json({ message: "Update request submitted successfully." });
    } catch (error) {
      console.error("Error saving update request:", error);
      res.status(500).json({ error: "Failed to submit update request." });
    }
  } else if (req.method == "GET") {
    try {
      const requests = await DoctorDetailsChangeReq.find();
      res.status(200).json(requests);
    } catch (error) {
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
        const fieldsToUpdate = request.updatedFields;
        // Update the doctor's profile
        await Doctor.findByIdAndUpdate(id, fieldsToUpdate, {
          new: true,
        });
        // Mark request as approved
        request.status = "approved";
        request.approvedAt = new Date();

        await request.save();
        res
          .status(200)
          .json({ message: "Request approved and doctor profile updated." });
      } else if (action === "reject") {
        // Mark request as rejected
        request.status = "rejected";
        request.rejectedAt = new Date();
        await request.save();

        res.status(200).json({ message: "Request rejected." });
      } else {
        res.status(400).json({ error: "Invalid action." });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to process update request." });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
