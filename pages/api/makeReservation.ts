import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
// import { generateAndStoreWaiver } from "@/lib/waiverService"; 
import nodemailer from "nodemailer";

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

    // Waiver generation skipped for now
    /*
    let waiverResult = null;
    try {
        waiverResult = await generateAndStoreWaiver({ ... });
    } catch (waiverError) {
        console.error("Waiver generation failed...", waiverError);
    }
    */

    // Send Email
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

        // No attachments
        /*
        const attachments = [];
        if (waiverResult && waiverResult.fileBuffer) { ... }
        */

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Skate with a Date Reservation - Confirmation",
            html: `
              <h2>You've been registered for Skate with a Date!</h2>
              <p>The event will be held at <strong>Ridder Arena on February 14th</strong>. Arrive 10-15 minutes early to sign your waiver.</p>
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
              <p>If you need to cancel or reschedule, please contact support or reply to this email. jay00015@umn.edu</p>
              <h3>See you there! 🎉</h3>
              <p><em>This is an automated email.</em></p>
            `,
            // attachments: attachments 
        };
    
        await transporter.sendMail(mailOptions);
        console.log("Confirmation email sent.");

    } catch (emailError) {
        console.error("Failed to send email:", emailError);
    }

    res.status(200).json({ message: "Reservation successful" });
  } catch (error) {
    console.error("Error making reservation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
