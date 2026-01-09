import React from "react";
import { motion } from "framer-motion"; // Import framer-motion
import { CiDeliveryTruck } from "react-icons/ci";
import { IoEarthOutline } from "react-icons/io5";
import { GiCargoShip } from "react-icons/gi";
import { FaRegUser } from "react-icons/fa";
import { PiTrolleySuitcase } from "react-icons/pi";
import { SlLink } from "react-icons/sl";
import { GrLinkNext } from "react-icons/gr";

// === Service Card Component ===
const ServiceCard = ({
  icon,
  title,
  description,
  bgColor,
  iconColor,
  cardStyle,
  isFeatured,
  index, // Added index for staggered animation
}) => {
  const buttonClasses = isFeatured
    ? "bg-white text-[#0356A2] hover:bg-[#0356A2] border border-white hover:text-white"
    : "bg-[#0356A2] text-white hover:bg-white hover:text-[#0356A2] border border-[#0356A2]";

  return (
    <motion.div
      // Animation logic
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`p-8 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:shadow-xl ${cardStyle}`}
    >
      <div>
        <div
          className={`w-16 h-16 rounded-lg flex items-center justify-center mb-5 ${
            isFeatured ? "bg-white" : bgColor
          }`}
        >
          <span
            className={`text-3xl ${isFeatured ? "text-blue-700" : iconColor}`}
          >
            {icon}
          </span>
        </div>

        <h3
          className={`text-xl font-semibold mb-3 ${
            isFeatured ? "text-white" : "text-[#0356A2]"
          }`}
        >
          {title}
        </h3>

        <p
          className={`text-sm leading-relaxed ${
            isFeatured ? "text-blue-200" : "text-blue-900/70"
          }`}
        >
          {description}
        </p>
      </div>

      <div className="mt-6">
        <a href="/contactus" className="w-full block text-center">
          <button
            className={`flex items-center justify-center gap-2 px-6 py-2 rounded-full font-medium transition duration-300 ${buttonClasses}`}
          >
            <span>Get a Quote</span>
            <GrLinkNext className="text-sm" />
          </button>
        </a>
      </div>
    </motion.div>
  );
};

// === Data for All Cards ===
const serviceCardsData = [
  {
    icon: <FaRegUser />,
    title: "Customs Brokerage",
    description: "Navigate customs with ease, ensuring your goods clears borders swiftly and compliantly.",
    bgColor: "bg-orange-100",
    iconColor: "text-orange-600",
    cardStyle: "bg-white border border-gray-200 shadow-sm",
  },
  {
    icon: <CiDeliveryTruck className="w-12 h-12 text-[#0356A2]" />,
    title: "Warehousing & Distribution",
    description: "Secure storage and efficient distribution solutions to keep your inventory flowing smoothly.",
    bgColor: "bg-white",
    iconColor: "text-[#0356A2]",
    cardStyle: "bg-[#0356A2] text-white shadow-xl",
    isFeatured: true,
  },
  {
    icon: <SlLink />,
    title: "Supply Chain Management",
    description: "Optimizing every step of your supply chain for streamlined, efficient, and cost-effective operations.",
    bgColor: "bg-orange-100",
    iconColor: "text-orange-600",
    cardStyle: "bg-white border text-[#0356A2] border-gray-200 shadow-sm",
  },
  {
    icon: <IoEarthOutline />,
    title: "Cross-Border Solutions",
    description: "Seamless cross-border logistics to connect your business with international markets.",
    bgColor: "bg-orange-100",
    iconColor: "text-orange-600",
    cardStyle: "bg-white border border-gray-200 shadow-sm",
  },
  {
    icon: <PiTrolleySuitcase />,
    title: "Last-Mile Delivery",
    description: "Reliable last-mile delivery that gets your projects to customers’ doorsteps with precision",
    bgColor: "bg-orange-100",
    iconColor: "text-orange-600",
    cardStyle: "bg-white border border-gray-200 shadow-sm",
  },
  {
    icon: <GiCargoShip />,
    title: "Project Cargo Handling",
    description: "Specialized handling for oversized or complex shipments, with tailored logistics solutions.",
    bgColor: "bg-orange-100",
    iconColor: "text-orange-600",
    cardStyle: "bg-white border border-gray-200 shadow-sm",
  },
  {
    icon: <IoEarthOutline />,
    title: "Drayage",
    description: "Moving containers between port and nearby warehouse.",
    bgColor: "bg-orange-100",
    iconColor: "text-orange-600",
    cardStyle: "bg-white border border-gray-200 shadow-sm",
  },
];

// === Main Section Component ===
const LogixServices = () => {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header Animation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 px-4"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-600 mb-3">
            ● <span className="text-[#0356A2]"> Our Services</span>
          </p>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-poly text-[#0356A2] leading-tight max-w-4xl mx-auto">
            Comprehensive{" "}
            <span className="text-orange-600">Logix Services</span> Tailored to
            Meet Your Unique <span className="text-orange-600">Needs</span>
          </h1>

          <p className="mt-2 max-w-4xl mx-auto text-blue-900/70 text-base sm:text-lg leading-relaxed">
            Our vision is to be the leading logistics partner, known for
            excellence in supply chain management, innovation, and customer
            satisfaction — exceeding expectations and driving success for our
            clients globally.
          </p>
        </motion.div>

        {/* Combined Grid for better responsive flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {serviceCardsData.map((card, index) => (
            <ServiceCard 
              key={index} 
              {...card} 
              index={index % 3} // Restarts stagger delay for each row
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogixServices;