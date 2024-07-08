import React from 'react';

const TriggerCronJobComponent = () => {
  // Function to manually trigger the cron job
  const triggerCronJob = async () => {
    try {
      const response = await fetch('/api/lib/runCronJob', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to trigger cron job');
      }
      const data = await response.json();
      console.log(data.message); // Log success message
    } catch (error) {
      console.error('Error triggering the cron job:', error);
    }
  };

  return (
    <div>
      <button onClick={triggerCronJob}>START CRON JOB</button>
    </div>
  );
};

export default TriggerCronJobComponent;
