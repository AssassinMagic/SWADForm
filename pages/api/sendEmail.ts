import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { user_email, name, student_id, skate_size, skate_time, song_recommendation } = req.body;

    if (!user_email || !name || !student_id || !skate_size || !skate_time || !song_recommendation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, 
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user_email,
        subject: "Skate with a Date - Confirmation",
        html: `
          <h2>You've been registered for Skate with a Date!</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Student ID:</strong> ${student_id}</p>
          <p><strong>Time Slot:</strong> ${skate_time}</p>
          <p><strong>Skate Size:</strong> ${skate_size}</p>
          <p><strong>Song Recommendation:</strong> ${song_recommendation}</p>
          <p>The event will be held at <strong>Ridder Arena</strong> from <strong>12PM to 3PM</strong>. Please arrive on time and be ready to leave the ice 5 minutes before your hour ends.</p>
          <p>If you need to cancel or reschedule, please email <a href="mailto:jay00015@umn.edu">jay00015@umn.edu</a>.</p>
          <p>Snacks, drinks, photos, and activities will be provided!</p>
          <h3>See you there! 🎉</h3>
          <p><em>This is an automated email.</em></p>
        `,
      };

      await transporter.sendMail(mailOptions);
      return res.status(200).json({ message: 'Confirmation email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ error: 'Failed to send confirmation email' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
