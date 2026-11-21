/**
 * Cron job registry.
 *
 * `scheduler.js` reads this list when the custom server boots (server.js) and
 * schedules every enabled job with node-cron. To add a job, append an entry
 * here - no other file needs to change (just add its env flag to .env).
 *
 * Fields
 *  - name      : identifier used in the `[CRON]` logs and the boot summary.
 *  - envFlag   : .env boolean that turns the job on/off. The job runs only when
 *                the value is exactly "true" (same convention as
 *                LOG_MONITOR_ENABLED); false / missing keeps it off.
 *  - schedule  : node-cron expression (server timezone unless `timezone` set).
 *  - path      : internal API route POSTed when the job fires.
 *  - timeoutMs : optional request timeout, for jobs that take minutes.
 *  - timezone  : optional IANA timezone, e.g. "Asia/Kolkata".
 *  - headers   : optional extra request headers (CRON_SECRET, when set, is added
 *                to every job by scheduler.js).
 */
module.exports = [
  {
    name: "slotGeneration",
    envFlag: "CRON_SLOT_GENERATION_ENABLED",
    schedule: "0 0 * * *", // every day at midnight
    path: "/api/lib/runCronJob",
    // The run walks every doctor day by day and takes minutes.
    timeoutMs: 15 * 60 * 1000,
  },
  {
    name: "consultationReminders",
    envFlag: "CRON_CONSULTATION_REMINDERS_ENABLED",
    schedule: "0,20,40 9-23 * * *", // every 20 min, 9 AM - 11:59 PM
    path: "/api/lib/sendConsultationReminder",
  },
  {
    name: "doctorSheetSync",
    envFlag: "CRON_DOCTOR_SHEET_SYNC_ENABLED",
    schedule: "0 0 * * *", // every day at midnight
    // Append-only: adds doctors and nursing staff missing from the existing
    // "Doctor Details" sheet (never edits or deletes a row).
    // See src/lib/doctorSheetSync.js
    path: "/api/helperApi?action=syncDoctorSheet",
    timeoutMs: 2 * 60 * 1000,
  },
];
