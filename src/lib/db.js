import mongoose from "mongoose";

// The connection promise is module-scoped (NOT stored on `global`) on purpose:
// in a production build the page bundle and the API-route bundle can each hold
// their own copy of mongoose while `global` is shared. A global cache made one
// bundle believe it was connected when its own mongoose instance was not, so
// queries failed with "buffering timed out" (seen on the SEO page helper).
let connectPromise = null;

export async function dbConnect() {
  // readyState 1 = connected for THIS bundle's mongoose instance.
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectPromise) {
    connectPromise = mongoose
      .connect(process.env.MONGO_URI, { autoIndex: true })
      .catch((error) => {
        connectPromise = null;
        throw error;
      });
  }

  await connectPromise;

  return mongoose.connection;
}
