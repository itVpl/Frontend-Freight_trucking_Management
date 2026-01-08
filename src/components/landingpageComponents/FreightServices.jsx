import React, { useState, useEffect, useRef, useMemo } from "react";
import { FaTruck, FaPlane, FaGift } from "react-icons/fa";
import { GiDeliveryDrone, GiCargoShip } from "react-icons/gi";
import { FaTrainSubway, FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { motion } from "framer-motion";

export default function FreightServices() {
  const services = [
    { icon: FaTruck, label: "Road Freight" },
    { icon: FaPlane, label: "Air Freight" },
    { icon: GiCargoShip, label: "Ocean Freight" },
    { icon: FaTrainSubway, label: "Train Freight" },
    { icon: GiDeliveryDrone, label: "Drone Freight" },
    { icon: FaGift, label: "Send Gift" },
  ];

  const marqueeContent = [...services, ...services];

  const images = useMemo(
    () => [
      { src: "/home/Image-Box-Slider-1.jpg", title: "Outbound Logistics" },
      { src: "/home/Image-Box-Slider-2.jpg", title: "Ocean Transport" },
      { src: "/home/Image-Box-Slider-3.jpg", title: "Rail Transport" },
      { src: "/home/Image-Box-Slider-4.jpg", title: "Container Transport" },
      { src: "/home/Image-Box-Slider-5.jpg", title: "Reverse Logistics" },
      { src: "/home/Image-Box-Slider-6.jpg", title: "Distribution Logistics" },
      { src: "/home/Image-Box-Slider-7.jpg", title: "Inbound Logistics" },
      { src: "/home/Image-Box-Slider-8.jpg", title: "Warehousing" },
    ],
    []
  );

  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const updateVisibleCount = () => {
      const w = window.innerWidth;
      if (w >= 1024) setVisibleCount(5);
      else if (w >= 768) setVisibleCount(4);
      else if (w >= 640) setVisibleCount(3);
      else setVisibleCount(2);
    };
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const extendedImages = useMemo(() => {
    return [...images, ...images.slice(0, visibleCount)];
  }, [images, visibleCount]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const sliderRef = useRef(null);

  const handlePrev = () => {
    setCurrentIndex((prev) => prev - 1);
    setIsTransitioning(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
    setIsTransitioning(true);
  };

  useEffect(() => {
    if (currentIndex < 0) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(images.length - 1);
      }, 700);
    } else if (currentIndex >= images.length) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 700);
    }
  }, [currentIndex, images.length]);

  return (
    <div className="w-full h-auto relative mt-12 md:mt-4 mb-8 mx-auto overflow-hidden">
      
      {/* 1. Header: Letter-by-letter look (Opacity + Y axis) */}
      <header className="flex flex-col items-center justify-center text-center mb-8 mt-4 px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2"
        >
          Freight <span className="relative inline-block text-[#FD6309]">Management</span> Services
        </motion.h2>
        <div className="flex justify-center">
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-24 h-4 border-t-4 border-[#FD6309] rounded-t-full origin-center"
          ></motion.div>
        </div>
      </header>

      {/* 2. Slider: Har image thoda bounce karke aayegi */}
      <div className="relative max-w-8xl mx-auto w-full overflow-hidden px-4 sm:px-6">
        <div
          ref={sliderRef}
          className={`flex ${isTransitioning ? "transition-transform duration-700 ease-in-out" : ""}`}
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
          }}
          onTransitionEnd={() => setIsTransitioning(true)}
        >
          {extendedImages.map((item, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ 
                duration: 0.5, 
                delay: (idx % visibleCount) * 0.1, // Har photo ke beech gap
                type: "spring", 
                stiffness: 120 
              }}
              className="w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 flex-shrink-0 px-2"
            >
              <div className="flex flex-col items-center justify-center">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  src={item.src}
                  alt={item.title}
                  className="w-68 h-48 sm:h-56 md:h-72 lg:h-72 object-cover rounded-lg shadow-lg"
                />
                <h3 className="text-[#0B407A] text-base sm:text-xl font-bold mt-3 text-center">
                  {item.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Buttons */}
        <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#0B407A]/70 text-white p-2 sm:p-3 rounded-full z-10">
          <FaArrowLeft size={18} />
        </button>
        <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0B407A]/70 text-white p-2 sm:p-3 rounded-full z-10">
          <FaArrowRight size={18} />
        </button>
      </div>

      {/* 3. Marquee: Smooth Fade-in */}
    {/* ✅ Marquee Section with Floating Animation */}
<motion.div 
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: false }}
  transition={{ duration: 0.8 }}
  className="relative z-20 overflow-hidden mt-18 py-10" // Padding badhayi hai taki icons jump kar saken
>
  <div className="flex whitespace-nowrap animate-marquee w-max">
    {marqueeContent.map((service, index) => (
      <motion.div
        key={index}
        // Floating Animation: Upar neeche move hona
        animate={{
          y: [0, -10, 0], 
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.2, // Har icon alag time par jump karega
        }}
        className="flex items-center gap-6 sm:gap-8 mx-6 sm:mx-8 cursor-pointer group flex-shrink-0"
      >
        <div className="relative">
          <service.icon
            className="w-8 sm:w-10 h-8 sm:h-10 text-[#0B407A] group-hover:text-[#FD6309] transition-colors duration-300"
          />
          {/* Icon ke peeche chota sa pulse effect */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-[#0B407A]/10 rounded-full -z-10 blur-xl"
          />
        </div>
        
        <span className="text-[#FD6309] font-medium text-lg sm:text-xl tracking-wide group-hover:scale-110 transition-transform">
          {service.label}
        </span>
      </motion.div>
    ))}
  </div>
</motion.div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 15s linear infinite;
        }
      `}</style>
    </div>
  );
}