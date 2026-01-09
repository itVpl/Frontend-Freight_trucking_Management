import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Import Framer Motion

export default function TransportSection() {
  const tabs = [
    {
      id: "surface",
      label: "Surface Transport",
      image: "/aboutimg1.jpg",
      description1: "Our vision is to become a trusted global leader...",
      description2: "We provide end-to-end shipping solutions...",
    },
    {
      id: "air",
      label: "Air Freight",
      image: "/aboutimg2.jpg",
      description1: "Our vision is to become a trusted leader in air logistics...",
      description2: "We specialize in delivering air freight solutions...",
    },
    {
      id: "sea",
      label: "Sea Shipment",
      image: "/aboutimg3.jpg",
      description1: "Our vision is to transform sea logistics...",
      description2: "We offer comprehensive sea freight solutions...",
    },
  ];

  const [activeTab, setActiveTab] = useState("surface");
  const activeData = tabs.find((tab) => tab.id === activeTab);

  const services = [
    "Warehousing", "Freight forwarding", "People Transport solutions",
    "Customs clearance", "Cargo solutions", "Storage", "Transportation",
  ];

  return (
    <div className="w-full bg-white py-10 px-4 md:px-12 lg:px-24 overflow-hidden">
      {/* Tabs Animation */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="flex flex-wrap gap-1 border-b border-gray-200 mb-8"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm md:text-base font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-[#063567] text-white rounded-t-md"
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Content Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        
        {/* Left Side: Text and Services */}
        <motion.div 
          key={activeTab + "text"} // Key ensures animation re-runs when tab changes
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5 }}
          className="lg:w-2/3"
        >
          <h2 className="text-[#063567] text-xl font-semibold mb-3">Our Vision</h2>
          <p className="text-gray-500 mb-6 leading-relaxed">{activeData.description1}</p>

          <h3 className="text-[#063567] text-lg font-semibold mb-3">
            Shipping Transshipments & Maintenance
          </h3>
          <p className="text-gray-500 leading-relaxed mb-8">{activeData.description2}</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 text-[#063567] font-medium">
            {services.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: false }}
                className="flex items-center gap-2"
              >
                <span className="text-orange-500 font-bold">➤</span>
                <span>{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side: Image */}
        <motion.div 
          key={activeTab + "image"}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5 }}
          className="lg:w-1/3 flex justify-center"
        >
          <img
            src={activeData.image}
            alt={activeData.label}
            className="w-full max-w-sm object-contain"
          />
        </motion.div>
      </div>
    </div>
  );
}