import React, { useState, useRef } from 'react';

const OTPValidationForm = () => {
  // State to hold the 4-digit OTP
  const [otp, setOtp] = useState(['', '', '', '']);
  // Refs to manage focus on the input fields
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Handles input change and automatically moves focus to the next input
  const handleChange = (e, index) => {
    const { value } = e.target;

    // Only allow single digit input
    if (value.length > 1) return;

    // Create a new OTP array with the updated digit
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to the next input if a digit was entered and it's not the last input
    if (value && index < inputRefs.length - 1) {
      inputRefs[index + 1].current.focus();
    }
  };

  // Handles key down events (like backspace)
  const handleKeyDown = (e, index) => {
    // If backspace is pressed and the current input is empty, move focus back
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  // Placeholder for the form submission logic
  const handleSubmit = (e) => {
    e.preventDefault();
    const finalOtp = otp.join('');
    // console.log('OTP Submitted:', finalOtp);
    alert(`Verifying OTP: ${finalOtp}`);
  };

  return (
    // Outer container for the light-blue/grey background
    <div className="h-[700px] bg-gray-100 flex items-center justify-center p-4">
      {/* Centered white card container */}
      <div className="bg-white p-10 mt-12 md:mt-32 lg:mt-12 shadow-xl h-[500px] rounded-lg w-full max-w-sm text-center justify-center">
        
        {/* Header: Validate OTP */}
        <h2 className="text-2xl mt-16 md:16 lg:16 font-semibold mb-6 text-gray-800 relative inline-block">
          Validate OTP
              </h2>
               <div className="flex justify-center items-center gap-2 mb-4">
            <div className="w-14 sm:w-16 h-1 bg-orange-500 transform -skew-x-72 rounded-sm"></div>
            <div className="w-14 sm:w-16 h-1 bg-[#0356A2] transform -skew-x-72 rounded-sm"></div>
          </div>
        
        {/* Instructions */}
        <p className="text-gray-500 mb-8 text-sm">
          Please enter the OTP to verify your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input Fields Container */}
          <div className="flex justify-center space-x-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                // Tailwind classes for the input boxes (look and feel)
                className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-md shadow-inner focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition duration-150"
                // Accessibility
                aria-label={`OTP digit ${index + 1}`}
                inputMode="numeric"
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            // The button's style closely matches the image
            className="w-full bg-[#0356A2] hover:bg-white hover:text-[#0356A2] border border-[#0356A2] cursor-pointer text-white font-medium py-3 rounded-md transition duration-200 shadow-md"
          >
            Verify
          </button>
        </form>
        
        {/* Resend Link */}
        <div className="mt-6 text-sm">
          Didn't get the code? <a href="#" className="text-blue-700 hover:text-blue-800 font-medium">Resend it</a>
        </div>

      </div>
    </div>
  );
};

export default OTPValidationForm;