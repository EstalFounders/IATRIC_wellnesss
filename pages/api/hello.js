// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextResponse } from "next/server";
import { dbConnect } from "../../src/lib/db"

export default async function handler(req, res) {
  const con = await dbConnect();
  res.status(200).json('connected') 
}
