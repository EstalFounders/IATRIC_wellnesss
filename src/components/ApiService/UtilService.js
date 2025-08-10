import { api } from "../../constant";
import { setAllDoctors } from "../../store/slices/bookingWebsite/allDoctorsPageSlice";
import { setServiceOffered } from "../../store/slices/superAdmin/homepageSlice";

export const fetchBasicConfiguration = async (dispatch) => {
  try {
    const [doctorResponse, serviceOfferedResponse] = await Promise.all([
      fetch(api.addDoctor), // Replace with actual API endpoint
      fetch(api.serviceOffered), // Replace with actual API endpoint
    ]);

    const [doctorData, serviceOfferedData] = await Promise.all([
      doctorResponse.json(),
      serviceOfferedResponse.json(),
    ]);
    const doctor = doctorData;
    const serviceOfferd = serviceOfferedData;
    dispatch(setAllDoctors(doctor));
    dispatch(setServiceOffered(serviceOfferd));
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
  }
};
