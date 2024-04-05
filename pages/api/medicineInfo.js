import { api } from "../../src/constant";

// pages/api/medicine.js
export default async function handler(req, res) {
    const { medicineName } = req.query;
  
    try {
      const response = await fetch(`${api.medicineInfoExternalCall}${medicineName}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      
      // Return the data to the client
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching medicine information:", error);
      res.status(500).json({ error: "Failed to fetch medicine information" });
    }
  }
  