const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createFieldMap() {
  const pdfPath = path.join(process.cwd(), 'public', 'General Release of Liability and Waiver of Rights - RECREATIONAL SKATING-1.pdf');
  const outputPath = path.join(process.cwd(), 'public', 'waiver_field_map.pdf');
  
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  
  fields.forEach(field => {
    if (field.constructor.name === 'PDFTextField') {
      field.setText(field.getName());
    }
  });
  
  const pdfBytesSaved = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytesSaved);
  console.log(`Field map saved to ${outputPath}`);
}

createFieldMap();
