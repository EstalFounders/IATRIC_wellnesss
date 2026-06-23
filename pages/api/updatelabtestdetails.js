// pages/api/update-test-details.js

import { dbConnect } from "../../src/lib/db";
import LabTestDetails from "../../src/models/lab-test-detailsSchema";
import { logErrorToGoogleSheet } from "./helper";


export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  await dbConnect(); // Connect to MongoDB

  if (method === 'POST') {
    try {
      const data = req.body;

      // Update the test details in the database
      const updatedTestDetails = await LabTestDetails.findByIdAndUpdate(id, data, {
        new: true, // Return the updated document
        runValidators: true, // Ensure validation rules are applied
      });

      if (!updatedTestDetails) {
        return res.status(404).json({ success: false, message: 'Test details not found' });
      }

      return res.status(200).json({ success: true, data: updatedTestDetails });
    } catch (error) {
      await logErrorToGoogleSheet({
        apiName: "updatelabtestdetails - POST",
        errorMessage: error.message || "Failed to update lab test details",
        errorCode: "400",
        stackTrace: error.stack,
        requestPayload: { id, ...req.body },
      });
      return res.status(400).json({ success: false, message: 'Error updating test details', error });
    }
  } else {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}