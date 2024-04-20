// pages/api/uploadMedicineData.js

import fs from "fs";
import path from "path";
import { dbConnect } from "../../src/lib/db";
import Medicine from "../../src/models/medicineInfo";

export default async function handler(req, res) {
 try {
    // Read the contents of medicine.json file
    const filePath = path.resolve(
      "/Users/macbook/Downloads/IATRIC_wellnesss/medicines.json"
    );
    const fileData = fs.readFileSync(filePath, "utf-8");

    // Parse the JSON data
    const jsonData = JSON.parse(fileData);

    // Connect to the database
    await dbConnect();

    // Insert data into MongoDB collection using the model
    await Medicine.insertMany(jsonData);

    res.status(200).json({ message: "Medicine data uploaded successfully" });
 } catch (error) {
    console.error("Error uploading medicine data:", error);
    res.status(500).json({ error: "Internal server error" });
 }
}
