import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CiDeliveryTruck } from "react-icons/ci";
import { IoEarthOutline } from "react-icons/io5";
import { GiCargoShip } from "react-icons/gi";
import { FaRegUser } from "react-icons/fa";
import { PiTrolleySuitcase } from "react-icons/pi";
import { SlLink } from "react-icons/sl";
import { HiOutlineArrowUpRight } from "react-icons/hi2";

const services = [
  {
    icon: <FaRegUser />,
    title: "Customs Brokerage",
    desc: "Seamless border transitions with AI-powered compliance and expert brokerage.",
    tag: "Security"
  },
  {
    icon: <CiDeliveryTruck />,
    title: "Smart Warehousing",
    desc: "Next-gen storage solutions with real-time tracking and climate control.",
    tag: "Automated"
  },
  {
    icon: <SlLink />,
    title: "Supply Chain",
    desc: "Data-driven architecture to optimize every link in your global logistics chain.",
    tag: "Efficiency"
  },
  {
    icon: <IoEarthOutline />,
    title: "Cross-Border",
    desc: "High-speed international transit corridors for time-critical global trade.",
    tag: "Global"
  },
  {
    icon: <PiTrolleySuitcase />,
    title: "White-Glove",
    desc: "Premium last-mile delivery focused on brand experience and precision.",
    tag: "Premium"
  },
  {
    icon: <GiCargoShip />,
    title: "Project Cargo",
    desc: "Engineering-led transport for oversized machinery and complex projects.",
    tag: "Heavy-Lift"
  },
];

const PremiumServiceCard = ({ item, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group h-full"
    >
      {/* Outer Glow Effect on Hover */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[2rem] blur opacity-0 group-hover:opacity-20 transition duration-500`} />
      
      <div className="relative h-full bg-white border border-slate-200 rounded-[2rem] p-10 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
        
        {/* Animated Background Shape */}
        <div className={`absolute -right-10 -top-10 w-32 h-32 bg-slate-50 rounded-full transition-transform duration-700 group-hover:scale-[4] group-hover:bg-blue-50/50`} />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            {/* Icon Box */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all duration-500 ${
              isHovered ? "bg-blue-600 text-white shadow-lg shadow-blue-200 rotate-[10deg]" : "bg-blue-50 text-blue-600"
            }`}>
              {item.icon}
            </div>
            
            {/* Minimalist Tag */}
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-400 border border-slate-200 px-3 py-1 rounded-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
              {item.tag}
            </span>
          </div>

          <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight group-hover:text-blue-700 transition-colors">
            {item.title}
          </h3>
          
          <p className="text-slate-500 leading-relaxed font-light mb-8 group-hover:text-slate-600 transition-colors">
            {item.desc}
          </p>
        </div>

        {/* Action Link */}
        <div className="relative z-10 flex items-center gap-2 text-sm font-bold text-blue-600 cursor-pointer overflow-hidden group/btn">
          <span className="relative">
            EXPLORE DETAILS
            <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-blue-600 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left duration-300" />
          </span>
          <HiOutlineArrowUpRight className="text-lg transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-300" />
        </div>
      </div>
    </motion.div>
  );
};

const LogixServices = () => {
  return (
    <section className="relative py-32 bg-blue-100 overflow-hidden">
      {/* Soft Background Accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-50/50 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-8">
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-1 w-12 bg-blue-600 rounded-full" />
              <span className="text-xs font-black tracking-[0.3em] text-blue-600 uppercase">Our Capabilities</span>
            </motion.div>
            
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tighter">
              Orchestrating the future <br />
              <span className="text-blue-600">of global logistics.</span>
            </h2>
          </div>
          
          <p className="max-w-sm text-slate-500 text-lg font-light leading-relaxed">
            We merge industrial expertise with digital intelligence to deliver world-class supply chain solutions.
          </p>
        </div>

        {/* --- Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((item, index) => (
            <PremiumServiceCard key={index} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogixServices;