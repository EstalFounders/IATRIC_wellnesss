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
import { getConfirmMessageBody } from "../utils/whatsappMessageBodies";
import { doctorDisplayName } from "../../../src/utils/doctorName";

export default async function handler(req, res) {
  await dbConnect();

  try {
    const now = new Date();
    const twentyMinutesFromNow = new Date(now.getTime() + 20 * 60 * 1000);

    // 1. Get upcoming appointments within 20 minutes.
    //    Match both OPEN (booking created, payment pending) and CONFIRMED
    //    (payment verified) statuses so paid appointments also get reminders.
    //    `reminderSentAt: null` (matches "missing" too) keeps the job idempotent:
    //    it runs repeatedly inside the 20-minute window.
    const upcomingAppointments = await Appointment.find({
      appointmentTime: { $gte: now, $lte: twentyMinutesFromNow },
      reminderSentAt: null,
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

      // The reminder template has BOTH `appointment_date` and `appointment_time`.
      // They must always be filled: Fast2SMS renders an empty variable as "*",
      // which is why the doctor used to receive "Date: *". getConfirmMessageBody
      // normalises the value (and falls back to "-" instead of "Invalid Date");
      // `appointment.appointmentTime` covers legacy slots without `startTime`.
      const reminderSchedule = getConfirmMessageBody(
        slot.startTime || appointment.appointmentTime,
        doctor?.name,
        appointment.name,
      );
      const appointmentDate = reminderSchedule.appointment_date;
      const appointmentTime = reminderSchedule.appointment_time;

      console.log("Appointment Time:", appointmentDate, appointmentTime);

      // Prepare messages
      const reminderMessageBodyPateint = {
        doctor_name: doctorDisplayName(doctor?.name),
        patient_name: appointment.name,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        meeting_url: appointment.patientMeetingUrl,
      };

      const reminderMessageBodyDoctor = {
        doctor_name: doctorDisplayName(doctor?.name),
        patient_name: appointment.name,
        appointment_date: appointmentDate,
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

      // One failing appointment must not stop the reminders of the others: each
      // pair is sent on its own and only stamped once both messages went out, so
      // the next run retries a partial send without duplicating it.
      try {
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

        appointment.reminderSentAt = new Date();
        await appointment.save();
      } catch (reminderError) {
        console.error(
          "Reminder failed for appointment",
          String(appointment._id),
          reminderError.message
        );
      }
    }

    return res.status(200).json({ success: true, message: "Reminders sent." });
  } catch (err) {
    console.error("Reminder Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
