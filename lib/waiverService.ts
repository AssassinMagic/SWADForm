import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { PassThrough } from 'stream';

export interface WaiverData {
  first_name: string;
  last_name: string;
  address: string;
  phone: string;
  email: string;
  height: string;
  weight: string;
  age: string;
  student_id: string;
  shoe_size?: string;
  skating_ability: string;
}

// Mapping matched to user's provided PDF field names
const FIELD_MAPPING = {
  first_name: 'text_1ltvb',
  last_name: 'text_2ikbp',
  address: 'text_3nfjp',
  
  // Note: User specified phone -> text_5yjso, email -> text_6jvyf
  phone: 'text_5yjso',
  email: 'text_6jvyf',
  
  height: 'text_7eplq',
  weight: 'text_8xnse',
  age: 'text_9blee',
  skating_ability: 'text_10xtgk',

  // Signature lines
  signatureName1: 'text_11uclg',
  signatureName2: 'text_12nbo',
  
  date1: 'text_13sgix',
  date2: 'text_14ywjt',
};

// Initialize Google Auth - Move inside function or lazy load to ensure env vars are ready
// const auth = ... (removed global init)

export async function generateAndStoreWaiver(data: WaiverData) {
  try {
    // 1. Setup Auth
    if (!process.env.EMAIL_CLIENTID || !process.env.EMAIL_SECRET || !process.env.EMAIL_REFRESH_TOKEN) {
        throw new Error("Missing Google Auth Environment Variables");
    }

    const auth = new google.auth.OAuth2(
        process.env.EMAIL_CLIENTID,
        process.env.EMAIL_SECRET
    );
    auth.setCredentials({ refresh_token: process.env.EMAIL_REFRESH_TOKEN });

    // Debug Auth - Try to get an access token explicitly
    try {
        const tokenInfo = await auth.getAccessToken();
        if (!tokenInfo.token) {
            console.error("Failed to generate access token. Credentials might be invalid.");
        } else {
            console.log("Access token generated successfully.");
        }
    } catch (authError) {
        console.error("Auth check failed:", authError);
    }

    const drive = google.drive({ version: 'v3', auth });

    // 2. Load PDF
    const publicDir = path.join(process.cwd(), 'public');
    const pdfPath = path.join(publicDir, 'General Release of Liability and Waiver of Rights - RECREATIONAL SKATING-1.pdf');
    const existingPdfBytes = fs.readFileSync(pdfPath);

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    // Helper to safe set
    const setField = (fieldName: string, value: string) => {
      try {
        const field = form.getTextField(fieldName);
        if (field) {
            // Ensure value is a string, fallback to empty string
            field.setText(value || ''); 
        }
      } catch (e) {
        // Field might not exist, ignore
      }
    };

    // Fill fields
    setField(FIELD_MAPPING.first_name, data.first_name);
    setField(FIELD_MAPPING.last_name, data.last_name);
    setField(FIELD_MAPPING.address, data.address);
    setField(FIELD_MAPPING.phone, data.phone);
    setField(FIELD_MAPPING.email, data.email);
    setField(FIELD_MAPPING.height, data.height);
    setField(FIELD_MAPPING.weight, data.weight);
    setField(FIELD_MAPPING.age, data.age);
    setField(FIELD_MAPPING.skating_ability, data.skating_ability);

    // Signatures - use full name
    const fullName = `${data.first_name} ${data.last_name}`;
    setField(FIELD_MAPPING.signatureName1, fullName);
    setField(FIELD_MAPPING.signatureName2, fullName);
    
    // Dates
    const today = new Date().toLocaleDateString('en-US');
    setField(FIELD_MAPPING.date1, today);
    setField(FIELD_MAPPING.date2, today);

    // Flatten to prevent further editing
    form.flatten();

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);
    console.log(`PDF Generated. Size: ${pdfBuffer.length} bytes`);
    
    // Create filename
    const safeName = data.last_name.replace(/[^a-z0-9]/gi, '_');
    const fileName = `${safeName}_${data.student_id}_Waiver.pdf`;

    // Upload to Google Drive using a simpler stream approach
    const bufferStream = new PassThrough();
    bufferStream.end(pdfBuffer);

    const driveResponse = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: 'application/pdf',
      },
      media: {
        mimeType: 'application/pdf',
        body: bufferStream,
      },
    });

    console.log(`Waiver uploaded to Drive with ID: ${driveResponse.data.id}`);

    // Return the Buffer so we can attach it to email without needing local disk
    return { 
        filePath: null, // No local file path path
        fileBuffer: pdfBuffer,
        fileName: fileName,
        driveId: driveResponse.data.id 
    };

  } catch (error) {
    console.error('Error generating/uploading waiver:', error);
    // Don't swallow the error if we want to know why it failed, but for now log it.
    throw error;
  }
}
