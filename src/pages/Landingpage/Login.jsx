import React, { useState } from "react";
import {
  FaUser,
  FaLock,
  FaGoogle,
  FaApple,
  FaFacebookF,
} from "react-icons/fa";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom"; // ✅ Added for navigation

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // ✅ Initialize navigation

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Example: here you can add actual login API call
    // For now, it simply redirects after form submit
    setTimeout(() => {
      navigate("/scheduleademo");
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e6edf3] px-4 sm:px-6 lg:px-8">
      <div className="bg-white mt-18 sm:mt-12 md:mt-2 lg:mt-16 mb-18 sm:mb-12 md:mb-2 lg:mb-2 h-full md:h-[600px] lg:h-[600px] rounded-2xl shadow-2xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden transition-all duration-300">
        {/* Left Section - Image */}
        <div className="md:w-1/2 relative">
          <img
            src="/loginpic.png"
            alt="Login Visual"
            className="object-cover w-full h-[220px] sm:h-[300px] md:h-full md:rounded-none rounded-t-2xl"
          />
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/vpl_logo.png"
              alt="Logo"
              className="w-28 sm:w-32 md:w-48 bg-white p-3 sm:p-0 rounded-xl shadow-md"
            />
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="md:w-1/2 flex flex-col justify-center px-6 sm:px-10 py-8 md:py-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-[#0356A2] mb-2">
            LOGIN
          </h2>

          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="w-14 sm:w-16 h-1 bg-orange-500 transform -skew-x-72 rounded-sm"></div>
            <div className="w-14 sm:w-16 h-1 bg-[#0356A2] transform -skew-x-72 rounded-sm"></div>
          </div>

          <p className="text-center text-sm sm:text-base text-gray-600 mb-8">
            Being well work is my logistic company
          </p>

          {/* ✅ Form with submit handler */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <div className="flex items-center border-b border-gray-300 py-2 focus-within:border-[#0356A2] transition">
                <FaUser className="text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full outline-none text-gray-700 placeholder-gray-500 bg-transparent"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center border-b border-gray-300 py-2 focus-within:border-[#0356A2] transition">
                <FaLock className="text-gray-500 mr-2" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full outline-none text-gray-700 placeholder-gray-500 bg-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-[#0356A2] transition"
                >
                  {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex flex-wrap items-center justify-between text-sm sm:text-base gap-2">
              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" className="accent-[#0356A2]" />
                Remember me
              </label>
              <a
                href="/forgetpassword"
                className="text-[#0356A2] hover:underline font-medium"
              >
                Forget Password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-[#004a99] hover:bg-[#003b7a] text-white py-3 rounded-md font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Login
            </button>

            {/* Divider */}
            <div className="flex items-center justify-center gap-4 my-2">
              <hr className="border-t-2 border-orange-500 w-1/4 sm:w-1/3" />
              <span className="text-gray-500 text-sm sm:text-sm">
                or continue with
              </span>
              <hr className="border-t-2 border-orange-500 w-1/4 sm:w-1/3" />
            </div>

            {/* Social Icons */}
            <div className="flex justify-center gap-6 text-2xl">
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

            {/* Signup Link */}
            <p className="text-center text-sm sm:text-base text-gray-600 mt-6">
              Don’t have an account?{" "}
              <a
                href="/signup"
                className="text-[#0356A2] font-semibold hover:underline"
              >
                Sign Up
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
