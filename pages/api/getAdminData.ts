import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { password } = req.body;

  // Check against an environment variable. 
  // You should set ADMIN_PASSWORD in your .env file
  const validPassword = process.env.ADMIN_PASSWORD || "admin123"; 

  if (password !== validPassword) {
    return res.status(401).json({ error: "Invalid password" });
  }

  try {
    const result = await pool.query("SELECT * FROM reservations ORDER BY created_at DESC"); // Assuming created_at exists, if not just SELECT *
    res.status(200).json({ reservations: result.rows });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    // Fallback if created_at doesn't exist
    try {
        const result = await pool.query("SELECT * FROM reservations");
        res.status(200).json({ reservations: result.rows });
    } catch (retryError) {
         res.status(500).json({ error: "Internal Server Error" });
    }
   
  }
}
