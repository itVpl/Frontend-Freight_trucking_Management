import React from "react";
import { motion } from "framer-motion";

const Process = () => {
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Delay between each step's animation
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8 } },
  };

  const ProcessStep = ({ number, title, description }) => (
    <motion.div 
      variants={itemVariants}
      className="flex items-start mb-12 sm:mb-16 last:mb-0"
    >
      <div className="text-6xl sm:text-7xl md:text-8xl font-bold text-[#C4D3E6] mr-4 sm:mr-6 leading-none">
        {number}
      </div>
      <div>
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-medium text-[#013B80] mb-2">
          {title}
        </h3>
        <p className="text-base sm:text-lg text-[#4A6B9A] max-w-xs sm:max-w-sm md:max-w-md leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-12 sm:py-16 md:py-20 overflow-hidden">
      {/* Section Heading */}
      <motion.p 
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }} // "once: false" makes it repeat
        className="text-sm sm:text-base font-semibold tracking-wider text-[#0356A2] uppercase mb-3 flex items-center justify-center lg:justify-start"
      >
        <span className="inline-block w-3 h-3 rounded-full bg-[#FF7A00] mr-2"></span>
        Work Process
      </motion.p>

      {/* Main Heading */}
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        className="text-3xl sm:text-4xl md:text-5xl font-light text-[#013B80] mb-6 leading-tight"
      >
        Our <span className="text-[#FD6209] font-normal">Proven Process</span> for{" "}
        <span className="font-normal">Excellence</span>
      </motion.h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Left Column (Image/SVG side) */}
        <div className="order-2 lg:order-1 flex flex-col justify-center items-center">
          <motion.p 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: false }}
             className="text-[#4A6B9A] text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-md sm:max-w-lg mb-8 sm:mb-12 text-center lg:text-left"
          >
            Our process is simple yet effective. Every project is different, but we’ve
            seen thousands of them since we first launched. Our experience is your asset.
          </motion.p>

          <motion.div 
            variants={imageVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false }}
            className="flex justify-center items-center w-full"
          >
            <div className="bg-[#EAF0FA] p-6 sm:p-8 flex items-center justify-center w-full max-w-md sm:max-w-lg md:max-w-xl h-64 sm:h-80 md:h-96 relative rounded-2xl shadow-sm">
              <div className="w-full h-full border border-dashed border-[#AABCCF] flex items-center justify-center rounded-xl">
                <div className="absolute w-3/4 h-3/4 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                    {/* SVG Circles with simple hover animation added via CSS class if desired */}
                    <circle cx="35" cy="50" r="30" stroke="#013B80" strokeWidth="0.8" fill="none" />
                    <circle cx="35" cy="50" r="20" stroke="#013B80" strokeWidth="0.8" fill="none" />
                    <circle cx="35" cy="50" r="10" stroke="#013B80" strokeWidth="0.8" fill="none" />
                    <circle cx="65" cy="50" r="30" stroke="#E57373" strokeWidth="0.8" fill="none" />
                    <circle cx="65" cy="50" r="20" stroke="#E57373" strokeWidth="0.8" fill="none" />
                    <circle cx="65" cy="50" r="10" stroke="#E57373" strokeWidth="0.8" fill="none" />
                    <line x1="35" y1="50" x2="65" y2="50" stroke="#E57373" strokeWidth="0.8" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column (Steps) */}
        <motion.div 
          className="order-1 lg:order-2"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          <ProcessStep
            number="01"
            title="In Depth Consultation"
            description="Carefully assessing your logistics needs to ensure tailored and effective solutions."
          />
          <ProcessStep
            number="02"
            title="Strategic Planning"
            description="Designing a best plan to ensure efficient and optimal delivery of your goods."
          />
          <ProcessStep
            number="03"
            title="Efficient Execution"
            description="Carefully coordinating every detail of the shipment process to ensure smooth and timely execution."
          />
          <ProcessStep
            number="04"
            title="On-Time Delivery"
            description="Gaining a deep understanding of your logistics needs to offer the best possible solutions."
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Process;