import { dbConnect } from "../../../src/lib/db";
import Doctor from "../../../src/models/doctorModel";
import GlobalVar from "../../../src/models/globalVarSchema";
import LeaveRequestSchema from "../../../src/models/leaveRequest";

export default async function handler(req, res) {
  await dbConnect(); // Ensure the database connection

  if (req.method === "POST") {
    console.log(req.body, "body");

    const { id, name } = req.query;
    const { formData } = req.body;

    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    if (!formData || !formData.startTime || !formData.endTime) {
      return res
        .status(400)
        .json({ error: "startTime and endTime are required in the request body." });
    }

    try {
      // Count existing requests
      const totalRequests = await LeaveRequestSchema.countDocuments();

      // Update global count
      await GlobalVar.findOneAndUpdate(
        { name: "doctorLeaveRequestCount" },
        { value: totalRequests },
        { upsert: true, new: true }
      );

      // Create new request
      const newRequest = new LeaveRequestSchema({
        doctorId: id,
        name: name,
        startTime: formData.startTime,
        endTime: formData.endTime,
        reason: formData.reason,
      });

      await newRequest.save();

      res
        .status(200)
        .json({ message: "Leave request submitted successfully." });
    } catch (error) {
      console.error("Error saving leave request:", error);
      res.status(500).json({ error: "Failed to submit leave request." });
    }
  } else if (req.method == "GET") {
    try {
      const requests = await LeaveRequestSchema.find();
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending requests." });
    }
  } else if (req.method == "PUT") {
    const { id, action } = req.query;

    console.log(id, action, "id and action");

    try {
      const request = await LeaveRequestSchema.findById(id);
      if (!request) {
        return res.status(404).json({ error: "Request not found." });
      }

      if (action === "approve") {
        console.log(request, "82", request.updatedFields);
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
        request.rejectedAt = new Date()
        await request.save();

        res.status(200).json({ message: "Request rejected." });
      } else {
        res.status(400).json({ error: "Invalid action." });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to process update request." });
    }
  }
  else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
