// pages/api/bookLabTest.js
// // pages/api/bookLabTest.js
import { dbConnect } from "../../src/lib/db";
import BookLabTest from "../../src/models/bookLabTestSchema";
import { logErrorToGoogleSheet } from "./helper";

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === "POST") {
    // Connect to MongoDB
    const { name, mobileNumber, paymentMethod, cartItemsIds, totalPrice } =
      req.body;
    // Validate request data
    if (
      !name ||
      !mobileNumber ||
      !paymentMethod ||
      !cartItemsIds ||
      !totalPrice
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }
    try {

      const savedBooking = await BookLabTest.create({
        name,
        mobileNumber,
        paymentMethod,
        cartItemsIds,
        totalPrice,
      })
      res.status(201).json({ success: true, booking: savedBooking });
    } catch (error) {
      console.error("Error creating booking:", error);
      await logErrorToGoogleSheet({
        apiName: "bookLabTest - POST",
        errorMessage: error.message || "Booking creation failed",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: { name, mobileNumber, paymentMethod, totalPrice },
      });
      res.status(500).json({ error: "Server error. Please try again later." });
    }
  } else if (req.method === "GET") {
    let labTests
    try {
      await dbConnect();
      labTests = await BookLabTest.find({})
      
      res.status(200).json({ labTests });
    } catch (error) {
      console.error(error);
      await logErrorToGoogleSheet({
        apiName: "bookLabTest - GET",
        errorMessage: error.message || "Failed to fetch lab tests",
        errorCode: "500",
        stackTrace: error.stack,
      });
      res.status(500).json({ error: "Unable to fetch Lab Test" });
    }
  } else if(req.method === "PUT") {
    const { labTestId, selectedStatus } = req.body; // Extract the id and status from the request body

    if (!labTestId || !selectedStatus) {
      return res.status(400).json({ message: "Missing id or status" });
    }
    console.log(
      labTestId,
      "labTest id",
      selectedStatus,
      "selected status"
    );
    try {
      const labTest = await LabTest.findByIdAndUpdate(labTestId,
        { paymentStatus: selectedStatus },
        { new: true } // Return the updated document
      );

      res.status(200).json({ message: "Status updated successfully" });
    } catch (error) {
      console.log(error, 'error in lab update')
      await logErrorToGoogleSheet({
        apiName: "bookLabTest - PUT",
        errorMessage: error.message || "Lab test update failed",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: { labTestId, selectedStatus },
      });
      res.status(500).json({ message: "An error occurred", error });
    }
  } 

  else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
