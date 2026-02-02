import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
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
        to: email,
        subject: "Skate Reservation - Confirmation",
        html: `
          <h2>You've been registered for Skate Session!</h2>
          <p><strong>Name:</strong> ${first_name} ${last_name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Address:</strong> ${address}</p>
          <p><strong>Student ID:</strong> ${student_id}</p>
          <p><strong>Height:</strong> ${height}</p>
          <p><strong>Weight:</strong> ${weight}</p>
          <p><strong>Age:</strong> ${age}</p>
          <p><strong>Skating Ability:</strong> ${skating_ability}</p>
          <p><strong>Skates:</strong> ${skate_preference} ${skate_preference === 'Use Provided Skates' ? `(Size: ${shoe_size})` : ''}</p>
          <p><strong>Time Slot:</strong> ${skate_time}</p>
          <p>The event will be held at <strong>Ridder Arena</strong>. Please arrive on time.</p>
          <p>If you need to cancel or reschedule, please contact support.</p>
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
