// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// import User from "../../../../src/models/userModel";
import { hash } from "bcryptjs"
import { dbConnect } from "../../src/lib/db";
import User from "../../src/models/userModel";
import { logErrorToGoogleSheet } from "./helper";
import { rateLimit } from "../../src/lib/rateLimiter";

export default async function handler(req, res) {
  try {

    // Rate limit signups per IP to prevent abuse
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
    const signupLimit = await rateLimit({
      key: `rl:signup:ip:${ip}`,
      limit: 20,
      windowSeconds: 600,
    });
    if (!signupLimit.allowed) {
      return res.status(429).json({
        error: "Too many signup attempts. Please try again later.",
        retryAfter: signupLimit.retryAfter,
      });
    }

    const parsedJsonRequest = JSON.parse(req.body.body)

    const { fname, lname, mobNo, email, password, dob, gender } = parsedJsonRequest

    const hashedPassword = await hash(password, 12)

    await dbConnect();

    const userExist = await User.findOne({email})

    if (userExist) {
      return res.status(409).json({ error: "User Already Existed" })
    }

    if (req.method === 'POST') {
      console.log('CREATING DOCUMENT');
      const createdUser = await User.create({
        fname,
        lname,
        email,
        mobNo,
        password: hashedPassword,
        dob,
        gender
      });

      console.log('CREATED DOCUMENT');
      res.json({ createdUser });
    } else if (req.method === 'GET') {
      console.log('FETCHING DOCUMENTS');
      const fetchedUsers = await User.find({});
      console.log('FETCHED DOCUMENTS');
      res.json({ fetchedUsers });
    } else {
      throw new Error(`Unsupported HTTP method: ${req.method}`);
    }
  } catch (error) {
    console.log(error, 'console in error');
    await logErrorToGoogleSheet({
      apiName: "signup",
      errorMessage: error.message || "Signup failed",
      errorCode: error.code || "500",
      stackTrace: error.stack,
      requestPayload: req.body?.body ? JSON.parse(req.body.body) : req.body,
    });
    res.json({ error });
  }

}
