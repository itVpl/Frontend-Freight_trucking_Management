import React from 'react';

const steps = [
  "Shipment Type",
  "Shipper details",
  "Receiver details",
  "Payment options"
];

const StepHeader = ({ currentStep = 1 }) => {
  return (
    <div className="p-6 -mt-12 md:-mt-8 relative">
      <div className="flex justify-between items-center relative">
        {/* Background line connecting all steps */}
        <div
          className="absolute top-4 h-1 bg-gray-300 rounded-full"
          style={{
            left: `calc(100% / (${steps.length * 2}))`,  // starts from center of first circle
            right: `calc(100% / (${steps.length * 2}))`, // ends at center of last circle
          }}
        >
          {/* Filled blue progress line */}
          <div
            className="absolute top-0 left-0 h-1 bg-[#0356A2] rounded-full transition-all duration-500"
            style={{
              width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% + 2px)`, // fill dynamically
            }}
          ></div>
        </div>

        {/* Step Circles and Labels */}
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          // Step circle color logic
          const circleClasses = isCompleted
            ? 'bg-[#0356A2] text-white border-blue-500'
            : isCurrent
            ? 'bg-[#0356A2] text-white border-blue-500'
            : 'bg-gray-100 text-gray-500 border-gray-300';

          return (
            <div key={label} className="flex flex-col items-center z-10 w-1/4">
              <div
                className={`w-6 h-6 md:h-8 md:w-8 flex items-center justify-center rounded-full border-2 ${circleClasses} transition-all duration-300`}
              >
                {isCompleted || isCurrent ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="white"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">{stepNumber}</span>
                )}
              </div>

              <div
                className={`mt-2 text-sm text-center ${
                  isCurrent ? 'text-gray-900 font-semibold' : 'text-gray-600'
                }`}
              >
                {label}
                {isCurrent && <span className="ml-1">🖊️</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepHeader;
