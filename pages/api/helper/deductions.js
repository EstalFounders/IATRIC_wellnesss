import { dbConnect } from "../../../src/lib/db";
import deductionSchema from "../../../src/models/deductionSchema";

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
          const deduction = await deductionSchema.find({}); // Fetch the first document
          if (!deduction) {
            return res.status(404).json({ error: "Deduction details not found" });
          }
          res.status(200).json(deduction);
        } catch (error) {
          console.log(error, 'errror')
          res.status(500).json({ error: "Internal server error", details: error.message });
        }
      } else {
        res.setHeader("Allow", ["GET"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
      }
}
