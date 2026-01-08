import React from "react";
import { FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform form validation or API call here if needed
    navigate("/otpvalidation"); // Navigate to OTP page
  };

  return (
    <div className="min-h-screen bg-[#e6edf3] flex items-center justify-center px-4 sm:px-6 md:px-8 py-8">
      <div className="bg-white mt-18 sm:mt-12 md:mt-2 lg:mt-16 rounded-2xl shadow-2xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden">
        {/* Left Section - Image */}
        <div className="md:w-1/2 relative h-64 md:h-auto">
          <img
            src="/forgetpic.png"
            alt="Ship"
            className="object-cover w-full h-full md:rounded-l-2xl rounded-t-2xl"
          />
          <div className="absolute inset-0 bg-black/30 md:rounded-l-2xl rounded-t-2xl"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <img
              src="/vpl_logo.png"
              alt="Logo"
              className="w-28 sm:w-32 md:w-48 bg-white p-3 sm:p-0 rounded-xl shadow-md"
            />
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="md:w-1/2 flex flex-col justify-center px-6 sm:px-10 py-10 sm:py-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-[#0356A2] mb-2">
            Forgot Password
          </h2>

          {/* Colored Lines */}
          <div className="flex justify-center items-center gap-2 mb-4 sm:mb-6">
            <div className="w-12 sm:w-16 h-1 bg-orange-500 transform -skew-x-72 rounded-sm"></div>
            <div className="w-12 sm:w-16 h-1 bg-[#0356A2] transform -skew-x-72 rounded-sm"></div>
          </div>

          <p className="text-center text-sm sm:text-base text-gray-600 mb-8">
            Fill your e-mail address below and we will send you a link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <div className="flex items-center border-b border-gray-300 py-2">
                <FaEnvelope className="text-gray-500 mr-2 text-lg sm:text-xl" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="w-full outline-none text-gray-700 text-sm sm:text-base bg-transparent placeholder-gray-400"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#004a99] text-white py-3 sm:py-3.5 rounded-md font-semibold text-sm sm:text-base hover:bg-[#003b7a] transition duration-300 shadow-md hover:shadow-lg"
            >
              Forgot Password
            </button>

            {/* Login Link */}
            <p className="text-center text-sm sm:text-base text-gray-700 mt-6">
              Already have an account?{" "}
              <a href="/login">
                <span className="text-blue-700 cursor-pointer font-medium hover:underline">
                  Login
                </span>
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
