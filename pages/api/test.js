import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import LabTest from "../../src/models/lab-test"; // Assuming you've defined a model schema
import { dbConnect } from "../../src/lib/db";
import Appointment from "../../src/models/appointmentSchema";
import { contact_no, serviceOffered } from "../../src/constant";
import BookLabTest from "../../src/models/bookLabTestSchema";
import ServiceOffered from "../../src/models/serviceOffered";
import { sendWhatsAppConfirmation } from "./lib/communication";
import Slot from "../../src/models/slots";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const body = {
      appointment_date: "1/1/1",
      appointment_time: "14:35",
      doctor_name: "Dr. John Doe",
      patient_name: "Jane Doe",
      consultation_type: "Call",
      contact_us: contact_no,
    };
    await sendWhatsAppConfirmation("917455992234", body);
  } catch (error) {
    console.error("Error connecting to database:", error);
    return res.status(500).json({ message: "Internal server error" });
  }

  //code for update new column in db

  try {
    const allAppointments = await Appointment.find({});

    const updatedAppointments = [];
    const errors = [];

    console.log(`Processing ${allAppointments.length} appointments...`);

    // Iterate through each appointment
    for (const appointment of allAppointments) {
      if (!appointment.slotId) {
        console.warn(`Appointment ${appointment._id} has no slotId. Skipping.`);
        errors.push({
          id: appointment._id,
          message: "No slotId found for appointment",
        });
        continue;
      }

      try {
        // 2. Fetch the corresponding slot using slotId
        const slot = await Slot.findById(appointment.slotId);

        if (slot && slot.startTime) {
          // 3. Update the appointmentTime of the appointment schema with slot.startTime
          const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointment._id,
            { appointmentTime: slot.startTime },
            { new: true } // Return the updated document
          );
          updatedAppointments.push(updatedAppointment);
          console.log(
            `Updated appointment ${appointment._id} with time ${slot.startTime}`
          );
        } else {
          console.warn(
            `Slot ${appointment.slotId} not found or has no startTime for appointment ${appointment._id}. Skipping.`
          );
          errors.push({
            id: appointment._id,
            message: "Slot not found or startTime missing",
          });
        }
      } catch (innerError) {
        console.error(
          `Error processing appointment ${appointment._id}:`,
          innerError
        );
        errors.push({
          id: appointment._id,
          message: `Error updating: ${innerError.message}`,
        });
      }
    }

    // Update all documents to ensure the 'newField' exists with a default value if not present
    // const consultationResult = await Appointment.updateMany(
    //   { invoiceNumber: { $exists: true } },
    //   { $rename: { "invoiceNumber": "invoiceId" } }
    // );

    // const consultationResult = await BookLabTest.updateMany(
    //   { invoiceId: { $exists: false } },
    //   { $set: { invoiceId: "" } },
    //   { upsert: true } // Add the upsert option here
    // );

    // const consultationResult = await Appointment.updateMany(
    //   { invoiceNumber: { $exists: false } },
    //   { $set: { invoiceNumber: "" } },
    //   { upsert: true } // Add the upsert option here
    // );
    // const consultationResult = await ServiceOffered.updateMany(
    //   { isActive: { $exists: false } },
    //   { $set: { isActive: true } },
    //   { upsert: true } // Add the upsert option here
    // );

    // const consultationResult = await Appointment.updateMany(
    //   { serviceType: { $exists: false } },
    //   { $set: { serviceType: serviceOffered.consultation } },
    //   { upsert: true } // Add the upsert option here
    // );

    // const labTestResult = await BookLabTest.updateMany(
    //   { serviceType: { $exists: true } }, // Filter documents without the new field
    //   { $set: { serviceType: serviceOffered.labTest } }, // Add the new field with a default value
    //   { upsert: true }
    // );

    // 5. Send a response
    res.status(200).json({
      message: "Column updated successfully",
      updatedAppointments: updatedAppointments,
      // updatedAppointmentCount: consultationResult.modifiedCount,
      // upsertedAppointmentCount: consultationResult.upsertedCount,
      // updatedLabTestCount: labTestResult.modifiedCount,
      // upsertedLabTestCount: labTestResult.upsertedCount,
      // consultationResult: consultationResult,
      // labTestResult: labTestResult
    });
  } catch (error) {
    console.error("Error updating documents:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update documents", error });
  }

  //  code for storing lab data

  // try {
  //   // Directory path where the JSON files are stored
  //   const directoryPath = path.join(process.cwd(), "Data"); // Assuming your JSON files are in a 'data' folder
  //   console.log(directoryPath, "directory path");
  //   // Read all files in the directory
  //   const files = fs.readdirSync(directoryPath);

  //   // Loop through all files and process each JSON file
  //   for (const file of files) {
  //     const filePath = path.join(directoryPath, file);

  //     // Read and parse the JSON file
  //     const fileContent = fs.readFileSync(filePath, "utf-8");
  //     const jsonData = JSON.parse(fileContent);
  //     // console.log(jsonData, 'json data line 29')
  //     // Create a dummy category description
  //     const categoryDescription = `Auto generated description`;

  //     // Insert the category into the Lab-Test collection
  //     const newCategory = new LabTest({
  //       category_name: path.parse(file).name, // Using file name as category name
  //       category_description: categoryDescription,
  //     });
  //     const savedCategory = await newCategory.save();
  //     console.log(savedCategory, "saved category");
  //     // Loop through tests and store them in LabTestDetails collection
  //     for (const test of jsonData) {
  //       console.log(test, "test line 42");
  //       const newTestDetails = new LabTestDetails({
  //         category_id: savedCategory._id, // Reference to the Lab-Test category
  //         price: "300",
  //         discount: "20",
  //         report_within: "6 hours",
  //         ...test
  //       });
  //       await newTestDetails.save();
  //     }
  //   }

  //   return res
  //     .status(200)
  //     .json({ message: "Data successfully stored in the database" });
  // } catch (error) {
  //   console.error("Error processing data:", error);
  //   return res.status(500).json({ message: "Internal server error" });
  // }
}
