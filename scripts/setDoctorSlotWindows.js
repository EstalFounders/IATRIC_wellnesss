#!/usr/bin/env node
/**
 * Give every doctor the working-hours window the slot generator needs.
 *
 * `pages/api/lib/cron-jobs.js` (the only code that inserts into `slots`) skips a
 * doctor whose `slotStartTime` / `slotEndTime` are empty:
 *
 *   if (!doctor.slotStartTime || !doctor.slotEndTime) { console.warn(...); return; }
 *
 * Both doctors in the production database (`IATRIC`) had those two fields null, so
 * the nightly job had nothing to generate and `slots` stayed empty - which is why
 * no appointment slot showed up anywhere. The fields are optional in
 * `src/models/doctorModel.js`, so nothing else caught it.
 *
 * This script only fills those two fields, and only where they are missing; the
 * value is written the same way the app writes it, so the doctor's profile page
 * keeps showing and (via the approved change-request flow) editing it normally.
 *
 * Time convention - important
 *   `convertDateIntoTime` (src/helper.js) renders these fields with the browser's
 *   LOCAL clock (`date.getHours()`), while the generator reads the UTC clock
 *   (`getUTCHours()`). The stored value is therefore the UTC instant of the intended
 *   IST wall time: 07:00 IST -> 01:30Z, 22:00 IST -> 16:30Z. Only the clock time is
 *   ever read, so the date part is arbitrary (it is "today" here).
 *
 *   node scripts/setDoctorSlotWindows.js --env=production            # dry run (default)
 *   node scripts/setDoctorSlotWindows.js --env=production --apply    # write
 *   node scripts/setDoctorSlotWindows.js --start=09:00 --end=21:00 --env=production --apply
 *   node scripts/setDoctorSlotWindows.js --uri="mongodb+srv://..."   # override the env file
 *
 * After writing, generate the slots once (the nightly job only runs at midnight):
 *
 *   curl -X POST https://healthpath.co.in/api/lib/runCronJob
 *
 * npm run db:set-slot-windows        # dry run against .env.production
 * npm run db:set-slot-windows:apply  # write
 */
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const COLLECTION = "doctors"; // mongoose pluralises the `Doctor` model

const DEFAULT_START = "07:00";
const DEFAULT_END = "22:00";
const DEFAULT_OFFSET = "+05:30"; // IST - the wall clock the fields are meant to hold

const USAGE = `Usage: node scripts/setDoctorSlotWindows.js [options]

  --apply              write the changes (without it the script is a dry run)
  --start=HH:MM        working-hours start in the offset below (default ${DEFAULT_START})
  --end=HH:MM          working-hours end   in the offset below (default ${DEFAULT_END})
  --offset=+HH:MM      wall clock offset for --start/--end (default ${DEFAULT_OFFSET}, IST)
  --env=production     read MONGO_URI from .env.production instead of .env
  --uri=URI            MongoDB connection string (overrides --env)
  --limit=N            only process the first N doctors
  --quiet              only print the summary
  -h, --help           show this help
`;

function parseArgs(argv) {
  const options = {
    apply: false,
    quiet: false,
    limit: null,
    uri: null,
    env: ".env",
    start: DEFAULT_START,
    end: DEFAULT_END,
    offset: DEFAULT_OFFSET,
    help: false,
  };

  for (const arg of argv) {
    if (arg === "--apply") options.apply = true;
    else if (arg === "--quiet") options.quiet = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg.startsWith("--limit=")) {
      options.limit = Number(arg.slice("--limit=".length)) || null;
    } else if (arg.startsWith("--uri=")) {
      options.uri = arg.slice("--uri=".length);
    } else if (arg.startsWith("--env=")) {
      const value = arg.slice("--env=".length);
      options.env = value === "production" ? ".env.production" : value;
    } else if (arg.startsWith("--start=")) {
      options.start = arg.slice("--start=".length);
    } else if (arg.startsWith("--end=")) {
      options.end = arg.slice("--end=".length);
    } else if (arg.startsWith("--offset=")) {
      options.offset = arg.slice("--offset=".length);
    } else {
      console.error(`Unknown option: ${arg}\n`);
      console.error(USAGE);
      process.exit(1);
    }
  }

  return options;
}

// Values from the real environment always win over the file.
function loadEnvFile(file) {
  if (!fs.existsSync(file)) return false;

  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    if (process.env[match[1]] !== undefined) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }

  return true;
}

function parseClock(value, label) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value).trim());

  if (!match) {
    throw new Error(`${label} must look like HH:MM (got "${value}")`);
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || minutes > 59) {
    throw new Error(`${label} is not a valid time (got "${value}")`);
  }

  return hours * 60 + minutes;
}

