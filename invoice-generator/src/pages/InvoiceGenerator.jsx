import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
    const [invoices, setInvoices] = useState([]);
    const [clientName, setClientName] = useState('');
    const [items, setItems] = useState([{ description: '', quantity: 0, unitPrice: 0 }]);
    const [subtotal, setSubtotal] = useState(0);
    const [tax, setTax] = useState(0);
    const [totalDue, setTotalDue] = useState(0);
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [yourCompanyName, setYourCompanyName] = useState('');
    const [yourName, setYourName] = useState('');
    const [yourCompanyAddress, setYourCompanyAddress] = useState('');
    const [yourCompanyCity, setYourCompanyCity] = useState('');
    const [yourCompanyState, setYourCompanyState] = useState('');
    const [yourCompanyZip, setYourCompanyZip] = useState('');
    const [yourCompanyCountry, setYourCompanyCountry] = useState('');
    const [yourPhone, setYourPhone] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [yourCompanyGST, setYourCompanyGST] = useState('');
    const [billTo, setBillTo] = useState('');
    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        const res = await axios.get('http://localhost:5000/invoices');
        setInvoices(res.data);
    };

    const handleItemChange = (index, e) => {
        const newItems = [...items];
        newItems[index][e.target.name] = e.target.value;
        setItems(newItems);
        calculateTotals(newItems);
    };

    const calculateTotals = (items) => {
        const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
        const total = subtotal + (subtotal * (tax / 100));
        setSubtotal(subtotal);
        setTotalDue(total);
    };

    const handleImageUpload = async (e) => {
        const formData = new FormData();
        formData.append('image', e.target.files[0]);

        const res = await axios.post('http://localhost:5000/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        setImageUrl(res.data.imageUrl);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const invoiceData = {
            clientName,
            items,
            subtotal,
            tax,
            totalDue,
            imageUrl,
        };
    
        try {
            // Create the invoice
            const res = await axios.post('http://localhost:5000/invoices', invoiceData);
            
            // Prepare the PDF URL for download
           const pdfUrl = `http://localhost:5000/invoices/pdf/${res.data._id}`;
            console.log(pdfUrl);
            // Create an invisible link to trigger download
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `invoice_${res.data._id}.pdf`; // Set the filename
            document.body.appendChild(link); // Append link to body
            link.click(); // Programmatically click the link
            document.body.removeChild(link); // Remove the link from the document
    
            // Fetch updated invoices
            fetchInvoices();
            resetForm();
        } catch (error) {
            console.error('Error creating invoice:', error);
        }
    };
    

    const countries = [
        'United States',
        'Canada',
        'United Kingdom',
        'Australia',
        'India',
        'Germany',
        'France',
        'China',
        'Japan',
        'Brazil',
        // Add more countries as needed
      ];
      const handleChange = (event) => {
        setSelectedCountry(event.target.value);
      };
    const resetForm = () => {
        setYourCompanyName('');
        setYourName('');
        setSelectedCountry('');
        setYourCompanyAddress('');
        setYourCompanyCity('');
        setYourCompanyState('');
        setYourCompanyGST('');
        setClientName('');
        setClientAddress('');
        setClientPhone('');

        setItems([{ description: '', quantity: 0, unitPrice: 0 }]);
        setSubtotal(0);
        setTax(0);
        setTotalDue(0);
        setImageUrl('');
    };

    return (
        <div className="container mx-auto p-5">
            <h1 className="text-2xl font-bold mb-5">Invoice Generator</h1>
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-6">
            <input
                    type="text"
                    placeholder="Your Company Name"
                    value={yourCompanyName}
                    onChange={(e) => setYourCompanyName(e.target.value)}
                    required
                    className="border rounded p-2 mb-4 w-full"
                />
                <input
                    type="text"
                    placeholder="Your Name"
                    value={yourName}
                    onChange={(e) => setYourName(e.target.value)}
                    required
                    className="border rounded p-2 mb-4 w-full"
                />
                <input
                    type="text"
                    placeholder="Your Company Address"
                    value={yourCompanyAddress}
                    onChange={(e) => setYourCompanyAddress(e.target.value)}
                    required
                    className="border rounded p-2 mb-4 w-full"
                />
                
                <input
                    type="text"
                    placeholder="Company'sGST"
                    value={yourCompanyGST}
                    onChange={(e) => setYourCompanyGST(e.target.value)}
                    required
                    className="border rounded p-2 mb-4 w-full"
                />
                 <input
                    type="text"
                    placeholder="State"
                    value={yourCompanyState}
                    onChange={(e) => setYourCompanyState(e.target.value)}
                    required
                    className="border rounded p-2 mb-4 w-full"
                />
                 <input
                    type="text"
                    placeholder="City"
                    value={yourCompanyCity}
                    onChange={(e) => setYourCompanyCity(e.target.value)}
                    required
                    className="border rounded p-2 mb-4 w-full"
                />
                <select
        id="country-select"
        value={selectedCountry}
        onChange={handleChange}
        className="p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">--Choose a country--</option>
        {countries.map((country, index) => (
          <option key={index} value={country}>
            {country}
          </option>
        ))}
      </select>
      <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="border rounded p-2 mb-4 w-full"
                />
                <input
                    type="text"
                    
                    value={billTo}
                    {...register("Bill To:")}
                    
                    onChange={(e) => setBillTo(e.target.value)}
                    required
                    className="border rounded p-2 mb-4 w-full text-xl font-bold"
                />
                
                <input
                    type="text"
                    placeholder="Client Name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                    className="border rounded p-2 mb-4 w-full"
                />
                
                {items.map((item, index) => (
                    <div key={index} className="flex mb-4 space-x-4">
                        <input
                            type="text"
                            name="description"
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, e)}
                            required
                            className="border rounded p-2 w-full"
                        />
                        <input
                            type="number"
                            name="quantity"
                            placeholder="Quantity"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, e)}
                            required
                            className="border rounded p-2 w-full"
                        />
                        <input
                            type="number"
                            name="unitPrice"
                            placeholder="Unit Price"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, e)}
                            required
                            className="border rounded p-2 w-full"
                        />
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => setItems([...items, { description: '', quantity: 0, unitPrice: 0 }])}
                    className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
                >
                    Add Item
                </button>
                <input
                    type="number"
                    placeholder="Tax (%)"
                    value={tax}
                    onChange={(e) => {
                        setTax(e.target.value);
                        calculateTotals(items);
                    }}
                    className="border rounded p-2 mb-4 w-full"
                />
                
                <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded">
                    Create Invoice
                </button>
            </form>
            {/* <h2 className="text-xl font-bold mt-5">Invoices</h2>
            <ul className="mt-4"> */}
    {/* {invoices.map((invoice) => (
        <li key={invoice._id} className="bg-gray-100 p-3 rounded mb-2">
            {invoice.clientName} - Total: ${invoice.totalDue.toFixed(2)}
            {invoice.imageUrl && (
                <div className="mt-2">
                    <img src={invoice.imageUrl} alt="Invoice" className="max-w-xs" />
                </div>
            )}
            <a 
                   
                className="text-blue-500 hover:underline"
                download
            >
                Download Invoice
            </a>
        </li>
    ))} */}
{/* </ul> */}
        </div>
    );
};

export default App;
