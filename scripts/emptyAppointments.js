#!/usr/bin/env node
/**
 * Wipes the booking history: appointments, their payments and their
 * prescriptions, and hands back every slot that is still flagged `isBooked`.
 *
 * Order matters (`appointments` is the parent document):
 *   1. appointments + their linked payments are dumped to a JSON backup,
 *   2. payments  (`appointmentId` in the deleted set, `required: true` ref),
 *   3. prescriptions (`appointmentId` ref),
 *   4. appointments,
 *   5. slots - `isBooked` back to false. Stale locks from the old slot
 *      generator do not necessarily reference a live appointment (the 4 found
 *      in production on 2026-11-04 matched no appointment at all), so every
 *      booked slot is released, not only the ones of the deleted rows.
 *
 * Deleting a payment also drops the Cashfree order record (`orderId`,
 * `paymentId`, `refundId`), so after `--apply` those orders can only be
 * reconciled from the JSON backup - that is why the backup is written first and
 * the run aborts when it cannot be written.
 *
 * Idempotent: a second run finds nothing to delete.
 *
 *   node scripts/emptyAppointments.js                          (dry run)
 *   node scripts/emptyAppointments.js --apply
 *   node scripts/emptyAppointments.js --env=production --apply
 *   node scripts/emptyAppointments.js --env=production --apply --backup=/tmp/x.json
 */

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// Neither .env nor .env.production is trusted to be the dev database: on
// 2026-11-04 both pointed at IATRIC (production). The script therefore refuses
// to touch anything that is not explicitly listed here, so a wrong `--env`
// cannot silently wipe an unexpected database.
const ALLOWED_DATABASES = ["IATRIC"];

// Statuses that mean "money actually moved" - printed in the dry run because
// their payment rows are the ones that become unreconcilable after a reset.
const MONEY_STATUSES = ["PAID", "REFUND_PENDING", "REFUNDED"];

const USAGE = `Usage: node scripts/emptyAppointments.js [options]

  --apply            delete the records (dry-run when omitted)
  --env=production   load .env.production (IATRIC) instead of .env
  --backup=PATH      backup file (default /tmp/appointments-backup-<ts>.json)
  -h, --help         show this help
`;

function parseArgs(argv) {
  const options = { apply: false, env: "development", backup: null, help: false };
  for (const arg of argv) {
    if (arg === "--apply") options.apply = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg.startsWith("--env=")) options.env = arg.slice("--env=".length);
    else if (arg.startsWith("--backup=")) options.backup = arg.slice("--backup=".length);
    else {
      console.error(`Unknown option: ${arg}\n`);
      console.error(USAGE);
      process.exit(1);
    }
  }
  return options;
}

function loadEnvFile(file, { override = false } = {}) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    if (!override && process.env[match[1]] !== undefined) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

function databaseName(uri) {
  return (uri.match(/\/([^/?]+)(?:\?|$)/) || [])[1] || "unknown";
}

