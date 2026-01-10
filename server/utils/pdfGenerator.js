const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate Comparative Statement PDF
 */
const generateComparativeStatement = async (rfq, bids, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(outputPath);
      
      doc.pipe(stream);

      // Header
      doc.fontSize(20)
        .fillColor('#0F172A')
        .text('COMPARATIVE STATEMENT', { align: 'center' });
      
      doc.moveDown();
      
      // RFQ Details
      doc.fontSize(12)
        .fillColor('#374151')
        .text(`Reference: ${rfq.referenceId}`)
        .text(`Title: ${rfq.title}`)
        .text(`Category: ${rfq.category}`)
        .text(`Closing Date: ${new Date(rfq.closingDate).toLocaleDateString()}`)
        .text(`Organization: ${rfq.organization || 'N/A'}`);
      
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#E5E7EB');
      doc.moveDown();

      // Table Header
      const tableTop = doc.y;
      const itemX = 50;
      const vendorX = 150;
      const priceX = 300;
      const deliveryX = 380;
      const warrantyX = 450;
      const statusX = 510;

      doc.fontSize(10)
        .fillColor('#0F172A')
        .font('Helvetica-Bold')
        .text('#', itemX, tableTop)
        .text('Vendor', vendorX, tableTop)
        .text('Price', priceX, tableTop)
        .text('Delivery', deliveryX, tableTop)
        .text('Warranty', warrantyX, tableTop);

      doc.moveTo(50, doc.y + 5).lineTo(545, doc.y + 5).stroke('#E5E7EB');

      // Find lowest price for highlighting
      const lowestPrice = Math.min(...bids.map(b => b.totalPrice));

      // Table Rows
      let rowY = doc.y + 15;
      doc.font('Helvetica');

      bids.forEach((bid, index) => {
        const isLowest = bid.totalPrice === lowestPrice;
        
        if (isLowest) {
          doc.rect(45, rowY - 5, 505, 20).fill('#ECFDF5');
        }

        doc.fillColor(isLowest ? '#047857' : '#374151')
          .text(String(index + 1), itemX, rowY)
          .text(bid.vendor.companyName.substring(0, 20), vendorX, rowY)
          .text(`LKR ${bid.totalPrice.toLocaleString()}`, priceX, rowY)
          .text(`${bid.deliveryTimeline} days`, deliveryX, rowY)
          .text(`${bid.warrantyPeriod || 0}m`, warrantyX, rowY);

        rowY += 25;
      });

      doc.moveDown(2);

      // Footer
      doc.fontSize(9)
        .fillColor('#6B7280')
        .text(`Generated on: ${new Date().toLocaleString()}`, 50, doc.y)
        .text('This is a computer-generated document.', { align: 'center' });

      // BidSync branding
      doc.fontSize(10)
        .fillColor('#10B981')
        .text('Powered by BidSync', 50, doc.page.height - 50, { align: 'center' });

      doc.end();

      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate Audit Report PDF
 */
const generateAuditReport = async (rfq, bids, auditLogs, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(outputPath);
      
      doc.pipe(stream);

      // Header
      doc.fontSize(20)
        .fillColor('#0F172A')
        .text('AUDIT REPORT', { align: 'center' });
      
      doc.fontSize(10)
        .fillColor('#6B7280')
        .text(`Reference: ${rfq.referenceId}`, { align: 'center' });
      
      doc.moveDown(2);

      // RFQ Summary
      doc.fontSize(14)
        .fillColor('#0F172A')
        .text('Tender Summary');
      
      doc.fontSize(10)
        .fillColor('#374151')
        .text(`Title: ${rfq.title}`)
        .text(`Status: ${rfq.status.toUpperCase()}`)
        .text(`Created: ${new Date(rfq.createdAt).toLocaleString()}`)
        .text(`Closed: ${new Date(rfq.closingDate).toLocaleString()}`)
        .text(`Total Bids: ${bids.length}`);

      if (rfq.awardedTo) {
        const winningBid = bids.find(b => b.status === 'won');
        doc.text(`Awarded To: ${rfq.awardedTo.companyName || 'N/A'}`);
        if (winningBid) {
          doc.text(`Winning Bid: LKR ${winningBid.totalPrice.toLocaleString()}`);
        }
      }

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#E5E7EB');
      doc.moveDown();

      // Audit Trail
      doc.fontSize(14)
        .fillColor('#0F172A')
        .text('Audit Trail');
      
      doc.moveDown();

      auditLogs.forEach((log, index) => {
        doc.fontSize(9)
          .fillColor('#6B7280')
          .text(`${new Date(log.createdAt).toLocaleString()}`, 50, doc.y)
          .fillColor('#374151')
          .text(`${log.action}: ${log.description}`, 200, doc.y - 10);
        doc.moveDown(0.5);
      });

      // Footer
      doc.fontSize(8)
        .fillColor('#6B7280')
        .text(`Generated: ${new Date().toLocaleString()}`, 50, doc.page.height - 50, { align: 'center' });

      doc.end();

      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateComparativeStatement,
  generateAuditReport
};
