// import { immediateCall, scheduleCall, generateMeetingUrl, sendWhatsAppMessage } from '../../lib/twilio';
import { consultationTypeMapping, twilioPhoneNumber } from "../../src/constant";
import { dbConnect } from "../../src/lib/db";
import twilioClient from "../../src/lib/twilioClient";
import Appointment from "../../src/models/appointmentSchema";
import { checkSlotAvailability, findAvailableDoctor } from "./helper";
import { makeTwilioCall, sendWhatsAppMessage } from "./lib/twilio";
import createZoomMeetingUrl from "./lib/zoomVideo";
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const {
    selectedDoctorId,
    appointmentTime,
    selectedDate,
    selectedSlot,
    symptoms,
    name,
    email,
    patientMobNo,
    consultationType,
  } = req.body;

  try {
    let doctorId = selectedDoctorId === "" ? null : selectedDoctorId;
    let slotDetails;
    let doctor;
    // Determine current or specific time
    const now = new Date();
    const isNow = appointmentTime === "Now";
    const genericConsultationType = consultationTypeMapping[consultationType];
    const meetingId = uuidv4();
    // Find available doctor if needed
    if (doctorId === null) {
      doctor = await findAvailableDoctor(selectedDate, genericConsultationType);
      doctorId = doctor._id;
      console.log(doctor, "doctorid");
      if (!doctor) {
        throw new Error("No available doctors at the selected time");
      }
    }

    // Check slot availability
    if (appointmentTime !== "Now") {
      slotDetails = await checkSlotAvailability(
        doctorId,
        selectedDate,
        selectedSlot
      );
      console.log(slotDetails, "slot detauls");
      if (slotDetails.isBooked) {
        res.status(409).json({ message: "Selected slot is not available." });
        return;
      }
    }
    console.log(patientMobNo, "pateitn mob no");
    const patientDetails = {
      name: name,
      selectedDoctorId: doctorId,
      appointmentTime: appointmentTime,
      selectedDate: selectedDate,
      selectedSlot: selectedSlot,
      symptoms: symptoms,
      consultationType: consultationType,
      email: email,
      patientMobileNo: patientMobNo,
    };

    const doctorDetails = {
      name: doctor.name,
      selectedDoctorId: selectedDoctorId,
      appointmentTime: appointmentTime,
      selectedDate: selectedDate,
      selectedSlot: selectedSlot,
      symptoms: symptoms,
      consultationType: consultationType,
      email: doctor.email,
      doctorMobileNo: "8920897437",
    };
    
    const bookConsultation = async ({
      doctorId,
      symptoms,
      name,
      email,
      patientMobNo,
      consultationType,
      appointmentTime,
      status,
      patientMeetingUrl,
      doctorMeetingUrl,
      prescriptionUrl
    }) => {
      // const appointment = AppointSche
      const appointment = Appointment.create({
        meetingId,
        doctorId,
        symptoms,
        name,
        email,
        patientMobNo,
        consultationType,
        appointmentTime,
        status,
        patientMeetingUrl,
        doctorMeetingUrl,
        prescriptionUrl
      });
    
      return appointment;
    };

    

    console.log(meetingId, 'meeting id')
     
    // Handle consultation types
    switch (consultationType) {
      case "Call":
      case "Video":
        const patientMeetingUrl = `/meeting/patient/${meetingId}`;
        const doctorMeetingUrl = `/meeting/doctor/${meetingId}`;
    
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
    await bookConsultation({
      meetingId,
      doctorId,
      symptoms,
      name,
      email,
      patientMobNo,
      consultationType,
      appointmentTime: isNow ? new Date() : selectedDate,
      status: "open",
      patientMeetingUrl,
      doctorMeetingUrl,
      prescriptionUrl: ''
    });

        break;
    
      case "Home visit":
      case "Clinic":
        // Simply book the consultation
       // Store appointment details
    await bookConsultation({
      doctorId,
      symptoms,
      name,
      email,
      patientMobNo,
      consultationType,
      appointmentTime: isNow ? new Date() : selectedDate,
      status: "open",
      patientMeetingUrl,
      doctorMeetingUrl,
      prescriptionUrl: ''
    });
        break;
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

    res.status(200).json({
      message: "Consultation booked successfully",
      // details: meetingDetails || {},
    });
  } catch (error) {
    console.error("Booking error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to book the consultation" });
  }
}
