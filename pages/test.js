import { useState } from "react";
import LabTestComponent from "../src/components/superAdminComponent/LabTest/Labtest";

export default function HomePage() {
  const [message, setMessage] = useState("");

  const handleFetch = async () => {
    try {
      const response = await fetch("/api/test", {
        method: "POST",
      });
      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      setMessage("Error occurred while storing data");
      console.error("Fetch error:", error);
    }
  };

  return (
    <div>
      <h1>Store Lab Test Data</h1>
      {/* <button onClick={handleFetch}>Store Data</button> */}
      <button onClick={handleFetch}>Send WhatsApp</button>
      {message && <p>{message}</p>}
    </div>
  );
}
