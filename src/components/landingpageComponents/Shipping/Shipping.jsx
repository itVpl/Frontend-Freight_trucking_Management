import React, { useState } from 'react';
import { Truck, Check } from 'lucide-react';
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { GiCargoShip } from "react-icons/gi";
import { IoAirplaneOutline } from "react-icons/io5";



const Shipping = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  // const handleNext = () => {
  //   if (selectedOption) {
  //     alert(`Proceeding with: ${selectedOption === 'domestic' ? 'Domestic Shipping' : 'International Shipping'}`);
  //   } else {
  //     alert('Please select a shipping option before proceeding.');
  //   }
  // };

  const handleBack = () => {
    setSelectedOption(null);
  };

  const ShippingCard = ({ type, title, isSelected, onClickCheckbox }) => (
    <div
      className={`
        relative flex flex-col items-start justify-start
        p-6 sm:p-5 border-2 rounded-2xl
        transition duration-300 ease-in-out w-full max-w-xs sm:max-w-sm h-48 sm:h-40
        ${isSelected 
          ? 'border-[#0356A2] shadow-xl bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400 bg-white'
        }
      `}
    >
      {/* Checkbox */}
      <div 
        className={`absolute top-4 right-4 w-5 h-5 sm:w-6 sm:h-6 border rounded-md cursor-pointer
          ${isSelected ? 'bg-[#0356A2] border-[#0356A2]' : 'bg-gray-200 border-gray-400'}
        `}
        onClick={onClickCheckbox}
      >
        {isSelected && (
          <Check className="w-full h-full text-white p-0.5" strokeWidth={3} />
        )}
      </div>

      {/* Icon Section */}
      <div className="flex items-center text-gray-500 mb-4 sm:mb-6 h-14 sm:h-16">
        {type === 'domestic' ? (
          <Truck className={`w-14 h-14 sm:w-16 sm:h-16 ${isSelected ? 'text-[#0356A2]' : 'text-gray-500'}`} />
        ) : (
          <div className="flex items-center">
            <GiCargoShip className={`w-12 h-12 sm:w-14 sm:h-14 ${isSelected ? 'text-[#0356A2]' : 'text-gray-500'}`} />
            <IoAirplaneOutline className={`w-12 h-12 sm:w-14 sm:h-14 ml-2 ${isSelected ? 'text-[#0356A2]' : 'text-gray-500'}`} />
          </div>
        )}
      </div>

      {/* Title */}
      <p className="text-base sm:text-lg font-semibold text-gray-700 mt-auto">{title}</p>
    </div>
  );

  return (
    <div className="lg:h-[900px] xl:h-[650px] flex items-center justify-center bg-gray-100 p-4 sm:p-6 md:p-10">
      <div className="bg-white p-6 sm:p-8 md:p-12 rounded-2xl shadow-2xl max-w-5xl w-full mt-18 sm:mt-12 md:mt-2 lg:mt-16">
        
        {/* Header */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Where To ?
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-8">
            Send your shipment at ease through the following step
          </p>
        </div>
        
        {/* Shipping Options */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-6 sm:gap-8 mb-10">
          <ShippingCard
            type="domestic"
            title="A Domestic Shipping"
            isSelected={selectedOption === 'domestic'}
            onClickCheckbox={() => setSelectedOption(selectedOption === 'domestic' ? null : 'domestic')}
          />
          
          <ShippingCard
            type="international"
            title="An International Shipping"
            isSelected={selectedOption === 'international'}
            onClickCheckbox={() => setSelectedOption(selectedOption === 'international' ? null : 'international')}
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          {/* Back Button */}
          {selectedOption && (
            <button
              onClick={handleBack}
              className="
                flex items-center justify-center gap-2
                px-6 py-3 text-base sm:text-lg font-semibold text-white rounded-lg 
                transition duration-300 ease-in-out
                bg-[#FD6309] hover:bg-[#024986] shadow-md w-full sm:w-auto
              "
            >
              <FaAngleDoubleLeft className="w-4 h-4" />
              Back
            </button>
          )}
          
          {/* Next Button */}
          <a href="/ShipmentForm" className="w-full sm:w-auto">
            <button
              className={`
                flex items-center justify-center gap-2
                px-8 py-3 text-base sm:text-lg font-semibold text-white rounded-lg 
                transition duration-300 ease-in-out w-full sm:w-auto
                ${selectedOption 
                  ? 'bg-[#0356A2] hover:bg-[#024986] shadow-md' 
                  : 'bg-[#9BBBD9] cursor-not-allowed'}
              `}
              disabled={!selectedOption}
            >
              Next <FaAngleDoubleRight className="w-4 h-4 mt-0.5" />
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
