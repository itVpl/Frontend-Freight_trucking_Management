import React, { useState } from "react";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaLock,
  FaGoogle,
  FaApple,
  FaFacebookF,
} from "react-icons/fa";

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e6edf3] px-4 py-10">
      <div className="bg-white mt-18 sm:mt-12 md:mt-2 lg:mt-16 rounded-3xl shadow-2xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden transition-all duration-500">
        {/* Left Section */}
        <div className="relative md:w-1/2 w-full h-64 md:h-auto">
          <img
            src="/signuppic.png"
            alt="Sign up visual"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <img
              src="/vpl_logo.png"
              alt="Logo"
              className="w-28 sm:w-32 md:w-48 bg-white p-3 sm:p-0 rounded-xl shadow-md"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 md:p-12">
          <h2 className="text-center text-3xl sm:text-4xl font-bold text-[#0356A2] mb-3">
            SIGN UP
          </h2>
         <div className="flex justify-center items-center gap-2 mb-4">
            <div className="w-14 sm:w-16 h-1 bg-orange-500 transform -skew-x-72 rounded-sm"></div>
            <div className="w-14 sm:w-16 h-1 bg-[#0356A2] transform -skew-x-72 rounded-sm"></div>
          </div>
          <p className="text-center text-gray-600 text-sm mb-6">
            Join our logistics network — smarter, faster, better.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <FaUser className="absolute left-3 top-3 text-gray-500 text-sm" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className="border-b border-gray-300 focus:border-[#0356A2] focus:outline-none pl-8 py-2 w-full text-sm"
                />
              </div>

              <div className="relative">
                <FaUser className="absolute left-3 top-3 text-gray-500 text-sm" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="border-b border-gray-300 focus:border-[#0356A2] focus:outline-none pl-8 py-2 w-full text-sm"
                />
              </div>
            </div>

            {/* Phone and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <FaPhone className="absolute left-3 top-3 text-gray-500 text-sm" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  className="border-b border-gray-300 focus:border-[#0356A2] focus:outline-none pl-8 py-2 w-full text-sm"
                />
              </div>

              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-gray-500 text-sm" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email*"
                  className="border-b border-gray-300 focus:border-[#0356A2] focus:outline-none pl-8 py-2 w-full text-sm"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-gray-500 text-sm" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password*"
                  className="border-b border-gray-300 focus:border-[#0356A2] focus:outline-none pl-8 py-2 w-full text-sm"
                />
              </div>

              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-gray-500 text-sm" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password*"
                  className="border-b border-gray-300 focus:border-[#0356A2] focus:outline-none pl-8 py-2 w-full text-sm"
                />
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="agree"
                checked={formData.agree}
                onChange={handleChange}
                className="accent-[#0356A2] cursor-pointer"
              />
              <label>I agree to the Privacy Policy</label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#0356A2] text-white py-3 rounded-xl font-semibold hover:bg-[#02417a] transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Sign Up
            </button>
          </form>

          {/* Social Icons */}
                 <div className="flex mt-6 justify-center gap-6 text-2xl">
          {[
            { icon: <FaGoogle />, hoverColor: "#EA4335" },
            { icon: <FaApple />, hoverColor: "#000000" },
            { icon: <FaFacebookF />, hoverColor: "#1877F2" },
          ].map((item, index) => (
            <div
              key={index}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 
                         cursor-pointer transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-110"
            >
              {item.icon}
            </div>
          ))}
        </div>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-700 mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-[#0356A2] font-medium hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
