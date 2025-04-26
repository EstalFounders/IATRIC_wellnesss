import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import LabTest from "../../src/models/lab-test"; // Assuming you've defined a model schema
import LabTestDetails from "../../src/models/lab-test-detailsSchema"; // For storing test details
import { dbConnect } from "../../src/lib/db";
import { sendWhatsAppMessage } from "./lib/communication";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await sendWhatsAppMessage(
      "7455992234",
      `Your Audio consultation is booked successfully.`
    );
  } catch (error) {
    console.error("Error connecting to database:", error);
    return res.status(500).json({ message: "Internal server error" });
  }

  //code for update new column in db

  // try {
  //   // Update all documents to ensure the 'newField' exists with a default value if not present
  //   const result = await LabTestDetails.updateMany(
  //     { newField: { $exists: false } },    // Filter documents without the new field
  //     { $set: { isActive: true } } // Add the new field with a default value
  //   );

  //   res.status(200).json({ success: true, message: 'All documents updated', result });
  // } catch (error) {
  //   console.error("Error updating documents:", error);
  //   res.status(500).json({ success: false, message: 'Failed to update documents', error });
  // }

  //  code for storing lab data

  // try {
  //   // Directory path where the JSON files are stored
  //   const directoryPath = path.join(process.cwd(), "Data"); // Assuming your JSON files are in a 'data' folder
  //   console.log(directoryPath, "directory path");
  //   // Read all files in the directory
  //   const files = fs.readdirSync(directoryPath);

  //   // Loop through all files and process each JSON file
  //   for (const file of files) {
  //     const filePath = path.join(directoryPath, file);

  //     // Read and parse the JSON file
  //     const fileContent = fs.readFileSync(filePath, "utf-8");
  //     const jsonData = JSON.parse(fileContent);
  //     // console.log(jsonData, 'json data line 29')
  //     // Create a dummy category description
  //     const categoryDescription = `Auto generated description`;

  //     // Insert the category into the Lab-Test collection
  //     const newCategory = new LabTest({
  //       category_name: path.parse(file).name, // Using file name as category name
  //       category_description: categoryDescription,
  //     });
  //     const savedCategory = await newCategory.save();
  //     console.log(savedCategory, "saved category");
  //     // Loop through tests and store them in LabTestDetails collection
  //     for (const test of jsonData) {
  //       console.log(test, "test line 42");
  //       const newTestDetails = new LabTestDetails({
  //         category_id: savedCategory._id, // Reference to the Lab-Test category
  //         price: "300",
  //         discount: "20",
  //         report_within: "6 hours",
  //         ...test
  //       });
  //       await newTestDetails.save();
  //     }
  //   }

  //   return res
  //     .status(200)
  //     .json({ message: "Data successfully stored in the database" });
  // } catch (error) {
  //   console.error("Error processing data:", error);
  //   return res.status(500).json({ message: "Internal server error" });
  // }
}
