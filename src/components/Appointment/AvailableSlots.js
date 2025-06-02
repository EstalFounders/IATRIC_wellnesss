import React from "react";
import { formatData } from "../registerDocComponent/utils/helper";
import { extractDate, formatTime } from "../helper";

const AvailableSlots = ({ slots, onBookSlot, message }) => {

return (
    <div className="container mt-5">
        <div className="text-center mb-5 text-success">{message}</div>
        {slots.length > 0 ? (
            <div className="row">
                {slots.map((slot, index) => (
                    <div key={index} className="col-md-4 mb-4">
                        <div className="card shadow-lg border-0">
                            <div className="card-body">
                                {/* <div className="card-title text-primary">
                                    Slot {index + 1}
                                </div> */}
                                <div className="card-text text-secondary">
                                    <strong>Date:</strong> {extractDate(slot.startTime)}
                                </div>
                                <div
                                    className="card-text d-flex justify-content-between align-items-center"
                                    key={slot._id}
                                    style={{
                                        color: "black",
                                        border: "1px solid black",
                                        padding: "10px",
                                        margin: "10px 0",
                                        borderRadius: "5px",
                                        width: "100%",
                                        maxWidth: "200px",
                                        textAlign: "center",
                                        cursor: "pointer",
                                        transition: "background-color 0.3s",
                                        fontSize: "0.9rem",
                                        lineHeight: "1.4",
                                        display: "inline-block",
                                    }}
                                    onClick={() => handleSlotSelection(slot)}
                                >
                                    <span style={{ fontWeight: "bold" }}>Time:</span>{" "}
                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </div>
                                <button
                                    className="btn btn-success"
                                    onClick={() => onBookSlot(slot)}
                                >
                                    Book Slot
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center text-muted">
                <h4>No slots available at the moment</h4>
            </div>
        )}
    </div>
);
};

export default AvailableSlots;
