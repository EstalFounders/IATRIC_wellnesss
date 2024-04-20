import { dbConnect } from '../../src/lib/db'; // Import the MongoDB connection function
import Medicine from '../../src/models/medicineInfo';

export default async function handler(req, res) {
    const { medicineName } = req.query;
  
    try {
        const client = await dbConnect(); // Connect to MongoDB

        const regexPattern = new RegExp(`^${medicineName}`, 'i');

        // Search for medicine documents based on the medicineName
        const result = await Medicine.find({ name: { $regex: regexPattern } });

        // Return the search result to the client
        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching medicine information:", error);
        res.status(500).json({ error: "Failed to fetch medicine information" });
    }
}
