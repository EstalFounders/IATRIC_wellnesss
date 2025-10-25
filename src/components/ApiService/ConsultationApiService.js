import { api } from "../../constant";
import { setAllDoctor } from "../../store/slices/superAdmin/homepageSlice";

export const fetchDoctors = async (dispatch, setDoctors, setIsDoctorLoading) => {
  try {
    const response = await fetch(api.addDoctor);
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    
    // Always dispatch to the Redux store
    dispatch(setAllDoctor(data));

    // Only set the local state if the setter functions are provided
    if (setDoctors) {
      setDoctors(data); 
    }
    if (setIsDoctorLoading) {
      setIsDoctorLoading(false);
    }
  } catch (error) {
    console.error("Failed to fetch doctors:", error);
    // You could also add a check here to handle the loading state on error
    if (setIsDoctorLoading) {
      setIsDoctorLoading(false);
    }
  }
};

