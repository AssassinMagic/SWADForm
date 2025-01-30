import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Ensure this is in your .env file
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const result = await pool.query("SELECT size, time_slot, available_count FROM skate_inventory");
    const skateSizes = result.rows.reduce((acc, row) => {
      if (!acc[row.size]) acc[row.size] = { times: {} };
      acc[row.size].times[row.time_slot] = row.available_count;
      return acc;
    }, {} as Record<string, { times: Record<string, number> }>);

    res.status(200).json(skateSizes);
  } catch (error) {
    console.error("Error fetching skate inventory:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
