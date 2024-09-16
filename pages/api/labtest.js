import { dbConnect } from "../../src/lib/db";
import LabTest from "../../src/models/lab-test";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const labTests = await LabTest.find();
      res.status(200).json(labTests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching lab tests" });
    }
  }
  if (req.method === "PUT") {
    console.log(req.query, 'req query')
    const { id } = req.query;

    try {
      // Find the lab test by ID and update with the request body
      const updatedLabTest = await LabTest.findByIdAndUpdate(id, req.body, {
        new: true, // Return the updated document
        runValidators: true, // Enforce schema validation
      });

      if (!updatedLabTest) {
        return res
          .status(404)
          .json({ success: false, message: "Lab test not found" });
      }

      res.status(200).json({ success: true, data: updatedLabTest });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
