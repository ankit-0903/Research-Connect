const PDFDocument = require('pdfkit');
const recordModels = require('../models/recordModels');// Adjust the import to match your data model

module.exports = async (req, res) => {
  try {
    // Fetch and sort records
    const records = await recordModels.find().sort({ status: 1 });

    if (records.length === 0) {
      return res.status(404).json({ error: 'No data found to generate report' });
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 30 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=alumni_report.pdf');
    doc.pipe(res);

    // Add title
    doc.fontSize(18).font('Helvetica-Bold').text('AlumConnect Report', { align: 'center' });
    doc.moveDown();

    // Group data by status
    const groupedData = records.reduce((acc, record) => {
      acc[record.status] = acc[record.status] || [];
      acc[record.status].push(record);
      return acc;
    }, {});

    // Render group summary
    doc.fontSize(14).font('Helvetica-Bold').text('Group Summary:', { underline: true });
    doc.moveDown(0.5);

    Object.entries(groupedData).forEach(([status, group]) => {
      doc
        .rect(50, doc.y, 250, 30)
        .fillAndStroke('#f0f0f0', '#000')
        .stroke();
      doc.fill('#000').font('Helvetica').text(`Status: ${status} - ${group.length}`, 55, doc.y + 8);
      doc.moveDown(1.5);
    });

    doc.moveDown(1.5);

    // Define table layout
    const tableHeaders = ['Sl. No', 'Name', 'Batch', 'Status', 'Company/University'];
    const columnWidths = [50, 150, 100, 100, 150];
    const startX = 50;
    const rowHeight = 25;
    let currentY = doc.y;

    const drawTableHeader = () => {
      let currentX = startX;
      doc.fontSize(12).font('Helvetica-Bold');
      tableHeaders.forEach((header, i) => {
        doc.text(header, currentX + 5, currentY + 5, { width: columnWidths[i] - 10 });
        currentX += columnWidths[i];
        doc.moveTo(currentX, currentY).lineTo(currentX, currentY + rowHeight).stroke();
      });
      doc.moveTo(startX, currentY + rowHeight).lineTo(startX + columnWidths.reduce((a, b) => a + b), currentY + rowHeight).stroke();
      currentY += rowHeight;
    };

    const drawRow = (values) => {
      let currentX = startX;
      doc.fontSize(12).font('Helvetica');
      values.forEach((value, i) => {
        doc.text(String(value), currentX + 5, currentY + 5, { width: columnWidths[i] - 10 });
        currentX += columnWidths[i];
        doc.moveTo(currentX, currentY).lineTo(currentX, currentY + rowHeight).stroke();
      });
      doc.moveTo(startX, currentY + rowHeight).lineTo(startX + columnWidths.reduce((a, b) => a + b), currentY + rowHeight).stroke();
      currentY += rowHeight;
    };

    // Render data
    Object.entries(groupedData).forEach(([status, group]) => {
      if (currentY + rowHeight * (group.length + 3) > doc.page.height - 50) {
        doc.addPage();
        currentY = 50;
      }

      doc.fontSize(14).font('Helvetica-Bold').text(`Status: ${status}`, startX, currentY);
      currentY += rowHeight;

      drawTableHeader();

      group.forEach((record, index) => {
        if (currentY + rowHeight > doc.page.height - 50) {
          doc.addPage();
          currentY = 50;
          drawTableHeader();
        }
        drawRow([index + 1, record.name, record.batch, record.status, record.company]);
      });

      currentY += rowHeight;
    });

    doc.end();
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};
