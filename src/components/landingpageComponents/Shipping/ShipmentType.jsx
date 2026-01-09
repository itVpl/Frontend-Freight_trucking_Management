import React, { useState } from 'react';
import { IoAirplaneOutline } from "react-icons/io5";
import { GiCargoShip } from "react-icons/gi";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

const CheckIcon = () => (
  <div className="absolute top-2 right-2 bg-white rounded-full p-0.5 shadow-md">
    <svg
      className="w-4 h-4 text-black"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  </div>
);

const SelectionCard = ({ type, icon: Icon, isSelected, onClick }) => {
  const cardClasses = isSelected
    ? 'bg-[#0356A2] text-white shadow-2xl scale-105'
    : 'bg-gray-100 text-gray-900 hover:bg-gray-200 hover:scale-105 transition-all duration-300';

  return (
    <div
      className={`
        w-36 h-36 sm:w-40 sm:h-40 md:w-42 md:h-42 lg:w-42 lg:h-42 xl:w-42 xl:h-42 
        flex flex-col justify-center items-center rounded-2xl cursor-pointer 
        relative ${cardClasses} transition duration-300 ease-in-out
      `}
      onClick={onClick}
    >
      {isSelected && <CheckIcon />}

      <div className="flex justify-center items-center h-24 sm:h-28 md:h-32">
        <Icon
          className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 ${
            isSelected ? 'text-white' : 'text-gray-900'
          }`}
        />
      </div>

      <p
        className={`text-center font-semibold text-sm sm:text-base md:text-lg ${
          isSelected ? 'text-white' : 'text-gray-900'
        }`}
      >
        {type}
      </p>
    </div>
  );
};

const ShipmentType = ({ onNext, onBack }) => {
  const [shipmentType, setShipmentType] = useState('Air Shipment');

  const handleSubmit = () => {
    if (onNext) onNext({ shipmentType });
  };

  const handleBack = () => {
    if (onBack) onBack();
  };

  return (
    <div className="bg-white p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 h-[500px] md:h-[400px] flex items-center justify-center">
      <div className="w-full max-w-5xl">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-8 text-center md:text-left">
          Shipment Type
        </h2>

        {/* Selection Cards */}
        <div
          className="
            flex flex-col sm:flex-row justify-center items-center 
            sm:space-x-8 space-y-6 sm:space-y-0
          "
        >
          <SelectionCard
            type="Air Shipment"
            icon={IoAirplaneOutline}
            isSelected={shipmentType === 'Air Shipment'}
            onClick={() => setShipmentType('Air Shipment')}
          />
          <SelectionCard
            type="Ocean/Sea"
            icon={GiCargoShip}
            isSelected={shipmentType === 'Ocean/Sea'}
            onClick={() => setShipmentType('Ocean/Sea')}
          />
        </div>

        {/* Navigation Buttons */}
        <div
          className="
            flex flex-col sm:flex-row justify-between items-center 
            mt-10 gap-4 sm:gap-0
          "
        >
          <button
            className="bg-[#FD6309] text-white font-semibold py-3 px-10 rounded-xl 
                       hover:bg-[#1E40AF] transition duration-300 gap-2
                       shadow-lg shadow-blue-500/40 flex items-center text-base sm:text-lg w-full sm:w-auto justify-center"
            onClick={handleBack}
          >
            <FaAngleDoubleLeft className="mr-2" /> Back
          </button>

          <button
            onClick={handleSubmit}
            className="bg-[#0356A2] text-white font-semibold py-3 px-10 rounded-xl 
                       hover:bg-[#1E40AF] transition duration-300 gap-2
                       shadow-lg shadow-blue-500/40 flex items-center text-base sm:text-lg w-full sm:w-auto justify-center"
          >
            Next <FaAngleDoubleRight className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipmentType;
