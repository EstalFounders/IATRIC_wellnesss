import { app } from "firebase-admin";
import { dbConnect } from "../../../src/lib/db";
import Appointment from "../../../src/models/appointmentSchema";
import Slot from "../../../src/models/slots";
import { appointment_status } from "../../../src/constant";
import Doctor from "../../../src/models/doctorModel";
import { sendWhatsAppConfirmation } from "./communication";
import {
  WHATSAPP_CONFIRMATION_TEMPLATE,
  WHATSAPP_REMINDER_TEMPLATE_DOCTOR,
  WHATSAPP_REMINDER_TEMPLATE_PATIENT,
} from "../utils/constants";
import { formatPhoneNumber } from "../utils/commonmethod";
import { formatData } from "../../../src/components/registerDocComponent/utils/helper";

export default async function handler(req, res) {
  await dbConnect();

  try {
    const now = new Date();
    const twentyMinutesFromNow = new Date(now.getTime() + 20 * 60 * 1000);

    // 1. Get upcoming appointments within 20 minutes.
    //    Match both OPEN (booking created, payment pending) and CONFIRMED
    //    (payment verified) statuses so paid appointments also get reminders.
    const upcomingAppointments = await Appointment.find({
      appointmentTime: { $gte: now, $lte: twentyMinutesFromNow },
      status: {
        $in: [
          new RegExp(appointment_status.open, "i"), // 'i' flag for case-insensitive
          new RegExp(appointment_status.confirmed, "i"),
        ],
      },
    });

    console.log("Upcoming Appointments:", upcomingAppointments);

    for (const appointment of upcomingAppointments) {
      const [slot, doctor] = await Promise.all([
        Slot.findById(appointment.slotId),
        Doctor.findById(appointment.doctorId),
      ]);

      if (!slot || !doctor) continue;

      const appointmentTime = formatData(slot.startTime);

      console.log("Appointment Time:", appointmentTime);

      // Prepare messages
      const reminderMessageBodyPateint = {
        doctor_name: doctor.name,
        patient_name: appointment.name,
        appointment_time: appointmentTime,
        meeting_url: appointment.patientMeetingUrl,
      };

      const reminderMessageBodyDoctor = {
        doctor_name: doctor.name,
        patient_name: appointment.name,
        appointment_time: appointmentTime,
        meeting_url: appointment.doctorMeetingUrl,
      };

      const patientMobNo = appointment.patientMobNo.toString();
      const doctorMobNo = doctor.mobileNumber.toString();

      console.log(
        "Reminder Message Body for Patient:",
        reminderMessageBodyPateint
      );
      console.log(
        "Reminder Message Body for Doctor:",
        reminderMessageBodyDoctor
      );

      // Send messages (your `sendMessage` handles actual sending logic)
      console.log(
        "patientMobNo",
        formatPhoneNumber(patientMobNo),
        "doctorMobNo",
        formatPhoneNumber(doctorMobNo)
      );
      await sendWhatsAppConfirmation(
        formatPhoneNumber(patientMobNo.toString()),
        reminderMessageBodyPateint,
        WHATSAPP_REMINDER_TEMPLATE_PATIENT
      );
      await sendWhatsAppConfirmation(
        formatPhoneNumber(doctorMobNo.toString()),
        reminderMessageBodyDoctor,
        WHATSAPP_REMINDER_TEMPLATE_DOCTOR
      );
    }

    return res.status(200).json({ success: true, message: "Reminders sent." });
  } catch (err) {
    console.error("Reminder Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
