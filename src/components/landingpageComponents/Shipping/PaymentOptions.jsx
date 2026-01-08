import React, { useState } from 'react';
import { MapPin, Edit } from 'lucide-react';
import { HiOutlineBanknotes } from "react-icons/hi2";
import { GoCreditCard } from "react-icons/go";
import { FaAngleDoubleRight, FaAngleDoubleLeft } from "react-icons/fa";

const initialCostSummary = {
  volumetricWeight: '0.5',
  expressTime: '11:00, Wed, 14 Oct, 2025 12:00',
  transportationCharges: 300.00,
  premium1200: 100.00,
  fuelSurcharge: 32.00,
  shipmentProtection: 12.00,
  total: 550.00, // BDT
};

const initialShipperInfo = {
  name: 'Mr Robinson',
  address: '2972 Westheimer Rd. Santa Ana, Illinois 85486.',
  phone: '(480) 555-0103',
  email: 'sara.cruz@example.com'
};
const initialReceiverInfo = { ...initialShipperInfo };

// 💳 Payment Option Card
const PaymentCard = ({ type, icon: IconComponent, isSelected, onClick }) => (
  <div
    className={`w-full sm:w-40 p-6 sm:p-10 border-2 rounded-xl cursor-pointer transition duration-300 flex flex-col items-center justify-center
      ${isSelected
        ? 'border-blue-500 bg-blue-50 shadow-lg'
        : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
      }`}
    onClick={() => onClick(type)}
  >
    <IconComponent className="w-10 h-10 sm:w-12 sm:h-12 text-gray-700" />
    <p className="text-center mt-3 font-semibold text-gray-700 text-base sm:text-lg">{type}</p>
  </div>
);

// 📦 Address Display Box
const AddressBox = ({ title, info, showEdit }) => (
  <div className="p-4 sm:p-5 border rounded-xl bg-white shadow-md hover:shadow-lg transition">
    <div className="flex items-center justify-between text-gray-600 mb-2">
      <div className="flex items-center">
        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500" />
        <span className="font-semibold text-sm sm:text-base">{title}</span>
      </div>
      {showEdit && (
        <button className="flex items-center text-blue-500 hover:text-blue-600 text-xs sm:text-sm font-medium">
          <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          Edit
        </button>
      )}
    </div>
    <p className="font-bold text-gray-800 text-sm sm:text-base">{info.name}</p>
    <p className="text-xs sm:text-sm text-gray-600">{info.address}</p>
    <p className="text-xs sm:text-sm text-gray-600">{info.phone}</p>
    <p className="text-xs sm:text-sm text-gray-600">{info.email}</p>
  </div>
);

const formatAmount = (amount) => amount.toFixed(2);

const CurrencyRow = ({ label, value, isTotal = false }) => (
  <div className={`flex text-xs sm:text-sm text-gray-700 ${isTotal ? 'text-base font-bold border-t border-gray-200 mt-4 pt-4 text-gray-800' : ''}`}>
    <span className="w-1/2">{label}</span>
    <span className={`w-1/6 ${isTotal ? 'text-lg' : 'text-sm'} text-center font-semibold`}>BDT</span>
    <span className="w-1/3 text-right font-medium">{formatAmount(value)}</span>
  </div>
);

// 🧾 Main Component
const PaymentOptions = ({ onNext, onBack, initialData }) => {
  const [paymentOption, setPaymentOption] = useState(initialData?.paymentOption || 'Card');

  const costSummary = initialCostSummary;
  const shipperInfo = initialShipperInfo;
  const receiverInfo = initialReceiverInfo;

  const handleSubmit = () => {
    const dataForNextStep = { paymentOption, costSummary };
    onNext(dataForNextStep);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8  h-full lg:h-[900px] xl:h-full">
      <h2 className="text-xl sm:text-2xl font-bold mb-8 text-gray-800 text-center sm:text-left">Parcel Details</h2>

      {/* Payment Options */}
      <div className="flex flex-col sm:flex-row sm:space-x-8 space-y-4 sm:space-y-0 justify-center sm:justify-start mb-10">
        <PaymentCard
          type="Cash"
          icon={HiOutlineBanknotes}
          isSelected={paymentOption === 'Cash'}
          onClick={setPaymentOption}
        />
        <PaymentCard
          type="Card"
          icon={GoCreditCard}
          isSelected={paymentOption === 'Card'}
          onClick={setPaymentOption}
        />
      </div>

      {/* Shipper & Receiver Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <AddressBox title="From Shipper" info={shipperInfo} />
        <AddressBox title="To Receiver" info={receiverInfo} showEdit={true} />
      </div>

      {/* Shipment Cost Summary */}
      <div className="bg-white p-5 sm:p-6 border rounded-xl shadow-md hover:shadow-lg transition">
        <h3 className="text-lg sm:text-xl font-bold mb-4 border-b pb-2 text-gray-800">
          Shipment Cost Summary
        </h3>

        <div className="flex flex-col md:flex-row">
          {/* Left Column */}
          <div className="md:w-1/3 pr-0 md:pr-6 border-b md:border-b-0 md:border-r border-gray-100 mb-4 md:mb-0">
            <div className="space-y-1">
              <p className="text-base sm:text-lg text-gray-600">Express 11:00</p>
              <p className="text-xs text-gray-500 mb-3">Wed, 14 Oct, 2025 12:00</p>
            </div>
            <div className="space-y-1">
              <p className="text-base sm:text-lg text-gray-600">Volumetric weight</p>
              <p className="text-xs text-gray-800">Total weight: {costSummary.volumetricWeight}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:w-2/3 pl-0 md:pl-6">
            <div className="space-y-2">
              <CurrencyRow label="Transportation Charges:" value={costSummary.transportationCharges} />
              <CurrencyRow label="12:00 Premium:" value={costSummary.premium1200} />
              <CurrencyRow label="Fuel Surcharge:" value={costSummary.fuelSurcharge} />
              <CurrencyRow label="Shipment Protection:" value={costSummary.shipmentProtection} />
              <CurrencyRow
                label="Total (VAT included if applicable)"
                value={costSummary.total}
                isTotal={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-10">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 w-full sm:w-auto justify-center bg-[#FD6309] text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          <FaAngleDoubleLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={handleSubmit}
          className="flex items-center justify-center gap-2 w-full sm:w-72 bg-[#0356A2] text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:bg-blue-700 transition duration-300"
        >
          Accept & Continue
          <FaAngleDoubleRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PaymentOptions;
