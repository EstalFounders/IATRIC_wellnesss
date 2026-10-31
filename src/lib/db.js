import mongoose from "mongoose";

// The connection promise is module-scoped (NOT stored on `global`) on purpose:
// in a production build the page bundle and the API-route bundle can each hold
// their own copy of mongoose while `global` is shared. A global cache made one
// bundle believe it was connected when its own mongoose instance was not, so
// queries failed with "buffering timed out" (seen on the SEO page helper).
let connectPromise = null;

// Indexes that an older version of a schema created and that the current
// schema no longer declares. Mongo keeps an index after `unique` is dropped
// from the schema (`autoIndex` only creates, it never removes), so
// `doctors.gender_1` stayed unique in the database long after the field became
// a plain optional String - every second doctor of the same gender was rejected
// with `E11000 duplicate key ... index: gender_1`. The list below lets the
// connection heal itself once per process instead of demanding a manual
// `db.doctors.dropIndex()` on every environment.
const OBSOLETE_UNIQUE_INDEXES = [
  // doctors.gender is multi-valued data: only email and mobileNumber are unique.
  { collection: "doctors", index: "gender_1" },
  // The registration number stopped being unique (a doctor can be registered
  // without one and the number can be added later), so the unique index created
  // while the rule existed has to go - otherwise two blank values or two doctors
  // sharing a number would still fail with E11000.
  { collection: "doctors", index: "doctorRegistrationNo_1" },
];

let indexCleanupPromise = null;

async function dropObsoleteUniqueIndexes() {
  const db = mongoose.connection.db;
  if (!db) return;

  for (const { collection, index } of OBSOLETE_UNIQUE_INDEXES) {
    try {
      const indexes = await db.collection(collection).listIndexes().toArray();
      const stale = indexes.find((entry) => entry.name === index && entry.unique);
      // Not there, or already non-unique (someone fixed it by hand): nothing to do.
      if (!stale) continue;

      await db.collection(collection).dropIndex(index);
      console.log(`[db] dropped obsolete unique index ${collection}.${index}`);
    } catch (error) {
      // 26 / NamespaceNotFound -> the collection does not exist yet.
      if (error?.code === 26 || error?.codeName === "NamespaceNotFound") continue;
      // Never let this break the request that triggered the connection; the
      // growth path (dropping a unique index) fails only on permissions.
      console.error(
        `[db] could not drop obsolete index ${collection}.${index}:`,
        error?.message || error
      );
    }
  }
}

function ensureIndexCleanup() {
  if (!indexCleanupPromise) {
    indexCleanupPromise = dropObsoleteUniqueIndexes().catch((error) => {
      indexCleanupPromise = null;
      console.error("[db] index cleanup failed:", error?.message || error);
    });
  }
  return indexCleanupPromise;
}

export async function dbConnect() {
  // readyState 1 = connected for THIS bundle's mongoose instance.
  if (mongoose.connection.readyState !== 1) {
    if (!connectPromise) {
      connectPromise = mongoose
        .connect(process.env.MONGO_URI, { autoIndex: true })
        .catch((error) => {
          connectPromise = null;
          throw error;
        });
    }

    await connectPromise;
  }

  // Runs once per process/bundle, whether or not this call opened the socket.
  await ensureIndexCleanup();

  return mongoose.connection;
}

