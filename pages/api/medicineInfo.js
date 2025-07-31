// pages/api/medicines.js
import { dbConnect } from "../../src/lib/db";
import Medicine from "../../src/models/medicineInfo";

export default async function handler(req, res) {
  const { alphabet = "A", page = 1 } = req.query;

  try {
    await dbConnect();

    const regexPattern = new RegExp(`^${alphabet}`, "i");
    const skip = (parseInt(page) - 1);

    const totalCount = await Medicine.countDocuments({
      name: { $regex: regexPattern },
    });
    const medicines = await Medicine.find({ name: { $regex: regexPattern } })
      .skip(skip)
      // .limit(parseInt(limit));

    res.status(200).json({
      medicines,
      totalPages: Math.ceil(totalCount),
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching medicine information:", error);
    res.status(500).json({ error: "Failed to fetch medicine information" });
  }
}
