import { api } from "../../constant";
import { setServiceOffered } from "../../store/slices/superAdmin/homepageSlice";
import { setServiceOfferedData } from "../../store/slices/bookingWebsite/globalDataSlice";

export const bookConsultationApiCall = async ({
  consultationData,
  setIsLoading,
}) => {
  console.log(
    "Booking consultation with data:",
    consultationData,
    "setIsLoading:",
    setIsLoading
  );
  try {
    setIsLoading(true);
    const response = await fetch(api.bookConsultation, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(consultationData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    // const data = await response.json();
    return response; // Return the response data
  } catch (error) {
    console.error("Failed to book consultation:", error);
    throw error; // Re-throw the error for further handling
  } finally {
    setIsLoading(false);
  }
};

export const getConsultationByMeetingId = async (meetingId) => {
  try {
    const response = await fetch(`${api.consultationByMeetingId}/${meetingId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch consultation: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch consultation by meetingId:", error);
    throw error;
  }
};

export const getServiceOffered = async ({ dispatch }) => {
  try {
    const response = await fetch(api.serviceOffered);
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    dispatch(setServiceOffered(data));
    dispatch(setServiceOfferedData(data));
  } catch (error) {
    console.error("Failed to fetch doctors:", error);
  }
};
