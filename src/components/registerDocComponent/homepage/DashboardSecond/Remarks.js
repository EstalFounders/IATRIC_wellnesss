import React from "react";

const Remarks = () => {
  return (
    <div
      style={{
        backgroundColor: "#f9f9f9",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <h3>Doctor&apos;s Remarks</h3>
      <div>No Remarks Found</div>
      {/* <textarea
        style={{
          width: '100%',
          height: '200px',
          padding: '10px',
          borderRadius: '5px',
          border: '1px solid #ddd',
          boxSizing: 'border-box',
        }}
        placeholder="Enter remarks here..."
      /> */}
    </div>
  );
};

export default Remarks;
