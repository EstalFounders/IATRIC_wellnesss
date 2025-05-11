import { serviceOffered } from "../../../src/constant";

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
        id: `${appointment._id},${matchingLabTest._id}`,
        name: appointment.name + " + " + matchingLabTest.name,
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
            name: appointment.consultationType,
            price: appointment.consultationprice,
            hsn: appointmentTaxes[0].hsn_percentage,
            discount: 0,
            quantity: 1,
            totalPrice: appointment.consultationprice,
          },
          {
            name: matchingLabTest.name,
            price: matchingLabTest.totalPrice,
            hsn: labtestTaxes[0].hsn_percentage,
            discount: 0,
            quantity: 1,
            totalPrice: matchingLabTest.totalPrice,
          },
        ],
      };
      servicesToBill.push(combinedService);
      usedMobileNumbers.add(mobNo);
    } else {
      // No matching lab test
      console.log("No matching lab test for mobile number:", appointmentTaxes[0].freight,appointmentTaxes[0].isActive,appointmentTaxes[0].processingfee,appointmentTaxes[0].share);
      const appointmentService = {
        id: appointment._id,
        name: appointment.name,
        mobNo: mobNo,
        invoiceNumber: invoiceNumber,
        subTotal: appointment.consultationprice,
        totalPrice: totalPrice,
        gst: appointmentTaxes[0].gst,
        freight: 0,
        tax: 0,
        item: [
          {
            name: appointment.consultationType,
            price: appointment.consultationprice,
            hsn: appointmentTaxes[0].hsn_percentage,
            discount: 0,
            quantity: 1,
            totalPrice: appointment.consultationprice,
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
        id: labTest._id,
        name: labTest.name,
        mobNo: mobNo,
        invoiceNumber: invoiceNumber,
        subTotal: labTest.totalPrice,
        gst: labtestTaxes[0].gst,

        freight: 0,
        totalPrice: labTest.totalPrice,
        item: [
          {
            name: labTest.name,
            price: labTest.totalPrice,
            hsn: labtestTaxes[0].hsn_percentage,
            discount: 0,
            quantity: 1,
            totalPrice: labTest.totalPrice,
          },
        ],
      };
      servicesToBill.push(labService);
    }
  });

  return servicesToBill;
};
