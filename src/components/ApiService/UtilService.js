import { api } from "../../constant";

export const fetchBasicConfiguration = async () => {
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
    // dispatch(setAllappointments(appointments));
    // dispatch(setAllLabTest(labTest));
    // dispatch(setAllLab(labData));
    // dispatch(setServiceOffered(serviceOfferedData));
    // Calculate totals
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
  }
};