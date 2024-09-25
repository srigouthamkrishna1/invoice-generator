const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    pdf_file:{type:String},
    image_url:{type:String}
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
