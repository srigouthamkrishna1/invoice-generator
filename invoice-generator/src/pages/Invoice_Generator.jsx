import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import '../../node_modules/react-datepicker/dist/react-datepicker.css';

const App = () => {
    const { register, handleSubmit, control, reset, setValue, watch } = useForm({
        defaultValues: {
            clientName: '',
            items: [{ description: '', quantity: 1, unitPrice: 0 ,total:0}],
            tax: 0,
            yourCompanyName: '',
            yourName: '',
            yourCompanyAddress: '',
            yourCompanyCity: '',
            yourCompanyState: '',
            yourCompanyGST: '',
            billTo: '',
            clientAddress: '',
            clientGSTIN: '',
            clientState: '',
            clientCity: '',
            invoiceDate: new Date(),
            dueDate: new Date(),
            imageUrl: ''
        }
    });

    const { fields, append,remove } = useFieldArray({
        control,
        name: 'items'
    });

    const watchItems = watch('items');
    const watchTax = watch('tax');

    useEffect(() => {
        calculateTotals(watchItems);
    }, [watchItems, watchTax]);

    const calculateTotals = (items) => {
        const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
        const total = subtotal + (subtotal * (watchTax / 100));
        setValue('subtotal', subtotal);
        setValue('totalDue', total);
    };

    const fetchInvoices = async () => {
        const res = await axios.get('http://localhost:5000/invoices');
        // Handle fetched invoices (not used in this code)
    };

    // const handleImageUpload = async (e) => {
    //     const formData = new FormData();
    //     formData.append('image', e.target.files[0]);

    //     const res = await axios.post('http://localhost:5000/upload', formData, {
    //         headers: {
    //             'Content-Type': 'multipart/form-data',
    //         },
    //     });

    //     setValue('imageUrl', res.data.imageUrl);
    // };

    const onSubmit = async (data) => {
        try {
            // Create the invoice
             const res = await axios.post('http://localhost:5000/invoices', data);
            
            // // Prepare the PDF URL for download
            console.log("res",res.data._id);
            const res2 = await axios.get(`http://localhost:5000/invoices/pdf/${res.data._id}`,{params:{data:data}})
            console.log("res2",res2);
            const pdfUrl = `http://localhost:5000/downloadfile/${res.data._id}`;
            console.log(pdfUrl);
            window.open(pdfUrl, '_blank');
            // Create an invisible link to trigger download
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `invoice_${res.data._id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Fetch updated invoices
            
            console.log("data",data);
            //  resetForm();
        } catch (error) {
            console.error('Error creating invoice:', error);
        }
    };

    const resetForm = () => {
        reset();
    };

    return (
        <div className="container mx-auto p-5">
            <h1 className="text-2xl font-bold mb-5 bg-black p-4 text-white">Invoice Generator</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded p-6">
                <input
                    type="text"
                    placeholder="Your Company Name"
                    {...register('yourCompanyName', { required: true })}
                    className="border rounded p-2 mb-4 w-full"
                />
                <input
                    type="text"
                    placeholder="Your Name"
                    {...register('yourName', { required: true })}
                    className="border rounded p-2 mb-4 w-full"
                />
                <input
                    type="text"
                    placeholder="Your Company Address"
                    {...register('yourCompanyAddress', { required: true })}
                    className="border rounded p-2 mb-4 w-full"
                />
                <input
                    type="text"
                    placeholder="Company's GST"
                    {...register('yourCompanyGST', { required: true })}
                    className="border rounded p-2 mb-4 w-full"
                />
                <input
                    type="text"
                    placeholder="State"
                    {...register('yourCompanyState', { required: true })}
                    className="border rounded p-2 mb-4 w-full"
                />
                <input
                    type="text"
                    placeholder="City"
                    {...register('yourCompanyCity', { required: true })}
                    className="border rounded p-2 mb-4 w-full"
                />
                <Controller
                    name="selectedCountry"
                    control={control}
                    render={({ field }) => (
                        <select
                            {...field}
                            className="p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">--Choose a country--</option>
                            {[
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
                            ].map((country, index) => (
                                <option key={index} value={country}>
                                    {country}
                                </option>
                            ))}
                        </select>
                    )}
                />
                {/* <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="border rounded p-2 mb-4 w-full"
                /> */}
                <input
                    type="text"
                    placeholder="Bill To" 
                    {...register('billTo', { required: true })}
                    className="border rounded p-2 mb-4 w-full"
                />
                <div>
                    <label className='text-sm font-semibold'>Invoice Date:</label>
                <Controller
                    name="invoiceDate"
                    control={control}
                    render={({ field }) => (
                        <DatePicker
                            {...field}
                            selected={field.value}
                            onChange={(date) => field.onChange(date)}
                            className="border rounded p-2 mb-4 w-full"
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select Invoice Date"
                        />
                    )}
                />
                </div>
                <div>
                <label className='text-sm font-semibold'>Due Date:</label>
                <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                        <DatePicker
                            {...field}
                            selected={field.value}
                            onChange={(date) => field.onChange(date)}
                            className="border rounded p-2 mb-4 w-full"
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select Due Date"
                        />
                    )}
                />
                </div>
                <input
                    type="text"
                    placeholder="Client Name"
                    {...register('clientName', { required: true })}
                    className="border rounded p-2 mb-4 w-full"
                />
                 <input
                    type="text"
                      placeholder="Client Address"
                    {...register('clientAddress', { required: true })}
                    className="border rounded p-2 mb-4 w-full"
                />
                <input
                    type="text"
                      placeholder="Client GSTIN"
                    {...register('clientGSTIN', { required: true })}
                    className="border rounded p-2 mb-4 w-full"
                />
                <input
                    type="text"
                      placeholder="Client City"
                    {...register('clientCity', { required: true })}
                    className="border rounded p-2 mb-4 w-full"
                />
                <input
                    type="text"
                      placeholder="Client State"
                    {...register('clientState', { required: true })}
                    className="border rounded p-2 mb-4 w-full"
                />
                 <table className="w-full text-left table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Unit Price</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((item, index) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-2">
                  <input
                    type="text"
                    {...register(`items.${index}.description`, { required: true })}
                    className="border rounded p-2 w-full"
                    placeholder="Item Description"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    {...register(`items.${index}.quantity`, { required: true })}
                    className="border rounded p-2 w-full"
                    placeholder="Quantity"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="decimal"
                    {...register(`items.${index}.unitPrice`, { required: true })}
                    className="border rounded p-2 w-full"
                    placeholder="Unit Price"
                  />
                </td>
                <td className="px-4 py-2">
                  {/* Calculate total for each row */}
                  {(item.quantity * item.unitPrice).toFixed(2)}
                </td>
                <td className="px-4 py-2">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="bg-red-500 text-white py-1 px-2 rounded"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <button
          type="button"
          onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
          className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
        >
          Add Item
        </button>
        </table>
                
                <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded">
                    Create Invoice
                </button>
            </form>
        </div>
    );
};

export default App;
