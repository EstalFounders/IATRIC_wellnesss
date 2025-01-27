// pages/api/bookLabTest.js
import { dbConnect } from "../../src/lib/db";
import BookLabTest from "../../src/models/bookLabTestSchema";

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
      res.status(500).json({ error: "Unable to fetch Lab Test" });
    }
  } 
  else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
