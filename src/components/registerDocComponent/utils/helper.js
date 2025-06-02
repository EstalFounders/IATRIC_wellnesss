export const formatData = (timestamp) => {
    const date = new Date(timestamp);
  
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata', // Specify IST time zone
    };
  
    return date.toLocaleString('en-IN', options);
  };

  

  export const extractTime = (timestamp) => {
    const date = new Date(timestamp);
  
    // Using toLocaleTimeString() with specific options for hour and minute
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, // For AM/PM format
      timeZone: 'Asia/Kolkata', // Ensure IST time zone
    };
  
    return date.toLocaleTimeString('en-IN', options);
  };  
  