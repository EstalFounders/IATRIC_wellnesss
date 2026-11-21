/**
 * Cron scheduler - starts the jobs declared in `jobs.js`.
 *
 * Every job POSTs to its own internal API route, the same way the two original
 * jobs were triggered inline in server.js: the Next handler owns the DB work,
 * so a long run (slot generation takes minutes) cannot stall the socket.io
 * server, and a failure stays isolated to that one job.
 *
 * CommonJS on purpose: this module is require()d by the custom Next server
 * (`server.js`), which is CommonJS as well.
 *
 * To add a job edit `jobs.js`; to enable/disable one set its env flag to
 * "true" / "false" in `.env` / `.env.production` and restart the server.
 */
const cron = require("node-cron");
const jobs = require("./jobs");

// Same convention as LOG_MONITOR_ENABLED: only "true" turns a job on.
const isEnabled = (job) =>
  String(process.env[job.envFlag] || "").trim().toLowerCase() === "true";

// Guards against a second call (hot reload, a double startCronJobs) registering
// the same job twice.
const scheduledTasks = new Map();

const startCronJobs = ({ hostname, port, jobList = jobs }) => {
  const origin = `http://${hostname}:${port}`;
  // `CRON_SECRET`, when set, is sent to every job route so an endpoint can
  // refuse public POSTs (see helperApi syncDoctorSheet). Read here - not in
  // jobs.js - because Next loads the env files after the modules are required.
  const baseHeaders = { "Content-Type": "application/json" };
  const cronSecret = String(process.env.CRON_SECRET || "").trim();
  if (cronSecret) baseHeaders["x-cron-secret"] = cronSecret;
  const started = [];
  const disabled = [];
  const invalid = [];

  for (const job of Array.isArray(jobList) ? jobList : []) {
    if (!job || !job.name || !job.path) {
      console.error("[CRON] Skipping malformed job entry:", job);
      continue;
    }

    if (scheduledTasks.has(job.name)) {
      console.log(`[CRON] ${job.name} already scheduled - skipping duplicate`);
      continue;
    }

    if (!job.envFlag || !isEnabled(job)) {
      disabled.push(job.name);
      console.log(
        `[CRON] ${job.name} disabled (${job.envFlag || "no env flag"} is not "true")`,
      );
      continue;
    }

    if (!cron.validate(job.schedule)) {
      invalid.push(job.name);
      console.error(
        `[CRON] ${job.name} skipped - invalid schedule "${job.schedule}"`,
      );
      continue;
    }

    const run = async () => {
      const startedAt = Date.now();
      console.log(`[CRON] ${job.name} started ("${job.schedule}")`);
      try {
        const options = {
          method: "POST",
          headers: { ...baseHeaders, ...(job.headers || {}) },
        };
        // Jobs that walk the DB for minutes need a longer leash than the
        // default fetch timeout.
        if (job.timeoutMs) options.signal = AbortSignal.timeout(job.timeoutMs);

        const response = await fetch(`${origin}${job.path}`, options);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        const seconds = Math.round((Date.now() - startedAt) / 1000);
        console.log(`[CRON] ${job.name} completed in ${seconds}s`);
      } catch (err) {
        console.error(`[CRON] ${job.name} failed:`, err?.message || err);
      }
    };

    const task = cron.schedule(
      job.schedule,
      run,
      job.timezone ? { timezone: job.timezone } : {},
    );
    scheduledTasks.set(job.name, task);
    started.push(job.name);
    console.log(`[CRON] ${job.name} scheduled "${job.schedule}" -> ${job.path}`);
  }

  console.log(
    `[CRON] boot: ${started.length} started` +
      (disabled.length
        ? `, ${disabled.length} disabled (${disabled.join(", ")})`
        : "") +
      (invalid.length
        ? `, ${invalid.length} invalid (${invalid.join(", ")})`
        : ""),
  );

  return { started, disabled, invalid };
};

module.exports = { startCronJobs, jobs };
