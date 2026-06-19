import { dbConnect } from "../../../../src/lib/db";
import LabTestDetails from "../../../../src/models/lab-test-detailsSchema";
import { logErrorToGoogleSheet } from "../../helper";

export default async function handler(req, res) {
  await dbConnect();
  console.log("req");
  if (req.method === "GET") {
    try {
      const labTestsDetails = await LabTestDetails.find({});
      res.status(200).json(labTestsDetails);
    } catch (error) {
      await logErrorToGoogleSheet({
        apiName: "superAdmin/labTest/labTestDetails - GET",
        errorMessage: error.message || "Failed to fetch lab test details",
        errorCode: "500",
        stackTrace: error.stack,
      });
      res.status(500).json({ message: error });
    }
  }
}