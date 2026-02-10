import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { id, check_in, student_id } = req.body;
  
  // We can update by ID (from checkbox) or student_id (from scanner)
  if (!id && !student_id) {
    return res.status(400).json({ error: "Missing id or student_id" });
  }

  try {
    let result;
    
    if (id) {
        // Toggle by specific Row ID
        result = await pool.query(
            "UPDATE reservations SET check_in = $1 WHERE id = $2 RETURNING *",
            [check_in, id]
        );
    } else if (student_id) {
        // Check in (or out if toggle logic used, but scanner usually just checks in)
        // If "check_in" is provided in body, use it. Otherwise default to TRUE (scanner default)
        const status = check_in !== undefined ? check_in : true;
        
        result = await pool.query(
            "UPDATE reservations SET check_in = $1 WHERE student_id = $2 RETURNING *",
            [status, student_id]
        );
    }

    if (result && result.rowCount === 0) {
        return res.status(404).json({ error: "Reservation not found" });
    }

    res.status(200).json({ reservation: result?.rows[0] });
  } catch (error) {
    console.error("Error updating check-in status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
