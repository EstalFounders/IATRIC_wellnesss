import { api } from "../../../constant";

export const handleLeaveApproveOrRejectService = async (id, action) => {
    console.log("Approved request ID:", id, action);
    try {
      const response = await fetch(
        `${api.leaveRequest}/?id=${id}&action=${action}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
      } else {
        console.error(data.error);
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error while processing the request:", error);
      alert("Something went wrong. Please try again later.");
    }
  };