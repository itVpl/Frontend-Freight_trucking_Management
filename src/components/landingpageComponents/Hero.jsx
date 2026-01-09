import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion"; // Install kr lena: npm install framer-motion
import { FaTruck, FaPlane, FaGift, FaPlay } from "react-icons/fa";
import { GiDeliveryDrone, GiCargoShip } from "react-icons/gi";
import { FaTrainSubway } from "react-icons/fa6";

const banners = ["/banner1.png", "/ban.jpg", "/ban2.png"];

const Hero = () => {
  const [current, setCurrent] = useState(0);
  const clients = Array(4).fill("/heroimg.jpg");
  const [activeTab, setActiveTab] = useState("tracking");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const freightServices = [
    { icon: FaTruck, label: "Road Freight" },
    { icon: FaPlane, label: "Air Freight" },
    { icon: GiCargoShip, label: "Ocean Freight" },
    { icon: FaTrainSubway, label: "Train Freight" },
    { icon: GiDeliveryDrone, label: "Drone Freight" },
    { icon: FaGift, label: "Send Gift" },
  ];

  // Animation Variant for repeating effect
  const fadeInUp = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.1 },
    transition: { duration: 0.8 }
  };

  return (
    <div className="border-b-[4px] border-b-orange-500 ">
      {/* HERO SECTION */}
      <section className="relative w-full h-screen overflow-hidden mt-14 md:mt-14 lg:mt-14 xl:mt-24">
        <div className="absolute inset-0 z-0 transition-all duration-700">
          <img
            src={banners[current]}
            alt="Banner"
            className="w-full h-[60%] md:h-[80%] object-cover"
          />
        </div>

        {/* Tracking Box */}
        {/* <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="absolute bottom-76 h-40 md:bottom-64 lg:md:bottom-86 xl:md:bottom-64 left-3 sm:left-6 md:left-8 lg:left-8 xl:left-16 z-20 w-[85%] sm:w-auto"
        >
          <div className="rounded-lg shadow-lg p-0 w-full sm:w-[360px] overflow-hidden">
            <div className="flex">
              <button
                onClick={() => setActiveTab("tracking")}
                className={`px-4 py-2 text-xs font-semibold tracking-wider ${
                  activeTab === "tracking"
                    ? "bg-[#1E4E93] text-white border border-gray-300 rounded-tl-lg"
                    : "bg-[#E6E8EF] text-[#1E4E93]"
                }`}
              >
                TRACKING
              </button>
              <button
                onClick={() => setActiveTab("rate")}
                className={`px-4 py-2 text-xs rounded-tr-lg font-semibold tracking-wider ${
                  activeTab === "rate"
                    ? "bg-[#1E4E93] text-white border border-gray-300 rounded-tr-lg"
                    : "bg-[#E6E8EF] text-[#1E4E93]"
                }`}
              >
                RATE & SHIP
              </button>
            </div>

            <div className="bg-[#1E4E93] p-4 flex flex-col items-center sm:items-start">
              <div className="flex flex-col sm:flex-row sm:space-x-2 w-full">
                <input
                  type="text"
                  placeholder="TRACKING ID"
                  className="flex-1 px-4 py-2 rounded-md bg-[#2456A4] text-gray-200 placeholder-gray-400 outline-none border border-gray-300 text-xs uppercase tracking-widest"
                />
                <button className="px-6 py-2 bg-white text-[#1E4E93] font-semibold rounded-md hover:bg-gray-100 text-xs tracking-widest">
                  TRACK
                </button>
              </div>

              <p className="text-[11px] text-gray-200 mt-2 text-center sm:text-left">
                See the tracking id on shipping document.{" "}
                <span className="text-[#F1604D] cursor-pointer hover:underline">
                  Help
                </span>
              </p>
            </div>
          </div>
        </motion.div> */}

        {/* FREIGHT ICON SECTION */}
        <div className="hidden md:block absolute bottom-96 md:bottom-32 lg:bottom-40 xl:bottom-24 left-1/2 -translate-x-1/2 w-[95%] md:w-[85%] z-30">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-2">
            {freightServices.map(({ icon: Icon, label }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white rounded-xl shadow-lg flex flex-col items-center justify-center py-6 px-4 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
              >
                <div className="p-4 flex items-center justify-center transition-all duration-300">
                  <Icon
                    size={60}
                    className="text-[#0B407A] transition-all duration-300"
                  />
                </div>
                <p className="font-semibold text-gray-800 mt-4 text-center text-sm sm:text-base">
                  {label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT SECTION */}
      <div className="flex items-center justify-center font-['Inter']">
        <div className="max-w-8xl w-full bg-white rounded-2xl">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 p-6 sm:p-12">
            {/* LEFT SIDE */}
            <div className="relative flex flex-col items-center h-auto lg:h-[500px] p-4 sm:p-6 md:p-8 lg:p-10 lg:col-span-2 overflow-visible">
              
              <div className="absolute hidden lg:block inset-0 bg-[#1F4E79] z-0 overflow-hidden rounded-l-3xl rounded-tl-[100px] w-[350px] h-[450px] transform translate-x-15 -translate-y-20 scale-110 shadow-inner"></div>
              <div className="absolute hidden lg:block bg-[#1F4E79] z-0 overflow-hidden h-[200px] w-[200px] top-0 right-0 transform -translate-x-16 -translate-y-28 shadow-inner"></div>

              <motion.div 
                initial={{ opacity: 0, x: -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8 }}
                className="relative group z-10 w-full -mt-36 max-w-[450px] h-[350px] sm:h-[420px] md:h-[480px] lg:h-[500px] rounded-tl-[100px] shadow-2xl"
              >
                <img
                  src="/heroimg.jpg"
                  alt="Logistics"
                  className="w-full h-full object-cover rounded-tl-[80px] rounded-bl-2xl transition-all duration-500 group-hover:opacity-100"
                />

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="bg-[#FD6309] p-6 sm:p-8 rounded-full shadow-2xl cursor-pointer hover:scale-110 transition-transform duration-300">
                    <FaPlay className="text-white text-3xl sm:text-4xl ml-1" />
                  </div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.3 }}
                  className="absolute top-[25%] left-[-30px] sm:left-[-70px] md:left-[-50px] bg-white p-3 sm:p-4 rounded-tl-[50px] rounded-bl-xl shadow-xl border-l-4 border-[#1F4E79] w-[120px] sm:w-[130px] md:w-32 text-center z-20"
                >
                  <p className="text-xl sm:text-2xl font-bold text-blue-900">50K+</p>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">Satisfied Clients</p>
                  <div className="flex justify-center -space-x-2">
                    {clients.map((src, index) => (
                      <img key={index} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white object-cover" src={src} alt="profile" />
                    ))}
                  </div>
                </motion.div>

                <motion.div 
                   initial={{ opacity: 0, scale: 0 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   viewport={{ once: false }}
                   transition={{ delay: 0.5 }}
                   className="absolute bottom-[25%] right-[-30px] sm:right-[-70px] md:right-[-50px] bg-white p-4 sm:p-5 rounded-tl-[50px] rounded-bl-xl shadow-2xl border-l-4 border-[#1F4E79] w-[120px] sm:w-[130px] md:w-32 text-center z-20"
                >
                  <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black">25</p>
                  <p className="text-xs sm:text-sm font-semibold text-black">Years of Experience</p>
                </motion.div>
              </motion.div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex flex-col justify-center mb-12 lg:col-span-3">
              <motion.h3 {...fadeInUp} className="text-3xl font-bold text-[#1F4E79] mb-8">
                Welcome To V Power Logistics
              </motion.h3>

              <motion.h1 {...fadeInUp} transition={{delay: 0.2}} className="text-4xl sm:text-4xl font-extrabold text-gray-800 leading-tight mb-4">
                Your Trust 3PL Partner Efficient, Reliable, And Scalable Logistics Solutions
              </motion.h1>

              <motion.p {...fadeInUp} transition={{delay: 0.4}} className="text-gray-600 text-lg mb-32">
                At V Power Logistics, we specialize in providing comprehensive
                third-party logistics (3PL) services tailored to meet the
                unique needs of businesses across various industries.
              </motion.p>

              <motion.div {...fadeInUp} transition={{delay: 0.6}}>
                <button className="flex items-center -mt-10 group transition duration-300">
                  <span className="bg-white text-black border-2 border-[#1F4E79] hover:border-[#FD6309] px-6 py-3 text-lg font-medium group-hover:bg-blue-50">
                    Explore More
                  </span>
                  <span className="bg-[#1F4E79] p-3 group-hover:bg-[#FD6309]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
};

export default Hero;