import { dbConnect } from "../../src/lib/db";
import GlobalVar from "../../src/models/globalVarSchema";
import { logErrorToGoogleSheet } from "./helper";


export default async function handler(req, res) {
    await dbConnect();
    
   if (req.method == "GET") {
    try {
        const requests = await GlobalVar.find();
        res.status(200).json(requests);
      } catch (error) {
        await logErrorToGoogleSheet({
          apiName: "globalVar - GET",
          errorMessage: error.message || "Failed to fetch global vars",
          errorCode: "500",
          stackTrace: error.stack,
        });
        res.status(500).json({ error: "Failed to fetch pending requests." });
      }
} else  {
    return res.status(405).json({ error: "Method not allowed" });
}
}
