import { useCallback } from "react";
import { debounce } from "lodash";
import { api } from "../../constant";
import { setAllDoctors } from "../../store/slices/bookingWebsite/allDoctorsPageSlice";
import { setActiveConsultation } from "../../store/slices/bookingWebsite/otherConfig";
import { setServiceOffered } from "../../store/slices/superAdmin/homepageSlice";
import { getIconByName } from "../Common/commonMethod";

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

// fetchConsultations.js
export const fetchConsultations = async (dispatch) => {
  try {
    const response = await fetch(api.consiltationFee);
    if (!response.ok) throw new Error("Failed to fetch consultations");

    const data = await response.json();

    const activeConsultations = data
      .filter((item) => item.isActive)
      .map((item) => ({
        label: item.name,
        icon: getIconByName(item.name),
        navigateTo: item.name, // store only the target
      }));

    dispatch(setActiveConsultation(activeConsultations));
  } catch (error) {
    console.error("Error fetching consultations:", error);
  }
};

export const saveCallToBookQuery = async (dispatch) => {
  try {
    const response = await fetch(api.consiltationFee);
    if (!response.ok) throw new Error("Failed to fetch consultations");

    const data = await response.json();

    const activeConsultations = data
      .filter((item) => item.isActive)
      .map((item) => ({
        label: item.name,
        icon: getIconByName(item.name),
        navigateTo: item.name, // store only the target
      }));

    dispatch(setActiveConsultation(activeConsultations));
  } catch (error) {
    console.error("Error fetching consultations:", error);
  }
};

export const sendUserQuery = async (formData) => {
  try {
    const res = await fetch(api.joinUsQuery, { // Replace "api.userQuery" with your actual API endpoint URL
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      // Handle HTTP errors, e.g., 404, 500, etc.
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to submit user query.");
    }

    // Assuming the response is JSON
    const data = await res.json();
    return data;

  } catch (error) {
    // Log the error for debugging and re-throw it to be handled by the caller
    console.error("Error submitting user query:", error);
    throw error;
  }
};


export const fetchServiceSuggestions = debounce(async (description, setDescriptionOptions) => {
  if (description.trim() === "") {
    setDescriptionOptions([]);
    return;
  }
  try {
    const res = await fetch(api.serviceSuggestion, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description }),
    });
    const data = await res.json();
    setDescriptionOptions(data?.suggestions || []);
  } catch (err) {
    console.error("Failed to fetch suggestions", err);
    setDescriptionOptions([]);
  }
}, 500);