// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// import User from "../../../../src/models/userModel";
import { hash } from "bcryptjs"
import { dbConnect } from "../../src/lib/db";
import User from "../../src/models/userModel";

export default async function handler(req, res) {
  try {

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
    res.json({ error });
  }

}
