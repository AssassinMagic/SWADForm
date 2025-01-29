import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';

// Connect to the Neon Database
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { user_email, name, student_id, skate_size, skate_time, song_recommendation } = req.body;

    if (!user_email || !name || !student_id || !skate_size || !skate_time || !song_recommendation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const query = `
        INSERT INTO reservations (user_email, name, student_id, skate_size, skate_time, song_recommendation)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      await client.query(query, [user_email, name, student_id, skate_size, skate_time, song_recommendation]);

      return res.status(200).json({ message: 'Reservation saved successfully' });
    } catch (error) {
      console.error('Error saving reservation:', error);
      return res.status(500).json({ error: 'Failed to save reservation' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
