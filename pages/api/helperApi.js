// pages/api/uploadMedicineData.js

import fs from "fs";
import path from "path";
import { dbConnect } from "../../src/lib/db";
import Medicine from "../../src/models/medicineInfo";
import ArticlePostCategory from "../../src/models/postArticleCategorySchema";

// export default async function handler(req, res) {
//  try {
//     // Read the contents of medicine.json file
//     const filePath = path.resolve(
//       "/Users/macbook/Downloads/IATRIC_wellnesss/medicines.json"
//     );
//     const fileData = fs.readFileSync(filePath, "utf-8");

//     // Parse the JSON data
//     const jsonData = JSON.parse(fileData);

//     // Connect to the database
//     await dbConnect();

//     // Insert data into MongoDB collection using the model
//     await Medicine.insertMany(jsonData);

//     res.status(200).json({ message: "Medicine data uploaded successfully" });
//  } catch (error) {
//     console.error("Error uploading medicine data:", error);
//     res.status(500).json({ error: "Internal server error" });
//  }
// }

// --- sub-handlers ---

async function fetchArticleCateogries(req, res) {
  try {
    await dbConnect();
    const allPost = await ArticlePostCategory.find(); // example
    res.status(200).json({ allPost });
  } catch (error) {
    console.error("Error listing medicine data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// add more sub-handlers here in future, e.g. getById, delete, etc.
// async function getMedicineById(req, res) { ... }

// --- main handler (single default export) ---

export default async function handler(req, res) {
  const { action } = req.query; // /api/medicine?action=upload

  if (req.method === "GET" && action === "fetchCateogories") {
    return fetchArticleCateogries(req, res);
  }

  // Example future extension:
  // if (req.method === "GET" && action === "byId") {
  //   return getMedicineById(req, res);
  // }

  res.status(400).json({ error: "Invalid action or method" });
}
