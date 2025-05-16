import { dbConnect } from "../../src/lib/db";
import GlobalVar from "../../src/models/globalVarSchema";


export default async function handler(req, res) {
    await dbConnect();
    
   if (req.method == "GET") {
    try {
        const requests = await GlobalVar.find();
        res.status(200).json(requests);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch pending requests." });
      }
} else  {
    return res.status(405).json({ error: "Method not allowed" });
}
}
