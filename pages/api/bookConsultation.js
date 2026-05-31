// import { immediateCall, scheduleCall, generateMeetingUrl, sendWhatsAppMessage } from '../../lib/twilio';
import mongoose from "mongoose";
import {
  appointment_status,
  consultationTypeMapping,
  development_production_url,
  contact_no,
  IN_TWENTY_MINUTES_NOW,
  CHOOSE_TIME,
} from "../../src/constant";
import { dbConnect } from "../../src/lib/db";
import Appointment from "../../src/models/appointmentSchema";
import Slot from "../../src/models/slots";
import {
  bookConsultation,
  checkNbookSelectedDoctorForNow,
  findAvailableDoctor,
  findAvailableDoctorForNow,
  findAvailableDoctorForSpecificTimeSlot,
} from "./helper";
import { v4 as uuidv4 } from "uuid";
import {
  extractTime,
  formatData,
} from "../../src/components/registerDocComponent/utils/helper";
import { formatPhoneNumber } from "./utils/commonmethod";
import { format } from "path";
import {
  IS_NOW,
  WHATSAPP_CONFIRMATION_TEMPLATE,
  WHATSAPP_REMINDER_TEMPLATE_DOCTOR,
  WHATSAPP_REMINDER_TEMPLATE_PATIENT,
} from "./utils/constants";
import {
  getConfirmMessageBody,
  getReminderMessageBodyDoctor,
  getReminderMessageBodyPatient,
} from "./utils/whatsappMessageBodies";
import { sendAdminNotification } from "./lib/sendNotification";
import Notification from "../../src/models/NotificationSchema";

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

    const clientSideAppointmentTime = appointmentTime;

    try { 
      console.log(req.body);
      session = await mongoose.startSession();
      session.startTransaction();
      let docName = doctorName == "" ? null : doctorName;
      let doctorMobileNo = doctorMobileNumber == "" ? null : doctorMobileNumber;
      let doctorId = selectedDoctorId === "" ? null : selectedDoctorId;
      console.log("111");
      let slot = selectedSlot === "" ? null : selectedSlot;

      // Determine current or specific time
      const now = new Date();
      const genericConsultationType = consultationTypeMapping[consultationType];
      const meetingId = uuidv4();
      console.log("119");

      // Find available doctor if needed right now
      console.log(
        genericConsultationType,
        "generic consultation type",
        doctorId,
        "doctor id",
        clientSideAppointmentTime,
        "appointment time",
        IN_TWENTY_MINUTES_NOW,
        "in twenty minutes now",
        clientSideAppointmentTime == IS_NOW,
        clientSideAppointmentTime === IN_TWENTY_MINUTES_NOW
      );
      if (doctorId && clientSideAppointmentTime == IS_NOW) {
        const result = await checkNbookSelectedDoctorForNow(
          selectedDate,
          doctorId,
          res
        );
        slot = result ? result.slot : "";
      }
      if (
        doctorId == null &&
        (clientSideAppointmentTime == IS_NOW ||
          clientSideAppointmentTime == IN_TWENTY_MINUTES_NOW)
      ) {
        const result = await findAvailableDoctorForNow(
          selectedDate,
          genericConsultationType,
          res
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
      if (doctorId == null && appointmentTime == CHOOSE_TIME) {
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

      let patientMeetingUrl, doctorMeetingUrl;
      patientMeetingUrl = `${development_production_url}/meeting/patient/${meetingId}`;
      doctorMeetingUrl = `${development_production_url}/meeting/doctor/${meetingId}`;

      const bookConsultationParams = {
        meetingId,
        doctorId,
        slot,
        symptoms,
        name,
        email,
        patientMobNo,
        consultationType,
        consultationprice,
        appointmentTime: slot.startTime,
        status: appointment_status.open,
        patientMeetingUrl: patientMeetingUrl,
        doctorMeetingUrl: doctorMeetingUrl,
        prescriptionUrl: "",
        docName: docName,
        doctorMobileNo: doctorMobileNo,
        doctorId: doctorId,
        clientSideAppointmentTime: clientSideAppointmentTime,
      };

      console.log(meetingId, "meeting id");

      let result;
      // Handle consultation types
      switch (consultationType) {
        case "Call":
        case "Video":
          // Store appointment details
          result = await bookConsultation({ bookConsultationParams });
          break;
        case "Home visit":
        case "Clinic":
          // Simply book the consultation
          // Store appointment details
          result = await bookConsultation({ bookConsultationParams });
          break;

        default:
          return res.status(400).json({
            message: "Invalid consultation type.",
          });
      }
      // await Notification.create({
      //   title: "New Consultation",
      //   body: `Patient ${name} (ID: ${result._id}) booked a consultation.`,
      //   read: false,
      // });
      // await sendAdminNotification({
      //   title: "Consultation Booked",
      //   body: `Patient ${name} has booked consultation`
      // })
      await session.commitTransaction();
      session.endSession();
      res.status(200).json({ message: "Consultation booked successfully" });
    } catch (error) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      console.error("Booking error:", error);
      res.status(200).json({
        message: "All doctor are busy right now, No slot is available",
      });
    }
  }
}
