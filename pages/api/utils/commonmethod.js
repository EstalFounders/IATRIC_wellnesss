import { serviceOffered } from "../../../src/constant";
import Appointment from "../../../src/models/appointmentSchema";
import BookLabTest from "../../../src/models/bookLabTestSchema";
import { doctorDisplayName } from "../../../src/utils/doctorName";

export const createServicesToBill = (appointments, labTests, serviceOffer) => {
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  const appointmentTaxes = serviceOffer.filter((item) => {
    const itemName = item.name.toLowerCase();
    const consultationName = serviceOffered.consultation.toLowerCase();
    return itemName === consultationName;
  });

  const labtestTaxes = serviceOffer.filter((item) => {
    const itemName = item.name.toLowerCase();
    const labTestName = serviceOffered.labTest.toLowerCase();
    return itemName === labTestName;
  });

  console.log(appointmentTaxes, "labtestTaxes", labtestTaxes, "labtestTaxes");

  const servicesToBill = [];
  const usedMobileNumbers = new Set();

  // Index lab tests by mobile number for quick lookup
  const labTestsByMobile = labTests.reduce((acc, labTest) => {
    acc[labTest.mobileNumber] = labTest;
    return acc;
  }, {});

  // Process appointments
  appointments.forEach((appointment) => {
    console.log(appointment, "appointment in 26 server");
    const mobNo = appointment.patientMobNo;
    const matchingLabTest = labTestsByMobile[mobNo];
    const invoiceNumber = `INV-${randomNumber}`;
    const totalPrice =
      appointment.consultationprice +
      (matchingLabTest ? matchingLabTest.totalPrice : 0);
    if (matchingLabTest) {
      // If there's a matching lab test for the same number
      const combinedService = {
        // serviceIds: `${appointment._id},${matchingLabTest._id}`,
        name: appointment.name + " + " + matchingLabTest.name,
        doctorName: doctorDisplayName(appointment.doctorId?.name),
        mobNo: mobNo,
        invoiceNumber: invoiceNumber,
        subTotal: appointment.consultationprice + matchingLabTest.totalPrice,
        gst: appointmentTaxes[0].gst + labtestTaxes[0].gst,
        discount: 0,
        freight: 0,
        tax: 0,
        totalPrice: totalPrice,
        item: [
          {
            id: appointment._id,
            name: appointment.consultationType,
            price: appointment.consultationprice,
            hsn: appointmentTaxes[0].hsn_percentage,
            discount: 0,
            quantity: 1,
            price: appointment.consultationprice,
            serviceType: appointmentTaxes[0].name,
          },
          {
            id: matchingLabTest._id,
            name: matchingLabTest.name,
            price: matchingLabTest.totalPrice,
            hsn: labtestTaxes[0].hsn_percentage,
            discount: 0,
            quantity: 1,
            price: matchingLabTest.totalPrice,
            serviceType: labtestTaxes[0].name,
          },
        ],
      };
      servicesToBill.push(combinedService);
      usedMobileNumbers.add(mobNo);
    } else {
      // No matching lab test
      console.log(
        "No matching lab test for mobile number:",
        appointmentTaxes[0].freight,
        appointmentTaxes[0].isActive,
        appointmentTaxes[0].processingfee,
        appointmentTaxes[0].share
      );
      const appointmentService = {
        // serviceIds: appointment._id,
        name: appointment.name,
        doctorName: doctorDisplayName(appointment.doctorId?.name),
        mobNo: mobNo,
        invoiceNumber: invoiceNumber,
        subTotal: appointment.consultationprice,
        totalPrice: totalPrice,
        gst: appointmentTaxes[0].gst,
        freight: 0,
        tax: 0,
        item: [
          {
            id: appointment._id,
            name: appointment.consultationType,
            price: appointment.consultationprice,
            hsn: appointmentTaxes[0].hsn_percentage,
            discount: 0,
            quantity: 1,
            price: appointment.consultationprice,
            serviceType: appointmentTaxes[0].name,
          },
        ],
      };
      console.log(appointmentService, "appointment service in serveer");
      servicesToBill.push(appointmentService);
    }
  });

  // Process unmatched lab tests
  labTests.forEach((labTest) => {
    const mobNo = labTest.mobileNumber;
    const invoiceNumber = `INV-${randomNumber}`;
    if (!usedMobileNumbers.has(mobNo)) {
      const labService = {
        // serviceIds: labTest._id,
        name: labTest.name,
        mobNo: mobNo,
        invoiceNumber: invoiceNumber,
        subTotal: labTest.totalPrice,
        gst: labtestTaxes[0].gst,

        freight: 0,
        totalPrice: labTest.totalPrice,
        item: [
          {
            id: labTest._id,
            name: labTest.name,
            price: labTest.totalPrice,
            hsn: labtestTaxes[0].hsn_percentage,
            discount: 0,
            quantity: 1,
            price: labTest.totalPrice,
            serviceType: labtestTaxes[0].name,
          },
        ],
      };
      servicesToBill.push(labService);
    }
  });

  return servicesToBill;
};

export async function updateInvoiceNumberInDatabase(item, invoiceId) {
  try {
    if (!item) {
      console.error("Item is undefined or null");
      return; // Exit if item is invalid
    }

    let model;
    switch (item.serviceType) {
      case "Consultation":
        model = Appointment; // Assuming Appointment is your Consultation model
        break;
      case "LabTest":
        model = BookLabTest; // Assuming BookLabTest is your LabTest model
        break;
      default:
        console.warn(
          `Unknown service type: ${item.serviceType}.  Skipping update for item ID: ${item.id}`
        );
        return; // Skip if service type is unknown
    }

    //check if model is defined
    if (!model) {
      return;
    }
    const result = await model.findByIdAndUpdate(
      item.id, // Use item.id to find the correct record
      { invoiceId: invoiceId }, // Set the invoiceNumber
      { new: true } // Return the updated document
    );

    if (result) {
      console.log(
        `Invoice number updated for ${item.serviceType} with ID ${item.id}`
      );
    } else {
      console.warn(
        `${item.serviceType} with ID ${item.id} not found.  Invoice number not updated.`
      );
    }
  } catch (error) {
    console.error(
      `Error updating invoice number for ${item.serviceType} with ID ${item.id}:`,
      error
    );
    throw error; // Re-throw the error to be caught by the caller
  }
}

export const formatPhoneNumber = (phoneNumberString) => {
  // Normalize numbers (e.g. 9876543210, +91 9876543210, 919876543210)
  let digits;
  if (typeof phoneNumberString === "string") {
    digits = phoneNumberString.replace(/\D/g, "");
  } else if (typeof phoneNumberString === "number") {
    digits = String(phoneNumberString).replace(/\D/g, "");
  } else {
    return null;
  }

  // If it already includes the 91 country code and is 12 digits, keep it
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }

  // Strip a leading 0 (local formatting like 09876543210)
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // Keep only the last 10 digits (assumed to be the actual mobile number)
  const last10Digits = digits.slice(-10);

  // Ensure it's 10 digits
  if (last10Digits.length !== 10) return null;

  // Prefix with country code
  return `91${last10Digits}`;
};
