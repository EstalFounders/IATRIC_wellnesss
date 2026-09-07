import { dbConnect } from "../../src/lib/db";
import Query from "../../src/models/query";
import { sendWhatsAppConfirmation } from "./lib/communication";
import { formatPhoneNumber } from "./utils/commonmethod";
import { company_number, WHATSAPP_USER_QUERY_TEMPLATE } from "./utils/constants";
import { rateLimit } from "../../src/lib/rateLimiter";
import { logErrorToGoogleSheet } from "./helper";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const query = await Query.find();
      res.status(200).json(query);
    } catch (error) {
      await logErrorToGoogleSheet({
        apiName: "userQuery - GET",
        errorMessage: error.message || "Failed to fetch user queries",
        errorCode: "500",
        stackTrace: error.stack,
      });
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
      // Rate limit user queries per IP to prevent spam
      const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
      const queryLimit = await rateLimit({
        key: `rl:userquery:ip:${ip}`,
        limit: 10,
        windowSeconds: 600,
      });
      if (!queryLimit.allowed) {
        return res.status(429).json({
          message: "Too many queries. Please try again later.",
          retryAfter: queryLimit.retryAfter,
        });
      }

      const payload = req.body;

      console.log(payload, "payload");

      if (!payload) {
        return res
          .status(400)
          .json({ message: "Category name and description are required" });
      }

      const newQuery = await Query.create(payload);

      const savedQuery = await newQuery.save();

// await sendWhatsAppConfirmation(
//     formatPhoneNumber(company_number),
//     payload,
//     WHATSAPP_USER_QUERY_TEMPLATE
//   );
 
      

      res.status(201).json(savedQuery);
    } catch (error) {
      console.log(error, "error");
      await logErrorToGoogleSheet({
        apiName: "userQuery - POST",
        errorMessage: error.message || "Failed to create user query",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: req.body,
      });
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
