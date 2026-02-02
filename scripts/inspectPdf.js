const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function listFields() {
  const pdfPath = path.join(process.cwd(), 'public', 'General Release of Liability and Waiver of Rights - RECREATIONAL SKATING-1.pdf');
  const pdfBytes = fs.readFileSync(pdfPath);
  
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  
  console.log("Fields found in PDF:");
  fields.forEach(field => {
    const type = field.constructor.name;
    const name = field.getName();
    console.log(`${type}: ${name}`);
  });
}

listFields();