function parseOffset(value) {
  const match = /^([+-])(\d{1,2}):(\d{2})$/.exec(String(value).trim());

  if (!match) {
    throw new Error(`--offset must look like +05:30 (got "${value}")`);
  }

  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

/**
 * The UTC instant whose UTC clock reads `wallMinutes` in the given offset - the
 * shape the app stores these two fields in (see the header comment).
 */
function utcDateForWallClock(wallMinutes, offsetMinutes, reference) {
  const utcMinutes = (((wallMinutes - offsetMinutes) % 1440) + 1440) % 1440;

  return new Date(
    Date.UTC(
      reference.getUTCFullYear(),
      reference.getUTCMonth(),
      reference.getUTCDate(),
      Math.floor(utcMinutes / 60),
      utcMinutes % 60,
      0,
      0
    )
  );
}

/** "01:30" - the UTC clock time the slot generator reads. */
function utcClock(value) {
  if (!(value instanceof Date)) return describe(value);

  return `${String(value.getUTCHours()).padStart(2, "0")}:${String(
    value.getUTCMinutes()
  ).padStart(2, "0")}`;
}

/** "07:00" - what the doctor's browser (e.g. IST) shows for the same instant. */
function wallClock(value, offsetMinutes) {
  if (!(value instanceof Date)) return describe(value);

  const minutes =
    (((value.getUTCHours() * 60 + value.getUTCMinutes() + offsetMinutes) % 1440) +
      1440) %
    1440;

  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
    minutes % 60
  ).padStart(2, "0")}`;
}

function describe(value) {
  if (value === undefined) return "missing";
  if (value === null) return "null";
  if (value instanceof Date) return value.toISOString();
  return `${typeof value} ${JSON.stringify(value)}`;
}


async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(USAGE);
    return;
  }

  let startMinutes;
  let endMinutes;
  let offsetMinutes;

  try {
    startMinutes = parseClock(options.start, "--start");
    endMinutes = parseClock(options.end, "--end");
    offsetMinutes = parseOffset(options.offset);
  } catch (error) {
    console.error(`${error.message}\n`);
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }

  if (startMinutes >= endMinutes) {
    console.error(
      `--start (${options.start}) must be earlier than --end (${options.end}).`
    );
    process.exitCode = 1;
    return;
  }

  const envPath = path.isAbsolute(options.env)
    ? options.env
    : path.join(REPO_ROOT, options.env);
  const envLoaded = loadEnvFile(envPath);

  const uri = options.uri || process.env.MONGO_URI;
  if (!uri) {
    console.error(
      `MONGO_URI is not set (checked the environment and ${options.env}).`
    );
    process.exitCode = 1;
    return;
  }

  // Resolved from the repo, so the script runs from any working directory.
  const mongoose = require(require.resolve("mongoose", { paths: [REPO_ROOT] }));

  await mongoose.connect(uri, { autoIndex: false });
  const connection = mongoose.connection;

  const now = new Date();
  const startValue = utcDateForWallClock(startMinutes, offsetMinutes, now);
  const endValue = utcDateForWallClock(endMinutes, offsetMinutes, now);

  console.log("HealthPath - set doctor slot windows");
  console.log(
    `env file: ${envLoaded ? options.env : `${options.env} (missing)`} | db: ${
      connection.name
    } | host: ${connection.host}`
  );
  console.log(
    `mode: ${options.apply ? "APPLY" : "DRY RUN (nothing is written)"} | window: ${
      options.start
    }-${options.end} (${options.offset}) = ${utcClock(startValue)}Z-${utcClock(
      endValue
    )}Z stored = ${wallClock(startValue, offsetMinutes)}-${wallClock(
      endValue,
      offsetMinutes
    )} as the doctor sees it`
  );

  try {
    const collection = connection.collection(COLLECTION);
    const doctors = await collection
      .find(
        { $or: [{ slotStartTime: null }, { slotEndTime: null }] },
        { projection: { name: 1, slotStartTime: 1, slotEndTime: 1 } }
      )
      .sort({ _id: 1 })
      .limit(options.limit || 0)
      .toArray();

    const alreadySet = await collection.countDocuments({
      $nor: [{ slotStartTime: null }, { slotEndTime: null }],
    });

    console.log(
      `doctors without a window: ${doctors.length} | already set: ${alreadySet}`
    );

    if (!options.quiet) {
      for (const doctor of doctors) {
        console.log(`  - ${doctor.name || "(no name)"} (${doctor._id})`);
        console.log(
          `      before: start ${describe(doctor.slotStartTime)}, end ${describe(
            doctor.slotEndTime
          )}`
        );
        console.log(
          `      after : start ${startValue.toISOString()}, end ${endValue.toISOString()}`
        );
      }
    }

    if (!options.apply) {
      console.log("Nothing written. Re-run with --apply to save these changes.");
    } else if (doctors.length === 0) {
      console.log("Nothing to write - every doctor already has a window.");
    } else {
      const result = await collection.bulkWrite(
        doctors.map((doctor) => ({
          updateOne: {
            filter: { _id: doctor._id },
            update: { $set: { slotStartTime: startValue, slotEndTime: endValue } },
          },
        })),
        { ordered: false }
      );

      console.log(
        `written: ${result.modifiedCount} doctor(s) | matched: ${result.matchedCount}`
      );
      console.log(
        "Next: generate the slots once (the nightly job only runs at midnight):"
      );
      console.log("  curl -X POST https://healthpath.co.in/api/lib/runCronJob");
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("Failed:", error.message);
  process.exitCode = 1;
});
