import { dbConnect } from "../../src/lib/db";
import Query from "../../src/models/query";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const query = await Query.find();
      res.status(200).json(query);
    } catch (error) {
      res.status(500).json({ message: "Error fetching lab tests" });
    }
  }
//   if (req.method === "PUT") {
//     console.log(req.query, "req query");
//     const { id } = req.query;

//     try {
//       // Find the lab test by ID and update with the request body
//       const updatedLabTest = await LabTest.findByIdAndUpdate(id, req.body, {
//         new: true, // Return the updated document
//         runValidators: true, // Enforce schema validation
//       });

//       if (!updatedLabTest) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Lab test not found" });
//       }

//       res.status(200).json({ success: true, data: updatedLabTest });
//     } catch (error) {
//       res.status(400).json({ success: false, error: error.message });
//     }
//   }

  if (req.method === "POST") {
    try {
      const payload = req.body;

      console.log(payload, "payload");

      if (!payload) {
        return res
          .status(400)
          .json({ message: "Category name and description are required" });
      }

      const newQuery = await Query.create(payload);

      const savedQuery = await newQuery.save();

      res.status(201).json(savedQuery);
    } catch (error) {
      console.log(error, "error");
      res
        .status(500)
        .json({ message: "Error creating category", error: error.message });
    }
  }

//   if (req.method === "DELETE") {
//     const { id } = req.query;
//     console.log(id, "id on server");
//     try {
//       const deletedItem = await LabTest.deleteOne({ _id: id });

//       if (!deletedItem) {
//         return res.status(404).json({ message: "Item not found" });
//       }

//       res
//         .status(200)
//         .json({ message: "Item successfully deleted", deletedItem });
//     } catch (error) {
//       console.error("Delete error:", error);
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   } else {
//     return res.status(405).json({ message: "Method Not Allowed" });
//   }
}
