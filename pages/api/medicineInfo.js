// pages/api/medicines.js
import { dbConnect } from "../../src/lib/db";
import Medicine from "../../src/models/medicineInfo";

export default async function handler(req, res) {
  const { alphabet } = req.query;

  try {
    await dbConnect();

    const regexPattern = new RegExp(`^${alphabet}`, "i");

    const totalCount = await Medicine.countDocuments({
      name: { $regex: regexPattern },
    });
    const medicines = await Medicine.find({ name: { $regex: regexPattern } });

    res.status(200).json({
      medicines,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching medicine information:", error);
    res.status(500).json({ error: "Failed to fetch medicine information" });
  }
}
