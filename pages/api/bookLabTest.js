// // pages/api/bookLabTest.js
// import { dbConnect } from "../../src/lib/db";
// import BookLabTest from "../../src/models/bookLabTestSchema";
// import LabTest from "../../src/models/lab-test";

// export default async function handler(req, res) {
//   await dbConnect();
//   if (req.method === "POST") {
//     // Connect to MongoDB
//     const { name, mobileNumber, paymentMethod, cartItemsIds, totalPrice } =
//       req.body;
//     // Validate request data
//     if (
//       !name ||
//       !mobileNumber ||
//       !paymentMethod ||
//       !cartItemsIds ||
//       !totalPrice
//     ) {
//       return res.status(400).json({ error: "All fields are required." });
//     }
//     try {

//       const savedBooking = await BookLabTest.create({
//         name,
//         mobileNumber,
//         paymentMethod,
//         cartItemsIds,
//         totalPrice,
//       })
//       res.status(201).json({ success: true, booking: savedBooking });
//     } catch (error) {
//       console.error("Error creating booking:", error);
//       res.status(500).json({ error: "Server error. Please try again later." });
//     }
//   } else if (req.method === "GET") {
//     let labTests
//     try {
//       await dbConnect();
//       labTests = await BookLabTest.find({})
      
//       res.status(200).json({ labTests });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Unable to fetch Lab Test" });
//     }
//   } else if(req.method === "PUT") {
//     const { labTestId, selectedStatus } = req.body; // Extract the id and status from the request body

//     if (!labTestId || !selectedStatus) {
//       return res.status(400).json({ message: "Missing id or status" });
//     }
//     console.log(
//       labTestId,
//       "labTest id",
//       selectedStatus,
//       "selected status"
//     );
//     try {
//       const labTest = await LabTest.findByIdAndUpdate(labTestId,
//         { paymentStatus: selectedStatus },
//         { new: true } // Return the updated document
//       );

//       res.status(200).json({ message: "Status updated successfully" });
//     } catch (error) {
//       console.log(error, 'error in lab update')
//       res.status(500).json({ message: "An error occurred", error });
//     }
//   } 

//   else {
//     res.status(405).json({ error: "Method not allowed" });
//   }
// }
