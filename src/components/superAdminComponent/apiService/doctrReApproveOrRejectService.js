import { api } from "../../../constant";

// services/doctorService.js
export const handleDoctReqApproveOrRejectService = async (id, action) => {
    console.log("Processing request ID:", id, action);
    try {
      const response = await fetch(`${api.doctorUpdateRequest}/?id=${id}&action=${action}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("Request processed successfully:", data);
        return { success: true, data };
      } else {
        console.error("API Error:", data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Error while processing the request:", error);
      return { success: false, error: "Something went wrong. Please try again later." };
    }
  };
  