import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // We need two counts:
    // 1. Total signups per slot
    // 2. 'Use Provided Skates' signups per slot

    const query = `
      SELECT 
        skate_time,
        COUNT(*) as total_count,
        SUM(CASE WHEN skate_preference = 'Use Provided Skates' THEN 1 ELSE 0 END) as provided_count
      FROM reservations
      GROUP BY skate_time
    `;

    const result = await pool.query(query);

    const slotData: Record<string, { total: number; provided: number }> = {};
    
    result.rows.forEach((row) => {
        slotData[row.skate_time] = {
            total: parseInt(row.total_count, 10),
            provided: parseInt(row.provided_count, 10)
        };
    });

    res.status(200).json(slotData);
  } catch (error) {
    console.error("Error fetching slot counts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
