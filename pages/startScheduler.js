import React from "react";

const startScheduler = () => {
  // Function to handle button click
  const runJob = async () => {
    try {
      const response = await fetch("/api/lib/runCronJob", {
        method: "POST", // Make sure your API route accepts POST requests
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Job started successfully:", data);
        alert("Job started successfully");
      } else {
        throw new Error("Failed to start the job");
      }
    } catch (error) {
      console.error("Error starting the job:", error);
      alert("Error starting the job: " + error.message);
    }
  };

  return (
    <div>
      <button onClick={runJob}>start slot scheduler</button>
    </div>
  );
};

export default startScheduler;
