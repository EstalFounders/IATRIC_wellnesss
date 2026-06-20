import mongoose, { mongo } from "mongoose";
import { dbConnect } from "../../src/lib/db";
import LabTestPackages from "../../src/models/lab-test-packageSchema";
import { logErrorToGoogleSheet } from "./helper";

export default async function handler(req, res) {
  await dbConnect();
  console.log(req.method, "req");
  const { id } = req.query;
  console.log(id, "id on server");

  if (req.method === "GET") {
    try {
      let labTestsPackagesDetails;

      if (id) {
        console.log(id, "id on server 15");
        labTestsPackagesDetails = await LabTestPackages.find({
          category_id: id,
        });

        if (!labTestsPackagesDetails) {
          return res
            .status(404)
            .json({ message: "Lab test package not found." });
        }
      } else {
        labTestsPackagesDetails = await LabTestPackages.find({});
      }

      res.status(200).json(labTestsPackagesDetails);
    } catch (error) {
      console.error("Error fetching lab tests:", error);
      if (error.name === "CastError" && error.path === "_id") {
        res.status(400).json({ message: "Invalid ID format." });
      } else {
        await logErrorToGoogleSheet({
          apiName: "labtestPackagedetails - GET",
          errorMessage: error.message || "Failed to fetch lab test packages",
          errorCode: "500",
          stackTrace: error.stack,
          requestPayload: { id: req.query?.id },
        });
        res.status(500).json({ message: "Error fetching lab tests." });
      }
    }
  }
  if (req.method === "PUT") {
    console.log(req.query, "req query");
    const { id } = req.query;

    try {
      const updatedLabTest = await LabTestPackages.findByIdAndUpdate(
        id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedLabTest) {
        return res
          .status(404)
          .json({ success: false, message: "Lab test not found" });
      }

      res.status(200).json({ success: true, data: updatedLabTest });
    } catch (error) {
      await logErrorToGoogleSheet({
        apiName: "labtestPackagedetails - PUT",
        errorMessage: error.message || "Failed to update lab test package",
        errorCode: "400",
        stackTrace: error.stack,
        requestPayload: { id, ...req.body },
      });
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
      await logErrorToGoogleSheet({
        apiName: "labtestPackagedetails - POST",
        errorMessage: error.message || "Failed to create lab test package",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: req.body,
      });
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
      await logErrorToGoogleSheet({
        apiName: "labtestPackagedetails - DELETE",
        errorMessage: error.message || "Failed to delete lab test package",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: { id },
      });
      res.status(500).json({ error: "Failed to delete the test package" });
    }
  }
}