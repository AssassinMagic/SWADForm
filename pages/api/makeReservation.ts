import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { 
    first_name, 
    last_name, 
    phone, 
    email, 
    address, 
    height, 
    weight, 
    age, 
    student_id,
    skate_preference,
    shoe_size,
    skating_ability, 
    skate_time 
  } = req.body;

  if (!first_name || !last_name || !phone || !email || !address || !height || !weight || !age || !student_id || !skate_preference || !skating_ability || !skate_time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Insert reservation
    await pool.query(
      "INSERT INTO reservations (first_name, last_name, phone, email, address, height, weight, age, student_id, skate_preference, shoe_size, skating_ability, skate_time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)",
      [first_name, last_name, phone, email, address, height, weight, age, student_id, skate_preference, shoe_size, skating_ability, skate_time]
    );
    res.status(200).json({ message: "Reservation successful" });
  } catch (error) {
    console.error("Error making reservation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
