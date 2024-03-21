// pages/api/login.js

import bcrypt from 'bcrypt';
import { dbConnect } from '../../src/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  // Validate email and password (you can add more validation logic here)

  try {
    const { db } = await dbConnect();

    // Check if user with provided email exists in the database
    const user = await db.collection('doctors').findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // If email and password match, authentication successful
    return res.status(200).json({ message: 'Authentication successful' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
