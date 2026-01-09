import React, { useEffect, useState, useRef } from "react";
import { PiGreaterThanBold } from "react-icons/pi";
import { GrLinkNext } from "react-icons/gr";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";

// Helper Component for the Counting Logic
const Counter = ({ value }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });
  
  // Create a motion value starting at 0
  const motionValue = useMotionValue(0);
  // Smooth out the movement
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      // If the value has a "+", "%", or is just a number
      const numericValue = parseInt(value.replace(/[^0-9]/g, ""));
      motionValue.set(numericValue);
    } else {
      // Reset to 0 when it leaves the screen so it restarts next time
      motionValue.set(0);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    // Update the actual text on screen as the spring moves
    return springValue.on("change", (latest) => {
      setDisplayValue(Math.floor(latest));
    });
  }, [springValue]);

  // Determine if we need to append the suffix (+ or %)
  const suffix = value.includes("+") ? "+" : value.includes("%") ? "%" : "";

  return (
    <span ref={ref}>
      {displayValue}{suffix}
    </span>
  );
};

const PartnersSection = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const cardPop = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="w-full">
      {/* Top Banner Section */}
      <div
        className="relative h-[50vh] sm:h-[55vh] md:h-[60vh] bg-cover bg-center flex flex-col items-center justify-center text-center"
        style={{
          backgroundImage: "url('/servicepic.png')",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>

        <motion.h1
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          variants={fadeInUp}
          className="relative text-3xl sm:text-4xl md:text-5xl font-bold text-white z-10"
        >
          Service
        </motion.h1>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          variants={fadeInUp}
          className="relative mt-3 text-base sm:text-lg z-10 text-white flex items-center justify-center gap-2"
        >
          <span className="text-blue-800 cursor-pointer hover:underline transition">
            Home
          </span>
          <PiGreaterThanBold className="text-white text-sm" />
          <span>Service</span>
        </motion.p>
      </div>

      {/* Community Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-10 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Left Side Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            variants={fadeInUp}
            className="lg:w-[55%] text-center lg:text-left"
          >
            <p className="text-sm sm:text-base font-semibold tracking-wider text-[#0356A2] uppercase mb-3 flex items-center justify-center lg:justify-start">
              <span className="inline-block w-3 h-3 rounded-full bg-[#FF7A00] mr-2"></span>
              OUR COMMUNITY
            </p>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-snug text-[#0356A2] mb-6">
              Join a <span className="text-[#FF7A00]">Growing Community</span> <br className="hidden sm:block" />
              of Business and Logistics Partners
            </h2>

            <p className="text-[#5f5f5f] text-base sm:text-lg mb-8">
              Join a dynamic community of business and logistics partners,
              optimizing supply chains and driving growth.
            </p>

            <div className="flex justify-center lg:justify-start">
              <button className="flex items-center space-x-3 bg-[#0356A2] border border-[#0356A2] text-white hover:text-[#0356A2] px-6 sm:px-8 py-3 rounded-full text-base sm:text-lg font-semibold transition duration-300 shadow-lg hover:bg-white hover:shadow-xl hover:scale-105">
                Join Us
                <span className="border-2 border-white hover:border-[#0356A2] p-2 rounded-full flex items-center justify-center ml-2 sm:ml-4 transition">
                  <GrLinkNext className="text-sm font-none" />
                </span>
              </button>
            </div>
          </motion.div>

          {/* Right Side Stats with Counter */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="lg:w-[40%] grid grid-cols-2 gap-4 sm:gap-6 w-full"
          >
            {[
              { number: "25", text: "Years Of Industry Experience" },
              { number: "300+", text: "Employees for Your Success" },
              { number: "500+", text: "Satisfied Client Worldwide" },
              { number: "99%", text: "On-Time Delivery Rate" },
            ].map((box, idx) => (
              <motion.div
                key={idx}
                variants={cardPop}
                className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl text-center border border-gray-100 shadow-[4px_6px_12px_rgba(0,0,0,0.1)] hover:shadow-[4px_10px_20px_rgba(0,0,0,0.15)] transition"
              >
                <h3 className="text-4xl sm:text-4xl md:text-4xl xl:text-6xl font-extrabold text-[#0356A2] mb-2 sm:mb-3 drop-shadow-[4px_4px_3px_rgba(0,0,0,0.2)]">
                  {/* The Counter Component is used here */}
                  <Counter value={box.number} />
                </h3>
                <p className="text-[#0356A2] font-semibold text-sm sm:text-base md:text-lg leading-snug">
                  {box.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PartnersSection;