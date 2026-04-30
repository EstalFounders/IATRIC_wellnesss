import axios from "axios";

export const postMedicineApi = async (medicineName) => {
  try {
    const response = await axios.post("/api/medicine", { name: medicineName });
    return response.data;
  } catch (error) {
    console.error("Error posting medicine:", error);
    throw error;
  }
};
