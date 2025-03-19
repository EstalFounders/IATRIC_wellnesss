
export const generateSlotsForChooseTime = (selectedDate, startHour, endHour, intervalMinutes) => {
  const slots = [];
  let currentTime = new Date(selectedDate);
  currentTime.setHours(startHour, 0, 0, 0);
  const endTime = new Date(currentTime);
  endTime.setHours(endHour, 0, 0, 0);

  while (currentTime < endTime) {
    const slot = {
      _id: currentTime.toISOString(),
      startTime: new Date(currentTime),
      endTime: new Date(currentTime.getTime() + intervalMinutes * 60000),
      isBooked: false, // Assuming initially all slots are not booked
    };
    slots.push(slot);
    currentTime = new Date(currentTime.getTime() + intervalMinutes * 60000);
  }
  return slots;
};

export const isWithinBusinessHours = () => {
  const now = new Date();
  const hours = now.getHours();
  return hours >= 9 && hours < 23;
};




  




