import React from "react";

const ThankYou = () => {
  const trackingNumber = "885428569548";
  const expectedDelivery = "Wednesday, 30 Oct - 2025 by 4:30 pm";

  return (
    <div className=" flex" >
      <div className="bg-white h-[600px] md:h-[300px] lg:h-[300px] xl:h-[300px] rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center w-full max-w-5xl p-4">
        {/* Left Section */}
        <div className="text-left flex-1">
          <h1 className="text-2xl font-bold text-[#004080] mb-2">Thank You</h1>
          <p className="text-lg text-gray-800 mb-4">
            Your shipment was completed successfully
          </p>

          <div className="mb-4">
            <p className="text-gray-600">
              Tracking number:{" "}
              <span className="italic text-gray-700">{trackingNumber}</span>
              <button
                className="ml-2 text-blue-600 hover:text-blue-800"
                title="Copy to clipboard"
                onClick={() => navigator.clipboard.writeText(trackingNumber)}
              >
                📋
              </button>
            </p>
            <p className="text-gray-600 mt-1">
              Expected Delivery:{" "}
              <span className="text-gray-700 font-medium">
                {expectedDelivery}
              </span>
            </p>
          </div>

          <p className="text-gray-800 mb-2">
            Your shipment was completed successfully
          </p>
          <p className="text-gray-500 mb-6">
            Attach shipment labels to the top of each package.
          </p>

          <button
            onClick={() => alert("Downloading PDF...")}
            className="flex items-center border border-blue-600 text-blue-600 font-semibold py-2.5 px-5 rounded-full hover:bg-blue-50 transition duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            Download PDF
          </button>
        </div>

        {/* Right Section (Scanner Box) */}
        <div className="mt-8 md:mt-0 md:ml-10 flex justify-center">
          <div className="w-40 h-40 border border-gray-400 flex items-center justify-center text-gray-600">
            Scanner
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
