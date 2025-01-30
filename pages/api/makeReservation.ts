import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { user_email, name, student_id, skate_time, skate_size, song_recommendation } = req.body;

  if (!user_email || !name || !student_id || !skate_time || !skate_size) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Start a transaction
    await pool.query("BEGIN");

    // Check if there's available stock
    const inventoryCheck = await pool.query(
      "SELECT available_count FROM skate_inventory WHERE size = $1 AND time_slot = $2 FOR UPDATE",
      [skate_size, skate_time]
    );

    if (inventoryCheck.rows.length === 0 || inventoryCheck.rows[0].available_count <= 0) {
      await pool.query("ROLLBACK");
      return res.status(400).json({ error: "Skate size unavailable" });
    }

    // Insert reservation
    await pool.query(
      "INSERT INTO reservations (user_email, name, student_id, skate_size, skate_time, song_recommendation) VALUES ($1, $2, $3, $4, $5, $6)",
      [user_email, name, student_id, skate_size, skate_time, song_recommendation]
    );

    // Update inventory
    await pool.query(
      "UPDATE skate_inventory SET available_count = available_count - 1 WHERE size = $1 AND time_slot = $2",
      [skate_size, skate_time]
    );

    await pool.query("COMMIT");

    res.status(200).json({ message: "Reservation successful" });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error making reservation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
