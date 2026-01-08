import React, { useState, useRef } from 'react';
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

const ShipperDetails = ({ onNext, onBack, initialData = {} }) => {
  const [accountType, setAccountType] = useState('Personal');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isNoteClosed, setIsNoteClosed] = useState(false);

  const [shipperDetails, setShipperDetails] = useState({
    name: initialData.shipperDetails?.name || '',
    email: initialData.shipperDetails?.email || '',
    pickupAddressType: initialData.shipperDetails?.pickupAddressType || 'Home',
    postalCode: initialData.shipperDetails?.postalCode || '',
    city: initialData.shipperDetails?.city || '',
    country: initialData.shipperDetails?.country || '',
    pickupDate: initialData.shipperDetails?.pickupDate || '',
    pickupTime: initialData.shipperDetails?.pickupTime || '',
    number: initialData.shipperDetails?.number || '',
    fulladdress: initialData.shipperDetails?.fulladdress || '',
  });

  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShipperDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressTypeChange = (type) => {
    setShipperDetails(prev => ({ ...prev, pickupAddressType: type }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requiredFields = [
      'name', 'email', 'pickupDate', 'pickupTime',
      'postalCode', 'number', 'city', 'country', 'fulladdress',
    ];

    const isValid = requiredFields.every(field => shipperDetails[field]);
    if (!isValid) {
      alert('Please fill in all required fields (marked with *).');
      return;
    }

    onNext({ shipperDetails, attachmentFile: selectedFile });
  };

  const handleFileUploadClick = () => fileInputRef.current.click();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto h-full bg-white p-4 sm:p-6 md:p-8 lg:p-10 rounded-xl shadow-md"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
          Please Fill The Shipper Details
        </h2>
        <div className="flex space-x-2">
          {['Personal', 'Business'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setAccountType(type)}
              className={`px-4 py-2 rounded-full text-sm md:text-base font-medium transition duration-200 ${
                accountType === type
                  ? 'border border-[#0356A2] bg-[#0356A2] text-white shadow-md'
                  : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {type} 
            </button>
          ))}
        </div>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 mb-8">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {accountType === 'Personal' ? 'Name*' : 'Business Name*'}
          </label>
          <input
            type="text"
            name="name"
            value={shipperDetails.name}
            onChange={handleChange}
            placeholder={accountType === 'Personal' ? 'Enter Your Name' : 'Enter Business Name'}
            className="w-full border border-gray-300 rounded-md shadow-sm p-3 placeholder-gray-400 bg-gray-50 focus:bg-white focus:border-[#0356A2] focus:ring-1 focus:ring-[#0356A2]"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email*</label>
          <input
            type="email"
            name="email"
            value={shipperDetails.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border border-gray-300 rounded-md shadow-sm p-3 placeholder-gray-400 bg-gray-50 focus:bg-white focus:border-[#0356A2] focus:ring-1 focus:ring-[#0356A2]"
            required
          />
        </div>

        {/* Pickup Type */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pickup Address Type*
          </label>
          <div className="flex flex-wrap gap-3">
            {['Home', 'Office', 'Other'].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => handleAddressTypeChange(type)}
                className={`px-5 py-2.5 border rounded-md text-sm md:text-base font-medium transition duration-200 ${
                  shipperDetails.pickupAddressType === type
                    ? 'bg-[#0356A2] text-white border-[#0356A2]'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex flex-col sm:flex-row gap-4 sm:col-span-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date*</label>
            <input
              type="date"
              name="pickupDate"
              value={shipperDetails.pickupDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md shadow-sm p-3 bg-gray-50 focus:bg-white focus:border-[#0356A2] focus:ring-1 focus:ring-[#0356A2]"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Time*</label>
            <input
              type="time"
              name="pickupTime"
              value={shipperDetails.pickupTime}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md shadow-sm p-3 bg-gray-50 focus:bg-white focus:border-[#0356A2] focus:ring-1 focus:ring-[#0356A2]"
              required
            />
          </div>
        </div>

        {/* Postal & Address */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Postal Code & Full Address*
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              name="postalCode"
              value={shipperDetails.postalCode}
              onChange={handleChange}
              placeholder="Postal Code"
              className="w-full sm:w-1/3 border border-gray-300 rounded-md shadow-sm p-3 bg-gray-50 focus:bg-white focus:border-[#0356A2] focus:ring-1 focus:ring-[#0356A2]"
              required
            />
            <input
              type="text"
              name="fulladdress"
              value={shipperDetails.fulladdress}
              onChange={handleChange}
              placeholder="Full Address"
              className="w-full sm:w-2/3 border border-gray-300 rounded-md shadow-sm p-3 bg-gray-50 focus:bg-white focus:border-[#0356A2] focus:ring-1 focus:ring-[#0356A2]"
              required
            />
          </div>
        </div>

        {/* Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Number*</label>
          <div className="flex">
            <span className="inline-flex items-center px-3 text-sm text-gray-600 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md h-[48px]">
              🇮🇳 +91
            </span>
            <input
              type="tel"
              name="number"
              value={shipperDetails.number}
              onChange={handleChange}
              placeholder="Phone Number"
              className="flex-1 border border-gray-300 rounded-r-md shadow-sm p-3 bg-gray-50 focus:bg-white focus:border-[#0356A2] focus:ring-1 focus:ring-[#0356A2]"
              required
            />
          </div>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City*</label>
          <select
            name="city"
            value={shipperDetails.city}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md shadow-sm p-3 bg-gray-50 focus:bg-white focus:border-[#0356A2] focus:ring-1 focus:ring-[#0356A2]"
            required
          >
            <option value="">Select city</option>
            <option value="NewYork">New York</option>
            <option value="London">London</option>
          </select>
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country*</label>
          <select
            name="country"
            value={shipperDetails.country}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md shadow-sm p-3 bg-gray-50 focus:bg-white focus:border-[#0356A2] focus:ring-1 focus:ring-[#0356A2]"
            required
          >
            <option value="">Select country</option>
            <option value="USA">United States</option>
            <option value="UK">United Kingdom</option>
          </select>
        </div>
      </div>

      {/* File Upload */}
      <div className="flex flex-col sm:flex-row sm:justify-end mb-8">
        <div className="flex flex-col items-start sm:items-end">
          <button
            type="button"
            onClick={handleFileUploadClick}
            className="flex items-center border border-gray-400 bg-gray-50 px-4 py-3 rounded-lg text-sm md:text-base font-medium hover:bg-gray-100 transition duration-200 shadow-sm"
          >
            📎 Attachment File
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            className="hidden"
          />
          {selectedFile && (
            <p className="text-xs text-gray-600 mt-2 truncate max-w-[180px]">
              📄 {selectedFile.name}
            </p>
          )}
        </div>
      </div>

      {/* Important Note */}
      {!isNoteClosed && (
        <div className="bg-[#0356A2] text-white p-5 rounded-lg shadow-md mb-8">
          <div className="flex justify-between items-start">
            <p className="font-bold text-lg">IMPORTANT</p>
            <button
              type="button"
              onClick={() => setIsNoteClosed(true)}
              className="text-white text-xl ml-4 opacity-80 hover:opacity-100"
            >
              &times;
            </button>
          </div>
          <p className="text-sm mt-2 leading-relaxed">
            Please provide the National Address of the receiver consignee to ensure faster delivery of your shipment.
            Logist does not deliver to PO boxes. National address contains six components:
          </p>
          <ol className="list-decimal ml-6 mt-2 space-y-1 text-sm">
            <li>Building Number</li>
            <li>Street Name</li>
            <li>Country</li>
            <li>Additional Number</li>
          </ol>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 border-t pt-6">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto bg-[#FD6309] gap-2 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex justify-center items-center"
        >
          <FaAngleDoubleLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto bg-[#0356A2] gap-2 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex justify-center items-center"
        >
          Next <FaAngleDoubleRight className="w-4 h-4 mt-0.5" />
        </button>
      </div>
    </form>
  );
};

export default ShipperDetails;
