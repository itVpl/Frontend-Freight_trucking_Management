import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CiDeliveryTruck } from "react-icons/ci";
import { IoEarthOutline } from "react-icons/io5";
import { GiCargoShip } from "react-icons/gi";
import { FaRegUser } from "react-icons/fa";
import { PiTrolleySuitcase } from "react-icons/pi";
import { SlLink } from "react-icons/sl";
import { HiArrowLongRight } from "react-icons/hi2";

// === Premium Service Card Component ===
const ServiceCard = ({
  icon,
  title,
  description,
  isActive,
  onClick,
  index,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        type: "spring", 
        stiffness: 100, 
        damping: 20, 
        delay: index * 0.1 
      }}
      onClick={onClick}
      className={`relative group p-10 rounded-[2.5rem] cursor-pointer overflow-hidden transition-all duration-700 ${
        isActive 
          ? "bg-[#0A192F] text-white shadow-[0_20px_50px_rgba(3,86,162,0.3)] scale-[1.02] z-20" 
          : "bg-white/70 backdrop-blur-md border border-slate-200/50 text-slate-800 hover:shadow-2xl hover:-translate-y-2 z-10"
      }`}
    >
      {/* Background Decorative Gradient for Active State */}
      {isActive && (
        <motion.div 
          layoutId="highlight"
          className="absolute inset-0 bg-gradient-to-br from-[#0356A2] to-[#0A192F] -z-10"
        />
      )}

      <div className="relative z-10">
        {/* Icon Box */}
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 ${
            isActive 
              ? "bg-amber-400 text-[#0A192F] rotate-[10deg]" 
              : "bg-slate-100 text-[#0356A2] group-hover:bg-[#0356A2] group-hover:text-white"
          }`}
        >
          <span className="text-3xl">{icon}</span>
        </div>

        <h3 className={`text-2xl font-semibold tracking-tight mb-4 transition-colors ${
          isActive ? "text-amber-400" : "text-[#0A192F]"
        }`}>
          {title}
        </h3>

        <p className={`text-base leading-relaxed mb-10 transition-colors ${
          isActive ? "text-slate-300" : "text-slate-500"
        }`}>
          {description}
        </p>

        {/* Action Link */}
        <div className="flex items-center gap-4 group/btn">
          <span className={`text-sm font-bold tracking-widest uppercase transition-colors ${
            isActive ? "text-white" : "text-[#0356A2]"
          }`}>
            Explore Details
          </span>
          <div className={`transition-transform duration-300 ${isActive ? "translate-x-2" : "group-hover:translate-x-2"}`}>
            <HiArrowLongRight className={isActive ? "text-amber-400" : "text-[#0356A2]"} size={24} />
          </div>
        </div>
      </div>

      {/* Subtle Pattern Overlay */}
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <span className="text-8xl font-black">{index + 1}</span>
      </div>
    </motion.div>
  );
};

// === Service Data ===
const serviceCardsData = [
  {
    icon: <FaRegUser />,
    title: "Customs Brokerage",
    description: "Navigate global customs with elite brokerage services, ensuring compliance and rapid border clearance.",
  },
  {
    icon: <CiDeliveryTruck />,
    title: "Intelligence Warehousing",
    description: "State-of-the-art secure storage with real-time tracking for your most valuable inventory assets.",
  },
  {
    icon: <SlLink />,
    title: "Supply Chain Strategy",
    description: "High-level optimization of your logistics ecosystem for maximum efficiency and cost reduction.",
  },
  {
    icon: <IoEarthOutline />,
    title: "Cross-Border Logistics",
    description: "Seamless international transit corridors designed for time-sensitive global trade requirements.",
  },
  {
    icon: <PiTrolleySuitcase />,
    title: "White-Glove Delivery",
    description: "Premium last-mile solutions that prioritize brand experience and doorstep precision.",
  },
  {
    icon: <GiCargoShip />,
    title: "Global Project Cargo",
    description: "Specialized engineering and transport for oversized shipments requiring bespoke handling.",
  },
];

const LogixServices = () => {
  const [activeIndex, setActiveIndex] = useState(1); // Set middle as default for balance

  return (
    <section className="relative py-32 bg-[#F8FAFC] overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-8">
        
        {/* Luxury Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-[1px] w-12 bg-amber-500" />
              <span className="text-xs font-black tracking-[0.3em] text-amber-600 uppercase">Our Expertise</span>
            </motion.div>

            <h2 className="text-5xl md:text-6xl font-light text-[#0A192F] leading-[1.1]">
              Strategic Solutions for <br />
              <span className="font-serif italic text-[#0356A2]">Modern Commerce</span>
            </h2>
          </div>
          
          <p className="max-w-sm text-slate-500 text-lg font-light leading-relaxed border-l border-slate-200 pl-8">
            Experience the pinnacle of logistics orchestration with our tailored suite of global services.
          </p>
        </div>

        {/* Animated Grid */}
        <motion.div 
          layout 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          <AnimatePresence mode="popLayout">
            {serviceCardsData.map((card, index) => (
              <ServiceCard 
                key={card.title} 
                {...card} 
                index={index}
                isActive={activeIndex === index}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default LogixServices;