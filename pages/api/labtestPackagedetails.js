import mongoose, { mongo } from "mongoose";
import { dbConnect } from "../../src/lib/db";
import LabTestPackages from "../../src/models/lab-test-packageSchema";

export default async function handler(req, res) {
  await dbConnect();
  console.log(req.method, "req");
  const { id } = req.query; // Destructure id from req.query
  console.log(id, "id on server");

  if (req.method === "GET") {
    try {
      let labTestsPackagesDetails;

      if (id) {
        console.log(id, "id on server 15");
        // If an ID is provided in the query, find a specific package by its _id
        labTestsPackagesDetails = await LabTestPackages.find({
          category_id: id,
        });

        // Optional: If you expect a single document and want to return 404 if not found
        if (!labTestsPackagesDetails) {
          return res
            .status(404)
            .json({ message: "Lab test package not found." });
        }
      } else {
        // If no ID is provided, fetch all lab test packages
        labTestsPackagesDetails = await LabTestPackages.find({}); // find({}) fetches all documents
      }

      res.status(200).json(labTestsPackagesDetails);
    } catch (error) {
      console.error("Error fetching lab tests:", error); // Log the actual error for debugging
      // Provide a more specific error message if the ID format is invalid
      if (error.name === "CastError" && error.path === "_id") {
        res.status(400).json({ message: "Invalid ID format." });
      } else {
        res.status(500).json({ message: "Error fetching lab tests." });
      }
    }
  }
  if (req.method === "PUT") {
    console.log(req.query, "req query");
    const { id } = req.query;

    try {
      // Find the lab test by ID and update with the request body
      const updatedLabTest = await LabTestPackages.findByIdAndUpdate(
        id,
        req.body,
        {
          new: true, // Return the updated document
          runValidators: true, // Enforce schema validation
        }
      );

      if (!updatedLabTest) {
        return res
          .status(404)
          .json({ success: false, message: "Lab test not found" });
      }

      res.status(200).json({ success: true, data: updatedLabTest });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const {
        title,
        description,
        sample_required,
        preparation_required,
        price,
        discount,
        report_within,
        test_included,
        category_id,
      } = req.body;

      if (
        !title ||
        !description ||
        !sample_required ||
        !preparation_required ||
        !price ||
        !report_within ||
        !category_id
      ) {
        return res
          .status(400)
          .json({ message: "All required fields must be provided." });
      }
      const newTestDetails = new LabTestPackages({
        title,
        description,
        sample_required,
        preparation_required,
        price,
        discount,
        report_within,
        test_included,
        category_id,
      });
      const savedTestDetails = await newTestDetails.save();

      res.status(201).json(savedTestDetails);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error saving test details", error: error.message });
    }
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    try {
      const deletedTest = await LabTestPackages.findByIdAndDelete(id);
      if (!deletedTest) {
        return res.status(404).json({ error: "Test package not found" });
      }
      res.status(200).json({ message: "Test package deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete the test package" });
    }
  }
}
