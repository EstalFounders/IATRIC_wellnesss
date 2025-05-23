// import { immediateCall, scheduleCall, generateMeetingUrl, sendWhatsAppMessage } from '../../lib/twilio';
import mongoose from "mongoose";
import {
  appointment_status,
  consultationTypeMapping,
  development_production_url,
  twilioPhoneNumber,
} from "../../src/constant";
import { dbConnect } from "../../src/lib/db";
import Appointment from "../../src/models/appointmentSchema";
import Slot from "../../src/models/slots";
import {
  findAvailableDoctor,
  findAvailableDoctorForNow,
  findAvailableDoctorForSpecificTimeSlot,
} from "./helper";
import { v4 as uuidv4 } from "uuid";
import {
  extractTime,
  formatData,
} from "../../src/components/registerDocComponent/utils/helper";
import { sendWhatsAppConfirmation } from "./lib/communication";
import { formatPhoneNumber } from "./utils/commonmethod";
import { format } from "path";
import { WHATSAPP_CONFIRMATION_TEMPLATE } from "./utils/constants";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { doctorId } = req.query; // Get the doctorId from the query parameters

    try {
      await dbConnect();

      let appointments;
      if (doctorId) {
        appointments = await Appointment.find({ doctorId: doctorId });
      } else {
        appointments = await Appointment.find({});
      }

      res.status(200).json({ appointments });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Unable to fetch appointments" });
    }
  }

  if (req.method === "PUT") {
    const { appointmentId, selectedStatus } = req.body; // Extract the id and status from the request body

    if (!appointmentId || !selectedStatus) {
      return res.status(400).json({ message: "Missing id or status" });
    }
    console.log(
      appointmentId,
      "appointment id",
      selectedStatus,
      "selected status"
    );
    try {
      const appointment = await Appointment.findByIdAndUpdate(
        { _id: appointmentId },
        { status: selectedStatus },
        { new: true } // Return the updated document
      );

      res.status(200).json({ message: "Status updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "An error occurred", error });
    }
  }

  if (req.method === "POST") {
    let session;
    const {
      selectedDoctorId,
      appointmentTime,
      selectedDate,
      selectedSlot,
      symptoms,
      name,
      doctorName,
      doctorMobileNumber,
      email,
      patientMobNo,
      consultationType,
      consultationprice,
    } = req.body;

    try {
      console.log(req.body);
      session = await mongoose.startSession();
      session.startTransaction();
      let docName = doctorName == "" ? null : doctorName;
      let doctorMobileNo = doctorMobileNumber == "" ? null : doctorMobileNumber;
      let doctorId = selectedDoctorId === "" ? null : selectedDoctorId;
      let slot = selectedSlot === "" ? null : selectedSlot;
      let doctor;

      // Determine current or specific time
      const now = new Date();
      const isNow = appointmentTime === "Now";
      const genericConsultationType = consultationTypeMapping[consultationType];
      const meetingId = uuidv4();

      // Find available doctor if needed right now
      console.log(genericConsultationType, "generic consultation type");
      if (doctorId == null && appointmentTime == "Now") {
        const result = await findAvailableDoctorForNow(
          selectedDate,
          genericConsultationType
        );
        console.log(result, "result 97");
        console.log(
          result.doctor._id.toString(),
          "result doctor id",
          result.slot,
          "result slots"
        );
        doctorId = result ? result.doctor._id.toString() : "";
        docName = result ? result.doctor.name : "";
        doctorMobileNo = result ? result.doctor.mobileNumber : "";
        slot = result ? result.slot : "";
        if (!doctorId) {
          throw new Error("No available doctors at the selected time");
        }
      }

      // Find available doctor if needed at specific time
      if (doctorId == null && appointmentTime == "chooseTime") {
        const result = await findAvailableDoctorForSpecificTimeSlot(
          selectedDate,
          genericConsultationType,
          selectedSlot
        );
        console.log(result, "result 111");
        docName = result.doctor.name;
        doctorMobileNo = result.doctor.mobileNumber;
        doctorId = result.doctor;
        slot = result.slotId;
        console.log(doctorId, "doctorid for specific time", slot, "slot");
        if (!doctorId && !slot) {
          throw new Error("No available doctors at the selected time");
        }
      }

      

      // const doctorDetails = {
      //   doctorName: "Ashima",
      //   selectedDoctorId: selectedDoctorId,
      //   appointmentTime: appointmentTime,
      //   selectedDate: selectedDate,
      //   selectedSlot: selectedSlot,
      //   symptoms: symptoms,
      //   consultationType: consultationType,
      //   email: doctor.email,
      //   doctorMobileNo: "8920897437",
      // };

      const bookConsultation = async ({
        meetingId,
        doctorId,
        slot,
        symptoms,
        name,
        email,
        patientMobNo,
        consultationType,
        consultationprice,
        appointmentTime,
        status,
        patientMeetingUrl,
        doctorMeetingUrl,
        prescriptionUrl,
      }) => {
        console.log(slot, "slot", doctorId, "doctor id");
        if (slot === null) {
          const now = new Date();

          // Find the slot where current time is between start and end, and not booked
          const currentSlot = await Slot.findOne({
            doctorId,
            isBooked: false,
            startTime: { $lte: now },
            endTime: { $gte: now },
          }).sort({ startTime: 1 });

          console.log(currentSlot, "current slot");

          if (!currentSlot) {
            throw new Error("No current slot found for this time.");
          }

          // Step 2: Find the next available slot after the current slot’s end time
          const nextSlot = await Slot.findOneAndUpdate(
            {
              doctorId,
              isBooked: false,
              startTime: { $gt: currentSlot.endTime },
            },
            { isBooked: true },
            { new: true }
          );

          console.log(nextSlot, "next slot");

          if (!nextSlot) {
            throw new Error("No next available slot found.");
          }

          slot = nextSlot
          // ._id;
        } else {
          // Book the selected slot if it's not already booked
          const updatedSlot = await Slot.findOneAndUpdate(
            { _id: slot, doctorId, isBooked: false },
            { isBooked: true },
            { new: true }
          );

          if (!updatedSlot) {
            throw new Error("Selected slot is already booked or not found.");
          }

          slot = updatedSlot
          // ._id;
        }

        console.log(slot, "updated slot");

        // Step 2: Create the appointment
        const appointment = await Appointment.create({
          meetingId,
          doctorId,
          slotId: slot._id,
          symptoms,
          name,
          email,
          patientMobNo,
          consultationType,
          consultationprice,
          appointmentTime,
          status,
          patientMeetingUrl,
          doctorMeetingUrl,
          prescriptionUrl,
        });
        
        console.log("start time 249",slot, "slot 249");

        const confirmMessageBody = {
          appointment_date: formatData(slot.startTime),
          appointment_time: extractTime(slot.startTime), 
          doctor_name: docName,
          patient_name: name,
          consultation_type: consultationType,
          contact_us: twilioPhoneNumber,
        };

        console.log(formatPhoneNumber(doctorMobileNo.toString()),doctorMobileNo,"line no 190");
        await sendWhatsAppConfirmation(
          formatPhoneNumber(patientMobNo.toString()),
          confirmMessageBody,
          WHATSAPP_CONFIRMATION_TEMPLATE
        );
        await sendWhatsAppConfirmation(
          formatPhoneNumber(doctorMobileNo.toString()),
          confirmMessageBody,
          WHATSAPP_CONFIRMATION_TEMPLATE
        );
        // return appointment;
      };

      console.log(meetingId, "meeting id");

      // Handle consultation types
      switch (consultationType) {
        case "Call":
        case "Video":
          const patientMeetingUrl = `${development_production_url}/meeting/patient/${meetingId}`;
          const doctorMeetingUrl = `${development_production_url}/meeting/doctor/${meetingId}`;

          if (appointmentTime === "Now") {
            // Immediate handling
            // res.status(200).json({
            //   patientMeetingUrl: patientMeetingUrl,
            //   doctorMeetingUrl: doctorMeetingUrl,
            // });
          } else {
            // Scheduled handling
            // res.status(200).json({
            //   patientMeetingUrl: patientMeetingUrl,
            //   doctorMeetingUrl: doctorMeetingUrl,
            // });
          }
          // Store appointment details
          console.log(slot.startTime, "slot start time", slot, "slot");
          await bookConsultation({
            meetingId,
            doctorId,
            slot,
            symptoms,
            name,
            email,
            patientMobNo,
            consultationType,
            consultationprice,
            appointmentTime: isNow ? new Date() : slot.startTime,
            status: appointment_status.open,
            patientMeetingUrl,
            doctorMeetingUrl,
            prescriptionUrl: "",
          });

          break;

        case "Home visit":
        case "Clinic":
          // Simply book the consultation
          // Store appointment details
          await bookConsultation({
            meetingId,
            doctorId,
            slot,
            symptoms,
            name,
            email,
            patientMobNo,
            consultationType,
            consultationprice,
            appointmentTime: isNow ? new Date() : selectedDate,
            status: "open",
            patientMeetingUrl,
            doctorMeetingUrl,
            prescriptionUrl: "",
          });
          break;

        default:
          return res.status(400).json({
            message: "Invalid consultation type.",
          });
      }
      // // Send WhatsApp messages for confirmation
      // await sendWhatsAppMessage(
      //   name,
      //   mobNo,
      //   `Your ${consultationType} consultation is booked successfully.`
      // );
      // await sendWhatsAppMessage(
      //   doctorId,
      //   `New ${consultationType} consultation booked with ${name}.`
      // );
      await session.commitTransaction();
      session.endSession();
      res.status(200).json({ message: "Consultation booked successfully" });
    } catch (error) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      console.error("Booking error:", error);
      res
        .status(500)
        .json({ message: error.message || "Failed to book the consultation" });
    }
  }
}
