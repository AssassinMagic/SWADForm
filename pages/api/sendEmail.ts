import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

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
          type: 'OAuth2',
          user: process.env.EMAIL_USER,
          clientId: process.env.EMAIL_CLIENTID,
          clientSecret: process.env.EMAIL_SECRET,
          refreshToken: process.env.EMAIL_REFRESH_TOKEN,
        },
      });

      // Look for the generated waiver
      const safeName = last_name.replace(/[^a-z0-9]/gi, '_');
      const fileName = `${safeName}_${student_id}_Waiver.pdf`;
      const waiverPath = path.join(process.cwd(), 'waivers', fileName);
      
      const attachments = [];
      if (fs.existsSync(waiverPath)) {
        attachments.push({
          filename: 'Skating_Waiver.pdf',
          path: waiverPath,
        });
      } else {
        console.warn(`Waiver not found at ${waiverPath}`);
      }

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
          <p><strong>Please find your filled waiver attached.</strong></p>
          <h3>See you there! 🎉</h3>
          <p><em>This is an automated email.</em></p>
        `,
        attachments: attachments
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
