import { dbConnect } from "../../src/lib/db";
import LabTestDetails from "../../src/models/lab-test-detailsSchema";
import LabTestPackagesCatgoryScehma from "../../src/models/lab-test-package-categorySchema";
import { logErrorToGoogleSheet } from "./helper";

export default async function handler(req, res) {
  await dbConnect();
  console.log(req.method, "req");
  if (req.method === "GET") {
    try {
      const labTestsPackagesCategoryDetails =
        await LabTestPackagesCatgoryScehma.find({});
      res.status(200).json(labTestsPackagesCategoryDetails);
    } catch (error) {
      await logErrorToGoogleSheet({
        apiName: "labtestPackagescategorydetails - GET",
        errorMessage: error.message || "Failed to fetch lab test categories",
        errorCode: "500",
        stackTrace: error.stack,
      });
      res.status(500).json({ message: "Error fetching lab tests" });
    }
  }
  if (req.method === "PUT") {
    console.log(req.query, "req query");
    const { id } = req.query;

    try {
      const updatedLabTest =
        await LabTestPackagesCatgoryScehma.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });

      if (!updatedLabTest) {
        return res
          .status(404)
          .json({ success: false, message: "Lab test not found" });
      }

      res.status(200).json({ success: true, data: updatedLabTest });
    } catch (error) {
      await logErrorToGoogleSheet({
        apiName: "labtestPackagescategorydetails - PUT",
        errorMessage: error.message || "Failed to update lab test category",
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
      const newTestDetails = new LabTestPackagesCatgoryScehma({
        category_name,
        category_description,
      });
      const savedTestDetails = await newTestDetails.save();

      res.status(201).json(savedTestDetails);
    } catch (error) {
      await logErrorToGoogleSheet({
        apiName: "labtestPackagescategorydetails - POST",
        errorMessage: error.message || "Failed to create lab test category",
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
      const deletedTest = await LabTestPackagesCatgoryScehma.findByIdAndDelete(
        id
      );
      if (!deletedTest) {
        return res.status(404).json({ error: "Test package not found" });
      }
      res.status(200).json({ message: "Test package deleted successfully" });
    } catch (error) {
      await logErrorToGoogleSheet({
        apiName: "labtestPackagescategorydetails - DELETE",
        errorMessage: error.message || "Failed to delete lab test category",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: { id },
      });
      res.status(500).json({ error: "Failed to delete the test package" });
    }
  }
}