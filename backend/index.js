const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const Invoice = require('./models/Invoice');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());    
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => console.log(err));

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Routes

// Fetch invoices
app.get('/invoices', async (req, res) => {
    try {
        const invoices = await Invoice.find();
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new invoice
app.post('/invoices', async (req, res) => {
    const invoice = new Invoice(req.body);
    try {
        console.log("req.body",req.body);
        const savedInvoice = await invoice.save();
        console.log("savedInvoice",savedInvoice);
        res.status(201).json(savedInvoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Upload image
app.post('/upload', upload.single('image'), async(req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const invoice_pdf = await Invoice.updateOne({_id:req.params.id},{$set:{image_url:imageUrl}});
    res.json({ imageUrl });
});


app.get('/invoices/pdf/:id', async (req, res) => {
    try {
        
        console.log('Generating PDF for invoice:', req.params.id);
        const data = req.query.data;
        const invoice = await Invoice.findById(req.params.id);
        console.log("data here",data);
        if (!invoice) return res.status(404).send('Invoice not found');
        console.log("invoice",invoice);
        const doc = new PDFDocument();
        const filePath = path.join(__dirname, 'uploads', `invoice_${invoice._id}.pdf`);
        const pdf_file = `invoice_${invoice._id}.pdf`
        const invoice_pdf = await Invoice.updateOne({_id:req.params.id},{$set:{pdf_file:pdf_file}});
        let total=0;
        data.items.forEach(item=>{
            item.total=item.quantity*item.unitPrice;
            total+=item.total;
        })
        console.log("data.items",data.items);

        // doc.pipe(fs.createWriteStream(pdfFilePath));

        // // Add content to PDF
        // doc.fontSize(25).text(`Invoice for ${invoice.clientName}`, { align: 'center' });
        // doc.moveDown();

        // // Add invoice items
        // invoice.items.forEach(item => {
        //     doc.text(`${item.description}: ${item.quantity} x $${item.unitPrice.toFixed(2)}`);
        // });

        // doc.moveDown();
        // doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`);
        // doc.text(`Tax: $${invoice.tax.toFixed(2)}`);
        // doc.text(`Total Due: $${invoice.totalDue.toFixed(2)}`);
        
        // Add image if it exists
       

        // doc.end();
        
       
        // doc.on('finish', () => {
        //     console.log('PDF generated');
        //     res.download(pdfFilePath, `invoice_${invoice._id}.pdf`, (err) => {
        //         if (err) {
        //             console.error(err);
        //         }
        //         // Optional: delete the PDF file after download
               
        //     });
        const writeStream = fs.createWriteStream(filePath);
        console.log("writeStream");
    doc.pipe(writeStream);
    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();
  
    // Invoice details (Invoice#, Date, etc.)
  doc.fontSize(12).text(`Invoice# ${req.params.id}`, { align: 'left' });
  doc.text(`Invoice Date: ${data.invoiceDate}`, { align: 'left' });
  doc.text(`Due Date: ${data.dueDate}`, { align: 'left' });
  doc.moveDown();
  
  // Bill to section
  doc.fontSize(14).text(`Bill To: ${data.billTo}`, { underline: true });
  doc.fontSize(12).text(data.clientName);
  doc.text(data.clientAddress);
  doc.text(data.clientCity);
  doc.text(data.clientState);
  doc.text(`GSTIN: ${data.clientGSTIN}`);
  doc.moveDown();
  
  // Place of supply
  // doc.fontSize(12).text(`Place of Supply: `);
  doc.moveDown();
  
  // Table headers
  let y=doc.y;
  doc.fontSize(12).text('Item Description', 50, y);
  
  doc.text('Quantity', 200, y);
  doc.text('Unit Price', 300, y);
  doc.text('Total', 400, y);
  
  doc.moveDown();
  
  // Line separator
  doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke();
  doc.moveDown();
  ;
 
  // Table rows (Items)
  data.items.forEach((item, i) => {
    y=doc.y;
    doc.text(item.description, 50,y);
    doc.text(item.quantity, 200, y);
    doc.text(item.unitPrice, 300,y);
    doc.text(item.total, 400,y);
    //set total
   
    doc.moveDown();
  });

  // Totals section
  doc.moveDown().moveDown();
 
  console.log("here")
//   doc.text(`SGST (${invoiceData.taxPercentage / 2}%): ${invoiceData.sgstTotal.toFixed(2)}`, { align: 'right' });
//   doc.text(`CGST (${invoiceData.taxPercentage / 2}%): ${invoiceData.cgstTotal.toFixed(2)}`, { align: 'right' });
  doc.text(`Total: ${total}`, { align: 'right' });
 
 
  // Notes and Terms section
  doc.moveDown();
  console.log("here")
  doc.fontSize(14).text('Notes', { underline: true });
  
  doc.fontSize(12).text("Invoice Generated");
  
  doc.moveDown();
  doc.fontSize(14).text('Terms & Conditions', { underline: true });
  

  // Finalize the PDF
  doc.end();


    // Add content to PDF
    // doc.fontSize(25).text('Invoice', { align: 'center' });
    
    // doc.moveDown().text('This is your invoice content.');
    // if (invoice.imageUrl) {
    //     const imagePath = path.join(__dirname, 'uploads', path.basename(invoice.imageUrl));
    //     console.log("image path is",imagePath);
       
    //     doc.image(imagePath, {
    //         fit: [500, 500],
    //         align: 'center',
    //         valign: 'center',
    //     });
    // }
    // doc.end();
    console.log("filepath",filePath.trim().split('/').pop());
   res.json({message:"PDF generated"})
    // After the PDF is finished writing
    // writeStream.on('finish', () => {
    //     res.download(filePath, 'invoice.pdf', (err) => {
    //         if (err) {
    //             console.error('Error sending file:', err);
    //         }
    //     });
    //     });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.get("/downloadfile/:id",async(req,res)=>{
    console.log("in download file");
    const invoice_pdf = await Invoice.findById(req.params.id);
 
    const t=`${invoice_pdf.pdf_file}`;
    console.log("t",t);
    const filePath = path.join(__dirname, 'uploads', t);
    console.log("filePath here",filePath);
   
        res.download(filePath, 'invoice.pdf', (err) => {
            if (err) {
                console.error('Error sending file:', err);
            }
        });
       
    })

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
