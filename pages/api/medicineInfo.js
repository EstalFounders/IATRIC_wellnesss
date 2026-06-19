// pages/api/medicines.js
import { dbConnect } from "../../src/lib/db";
import Medicine from "../../src/models/medicineInfo";
import { logErrorToGoogleSheet } from "./helper";

export default async function handler(req, res) {
  const { medicineName } = req.query;

  try {
    await dbConnect();

    const query = medicineName ? { name: { $regex: new RegExp(`^${medicineName}`, "i") } } : {};
    const medicines = await Medicine.find(query);
    const totalCount = await Medicine.countDocuments(query);

    res.status(200).json({
  medicines,  
      totalCount,
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