/** Dumps the doomed documents before anything is deleted. */
function writeBackup(file, payload) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(payload, null, 2));
  return fs.statSync(file).size;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(USAGE);
    return;
  }

  // .env first, .env.production on top when asked (same layering as
  // scripts/uploadServiceTabImages.js).
  loadEnvFile(path.resolve(__dirname, "..", ".env"));
  if (options.env === "production") {
    loadEnvFile(path.resolve(__dirname, "..", ".env.production"), { override: true });
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error(
      `No MONGO_URI in .env${options.env === "production" ? " / .env.production" : ""}`
    );
    process.exit(1);
  }

  const dbName = databaseName(uri);
  if (!ALLOWED_DATABASES.includes(dbName)) {
    console.error(
      `Refusing to run against database "${dbName}" - expected one of ` +
        `${ALLOWED_DATABASES.join(", ")}. Edit ALLOWED_DATABASES if this is intended.`
    );
    process.exit(1);
  }

  console.log(
    `Target: ${dbName} (${options.env}) - ${options.apply ? "APPLY" : "DRY RUN"}`
  );

  await mongoose.connect(uri, { autoIndex: false });
  const db = mongoose.connection.db;

  const appointments = db.collection("appointments");
  const payments = db.collection("payments");
  const prescriptions = db.collection("prescriptions");
  const slots = db.collection("slots");

  const appointmentDocs = await appointments
    .find(
      {},
      {
        projection: {
          _id: 1,
          name: 1,
          patientMobNo: 1,
          doctorId: 1,
          slotId: 1,
          status: 1,
          appointmentTime: 1,
          consultationprice: 1,
          amountAfterOffer: 1,
          paymentId: 1,
        },
      }
    )
    .toArray();
  const appointmentIds = appointmentDocs.map((doc) => doc._id);

  // All payments whose appointment is about to disappear. `appointmentId` is
  // required on the schema, so there is nothing to catch beyond this filter.
  const paymentDocs = await payments
    .find({ appointmentId: { $in: appointmentIds } })
    .toArray();

  const prescriptionCount = await prescriptions.countDocuments({
    appointmentId: { $in: appointmentIds },
  });
  const bookedSlots = await slots.countDocuments({ isBooked: true });
  const paidPayments = paymentDocs.filter((doc) => MONEY_STATUSES.includes(doc.status));

  console.log(`Appointments:            ${appointmentDocs.length}`);
  for (const status of [...new Set(appointmentDocs.map((doc) => doc.status))].sort()) {
    const count = appointmentDocs.filter((doc) => doc.status === status).length;
    console.log(`  ${String(status).padEnd(12)}         ${count}`);
  }
  console.log(`Payments to delete:      ${paymentDocs.length}`);
  for (const status of [...new Set(paymentDocs.map((doc) => doc.status))].sort()) {
    const count = paymentDocs.filter((doc) => doc.status === status).length;
    console.log(`  ${String(status).padEnd(12)}         ${count}`);
  }
  console.log(`Prescriptions to delete: ${prescriptionCount}`);
  console.log(`Booked slots to release: ${bookedSlots}`);
  console.log(
    `Money already collected on those payments: ${paidPayments.length} ` +
      `payment(s) in ${MONEY_STATUSES.join("/")}`
  );

  if (appointmentDocs.length) {
    console.log("\nSample appointments (first 10):");
    for (const doc of appointmentDocs.slice(0, 10)) {
      const when = doc.appointmentTime
        ? new Date(doc.appointmentTime).toISOString()
        : "-";
      console.log(
        `  ${String(doc._id)}  ${String(doc.status).padEnd(10)} ${when}  ` +
          `${String(doc.name || "").slice(0, 24).padEnd(24)} ${doc.patientMobNo || ""}`
      );
    }
  }

  if (!options.apply) {
    console.log("\nDry run - nothing was written. Re-run with --apply to commit.");
    await mongoose.disconnect();
    return;
  }

  // Backup before the first write: the JSON is the only place the Cashfree
  // order data of the deleted payments survives.
  const backupFile =
    options.backup ||
    path.join(
      "/tmp",
      `appointments-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
    );
  let backupSize;
  try {
    backupSize = writeBackup(backupFile, {
      database: dbName,
      createdAt: new Date().toISOString(),
      appointments: appointmentDocs,
      payments: paymentDocs,
    });
  } catch (error) {
    console.error(`Backup failed, nothing deleted: ${error.message}`);
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`\nBackup: ${backupFile} (${backupSize} bytes)`);

  const deletedPayments = await payments.deleteMany({
    appointmentId: { $in: appointmentIds },
  });
  const deletedPrescriptions = await prescriptions.deleteMany({
    appointmentId: { $in: appointmentIds },
  });
  const deletedAppointments = await appointments.deleteMany({
    _id: { $in: appointmentIds },
  });
  const releasedSlots = await slots.updateMany(
    { isBooked: true },
    { $set: { isBooked: false } }
  );

  console.log(
    `\nApplied: ${deletedAppointments.deletedCount} appointment(s), ` +
      `${deletedPayments.deletedCount} payment(s), ` +
      `${deletedPrescriptions.deletedCount} prescription(s) deleted; ` +
      `${releasedSlots.modifiedCount} slot(s) released.`
  );

  const leftAppointments = await appointments.countDocuments();
  const leftPayments = await payments.countDocuments();
  const leftBookedSlots = await slots.countDocuments({ isBooked: true });
  console.log(
    `Remaining: ${leftAppointments} appointment(s), ${leftPayments} payment(s), ` +
      `${leftBookedSlots} booked slot(s).`
  );

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
