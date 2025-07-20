import { api } from "../../constant";
import { setAllDoctor } from "../../store/slices/superAdmin/homepageSlice";

export const fetchDoctors = async (dispatch, setDoctors,setIsDoctorLoading) => {
  try {
    const response = await fetch(api.addDoctor);
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    dispatch(setAllDoctor(data));
    setDoctors(data); // Set the fetched data to state
    setIsDoctorLoading(false)
  } catch (error) {
    console.error("Failed to fetch doctors:", error);
  }
};
