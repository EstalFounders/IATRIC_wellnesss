export const calculateTotalIncome = (appointments, labTests) => {
  console.log(appointments, labTests, "all appointments and labtest");
  let totatIncome=0;
    
    // Initialize totals
    let totalPrice = 0;
    let price = 0;

    // Sum up appointments
    appointments.forEach((item) => {
      price += item.price || 0;
    });

    // Sum up lab tests
    labTests.forEach((item) => {
      totalPrice += item.totalPrice || 0;
    });

    totatIncome = totalPrice + price;

  // Return the aggregated results
  return { totatIncome };
};


  
