// import { immediateCall, scheduleCall, generateMeetingUrl, sendWhatsAppMessage } from '../../lib/twilio';
import {
  consultationTypeMapping,
  development_production_url,
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
      consultationprice
    } = req.body;

    try {
      console.log(req.body);

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
        doctorId = result ? result.doctor._id.toString():"";
        slot = result ? result.slot: "";
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
        doctorId = result.doctor;
        slot = result.slotId;
        console.log(doctorId, "doctorid for specific time", slot, "slot");
        if (!doctorId && !slot) { 
          throw new Error("No available doctors at the selected time");
        }
      }

      // const patientDetails = {
      //   PatientName: "Shubham",
      //   selectedDoctorId: doctorId,
      //   appointmentTime: appointmentTime,
      //   selectedDate: selectedDate,
      //   selectedSlot: selectedSlot,
      //   symptoms: symptoms,
      //   consultationType: consultationType,
      //   email: email,
      //   patientMobileNo: patientMobNo,
      // };

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
        await dbConnect();
        const updatedSlot = await Slot.findOneAndUpdate(
          { _id: slot, doctorId, isBooked: false },
          { isBooked: true },
          { new: true }
        );

        console.log(updatedSlot, "updated slot");

        // Step 2: Create the appointment
        const appointment = await Appointment.create({
          meetingId,
          doctorId,
          slotId: updatedSlot._id,
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
        console.log("line no 190");
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
      res.status(200).json({message: "Consultation booked successfully"})
    } catch (error) {
      console.error("Booking error:", error);
      res
        .status(500)
        .json({ message: error.message || "Failed to book the consultation" });
    }
  }
}
