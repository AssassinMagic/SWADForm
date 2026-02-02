import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

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

export async function generateAndStoreWaiver(data: WaiverData) {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const pdfPath = path.join(publicDir, 'General Release of Liability and Waiver of Rights - RECREATIONAL SKATING-1.pdf');
    const existingPdfBytes = fs.readFileSync(pdfPath);

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    // Helper to safe set
    const setField = (fieldName: string, value: string) => {
      try {
        const field = form.getTextField(fieldName);
        if (field) field.setText(value);
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
    
    // Dates - use fixed date per user request or dynamic? 
    // User wrote: date: 02/14/2026. I will use the date provided in requirements or dynamic. 
    // Usually waivers are signed "today". I will stick to current date or a specific date if requested.
    // The previous edit had "02/14/2026" in the interface (weirdly). I'll use today's date for logic.
    const today = new Date().toLocaleDateString('en-US');
    setField(FIELD_MAPPING.date1, today);
    setField(FIELD_MAPPING.date2, today);

    // Flatten to prevent further editing
    form.flatten();

    const pdfBytes = await pdfDoc.save();
    
    // Create filename
    const safeName = data.last_name.replace(/[^a-z0-9]/gi, '_');
    const fileName = `${safeName}_${data.student_id}_Waiver.pdf`;
    const outputDir = path.join(process.cwd(), 'waivers');
    const outputPath = path.join(outputDir, fileName);

    fs.writeFileSync(outputPath, pdfBytes);
    console.log(`Waiver generated at: ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    console.error('Error generating waiver:', error);
    throw error;
  }
}
