import { api } from "../../constant";
import { setAllMedicineDetails } from "../../store/slices/medicine/MedicineHomePageApiData";

export const fetchMedicine = async (dispatch, setLoading) => {
  try {
    const response = await fetch(api.getAllMedicine);
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    dispatch(setAllMedicineDetails(data));
    setLoading(false);
  } catch (error) {
    console.error("Failed to fetch Medicine:", error);
  }
};
