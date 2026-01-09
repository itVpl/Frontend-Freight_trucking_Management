import React, { useState, useRef } from 'react'; 
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaPaperclip } from "react-icons/fa";
import { IoCloseOutline } from "react-icons/io5";

const ReceiverDetails = ({ onNext, onBack, initialData }) => {
  const [receiverDetails, setReceiverDetails] = useState(initialData.receiverDetails || {
    name: '', email: '', postalCode: '', address: '', city: '', country: '', number: ''
  });
  
  const fileInputRef = useRef(null); 
  const [attachedFile, setAttachedFile] = useState(null);
  const [isNoteClosed, setIsNoteClosed] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReceiverDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (receiverDetails.name && receiverDetails.email && receiverDetails.postalCode && receiverDetails.address) {
      onNext({ receiverDetails, attachedFile });
    } else {
      alert("Please fill in required fields.");
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 max-w-6xl mx-auto">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".doc,.docx,.pdf,image/*" 
        className="hidden" 
      />

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name<span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            name="name" 
            placeholder="Enter Your Name" 
            value={receiverDetails.name} 
            onChange={handleChange} 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 placeholder-gray-400 
                       focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base" 
            required 
          />
        </div>
        
        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email<span className="text-red-500">*</span>
          </label>
          <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            value={receiverDetails.email} 
            onChange={handleChange} 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 placeholder-gray-400 
                       focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base" 
            required 
          />
        </div>
        
        {/* Postal Code + Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Postal Code & Full Address<span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col sm:flex-row mt-1 sm:space-x-3 space-y-3 sm:space-y-0">
            <input 
              type="text" 
              name="postalCode" 
              placeholder="Postal Code" 
              value={receiverDetails.postalCode} 
              onChange={handleChange} 
              className="sm:w-1/3 w-full border border-gray-300 rounded-md shadow-sm p-3 bg-gray-50 placeholder-gray-500 
                         focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base" 
              required
            />
            <input 
              type="text" 
              name="address" 
              placeholder="Enter your full street address" 
              value={receiverDetails.address} 
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-md shadow-sm p-3 placeholder-gray-400 
                         focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base" 
              required
            />
          </div>
        </div>
        
        {/* Number Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Number<span className="text-red-500">*</span>
          </label>
          <div className="flex mt-1">
            <span className="inline-flex items-center px-3 text-sm text-gray-800 bg-gray-100 border border-gray-300 rounded-l-md">
              <span className="mr-1">🇮🇳</span> +91
            </span>
            <input 
              type="text" 
              name="number" 
              placeholder="Phone Num.." 
              value={receiverDetails.number} 
              onChange={handleChange} 
              className="flex-1 border border-gray-300 rounded-r-md shadow-sm p-3 placeholder-gray-400 
                         focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base" 
              required
            />
          </div>
        </div>
        
        {/* City Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            City<span className="text-red-500">*</span>
          </label>
          <select 
            name="city" 
            value={receiverDetails.city} 
            onChange={handleChange} 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 bg-white 
                       focus:ring-blue-500 focus:border-blue-500 text-gray-600 text-sm sm:text-base" 
            required
          >
            <option value="">Select the city..</option>
            <option value="Riyadh">Riyadh</option>
            <option value="Jeddah">Jeddah</option>
            <option value="Dammam">Dammam</option>
            <option value="Makkah">Makkah</option>
          </select>
        </div>
        
        {/* Country Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Country<span className="text-red-500">*</span>
          </label>
          <select 
            name="country" 
            value={receiverDetails.country} 
            onChange={handleChange} 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 bg-white 
                       focus:ring-blue-500 focus:border-blue-500 text-gray-600 text-sm sm:text-base" 
            required
          >
            <option value="">Select the country..</option>
            <option value="Saudi Arabia">Saudi Arabia</option>
            <option value="United Arab Emirates">United Arab Emirates</option>
            <option value="India">India</option>
            <option value="United States">United States</option>
          </select>
        </div>
      </div>

      {/* Attachment File Button */}
      <div className="flex justify-center sm:justify-end mt-8">
        <button 
          type="button" 
          onClick={handleAttachmentClick} 
          className="flex items-center justify-center text-gray-700 border border-gray-300 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg 
                     text-sm sm:text-base font-medium shadow-sm bg-white hover:bg-gray-50 transition duration-150 w-full sm:w-auto"
        >
          <FaPaperclip className='w-4 h-4 mr-2' /> 
          {attachedFile ? attachedFile.name : 'Attachment File'} 
        </button>
      </div>

      {/* IMPORTANT Note Block */}
      {!isNoteClosed && (
        <div className="bg-[#214278] text-white p-4 rounded-lg w-full relative mt-6">
          <button 
            type="button" 
            onClick={() => setIsNoteClosed(true)}
            className="absolute top-2 right-2 text-white opacity-80 hover:opacity-100"
          >
            <IoCloseOutline className='w-6 h-6'/>
          </button>
          <p className="font-bold mb-1 text-sm sm:text-base">IMPORTANT</p>
          <p className="text-xs sm:text-sm leading-relaxed">
            Please provide the <strong>National Address</strong> of the receiver consignee to ensure faster delivery of your shipment. 
            Logist do not deliver to PO boxes. National address contains six components:
          </p>
          <ol className="list-decimal ml-5 mt-2 space-y-1 text-xs sm:text-sm">
            <li>Building Number</li>
            <li>Street Name</li>
            <li>Country</li>
            <li>Additional Number</li>
          </ol>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-10 space-y-4 sm:space-y-0">
        <button 
          type="button" 
          onClick={onBack}           
          className="w-full sm:w-auto bg-[#FD6309] text-white font-semibold py-3 px-8 rounded-xl shadow-lg 
                     hover:bg-blue-700 transition duration-300 flex items-center justify-center text-base sm:text-lg"
        >
          <FaAngleDoubleLeft className='w-4 h-4 mr-2'/> Back
        </button>
        
        <button
          type="submit"
          className="w-full sm:w-auto bg-[#0356A2] text-white font-semibold py-3 px-8 rounded-xl shadow-lg 
                     hover:bg-blue-700 transition duration-300 flex items-center justify-center text-base sm:text-lg"
        >
          Next <FaAngleDoubleRight className='w-4 h-4 ml-2'/>
        </button>
      </div>
    </form>
  );
};

export default ReceiverDetails;
