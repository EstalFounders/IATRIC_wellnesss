import { dbConnect } from "../../src/lib/db";
import LabTestDetails from "../../src/models/lab-test-detailsSchema";
export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const labTests = await LabTestDetails.find();
      res.status(200).json(labTests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching lab tests" });
    }
  }
  if (req.method === "PUT") {
    console.log(req.query, "req query");
    const { id } = req.query;

    try {
      // Find the lab test by ID and update with the request body
      const updatedLabTest = await LabTestDetails.findByIdAndUpdate(
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
      const { category_name, category_description } = req.body;

      if (!category_name || !category_description) {
        return res
          .status(400)
          .json({ message: "Category name and description are required" });
      }

      const newCategory = new LabTestDetails({
        title,
        description,
        sample_required,
        preparation_required,
        faqs,
        price,
        discount,
        report_within,
      });

      const savedCategory = await newCategory.save();

      res.status(201).json(savedCategory);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating category", error: error.message });
    }
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    console.log(id, "id on server");
    try {
      const deletedItem = await LabTestDetails.deleteOne({ _id: id });

      if (!deletedItem) {
        return res.status(404).json({ message: "Item not found" });
      }

      res
        .status(200)
        .json({ message: "Item successfully deleted", deletedItem });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
