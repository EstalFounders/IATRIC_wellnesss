
// pages/api/startCron.js

import performScheduledTasks from "./cron-jobs";


export default async function handler(req, res) {
  if (req.method === "POST") {
    console.log('task started')
    await performScheduledTasks()
    res.status(200).json({ message: "Cron job started successfully" });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
