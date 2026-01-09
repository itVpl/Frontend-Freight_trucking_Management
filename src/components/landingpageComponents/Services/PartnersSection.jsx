import React, { useEffect, useState, useRef } from "react";
import { PiGreaterThanBold } from "react-icons/pi";
import { GrLinkNext } from "react-icons/gr";
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

// --- Optimized Counter Component ---
const Counter = ({ value }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });
  
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 40, // Increased for smoother finish
    stiffness: 80,
  });

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const numericValue = parseInt(value.replace(/[^0-9]/g, ""));
    if (isInView) {
      motionValue.set(numericValue);
    } else {
      motionValue.set(0);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      setDisplayValue(Math.floor(latest));
    });
  }, [springValue]);

  const suffix = value.includes("+") ? "+" : value.includes("%") ? "%" : "";

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}{suffix}
    </span>
  );
};

const PartnersSection = () => {
  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { type: "spring", stiffness: 100, damping: 15 } 
    },
  };

  return (
    <div className="w-full font-sans antialiased text-slate-900">
      {/* --- Premium Hero Banner --- */}
      <div
        className="relative h-[60vh] flex flex-col items-center justify-center text-center overflow-hidden"
        style={{
          background: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/servicepic.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed", // Parallax effect
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-gradient-to-b from-black/20 to-[#0356A2]/40"
        />

        <motion.h1
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="relative text-5xl md:text-7xl font-extrabold text-white z-10 tracking-tight"
        >
          Our Services
        </motion.h1>

        <motion.nav
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="relative mt-6 text-lg z-10 text-white/90 flex items-center justify-center gap-3 font-medium bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20"
        >
          <span className="hover:text-blue-300 cursor-pointer transition-colors">Home</span>
          <PiGreaterThanBold className="text-xs opacity-60" />
          <span className="text-white">Services</span>
        </motion.nav>
      </div>

      {/* --- Community Content Section --- */}
      <section className="py-24 px-6 md:px-12 bg-gradient-to-b from-slate-50 to-white relative">
        {/* Subtle Decorative Background Element */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/50 pointer-events-none -skew-x-12 transform origin-right" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
          
          {/* Left Side Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="lg:w-1/2 text-center lg:text-left"
          >
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <span className="h-px w-8 bg-[#FF7A00]" />
              <p className="text-sm font-bold tracking-[0.2em] text-[#FF7A00] uppercase">
                Our Community
              </p>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold leading-[1.1] text-[#0356A2] mb-8">
              Join a <span className="text-[#FF7A00] relative italic">Growing Community
                <svg className="absolute -bottom-2 left-0 w-full h-2 fill-[#FF7A00]/20" viewBox="0 0 100 10"><path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="#FF7A00" strokeWidth="2" /></svg>
              </span> <br />
              of Global Partners
            </h2>

            <p className="text-slate-600 text-lg md:text-xl max-w-2xl leading-relaxed mb-10 mx-auto lg:mx-0">
              We bridge the gap between supply and demand with a dynamic network 
              focused on optimization, reliability, and exponential growth.
            </p>

            <div className="flex justify-center lg:justify-start">
              <button className="group relative flex items-center gap-4 bg-[#0356A2] text-white px-10 py-4 rounded-full text-lg font-bold transition-all hover:bg-[#024582] hover:shadow-[0_20px_40px_rgba(3,86,162,0.3)] hover:-translate-y-1">
                Join Us Now
                <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors">
                  <GrLinkNext className="text-white" />
                </div>
              </button>
            </div>
          </motion.div>

          {/* Right Side Stats Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full"
          >
            {[
              { number: "25", text: "Years Industry Experience" },
              { number: "300+", text: "Expert Team Members" },
              { number: "500+", text: "Satisfied Global Clients" },
              { number: "99%", text: "On-Time Delivery Rate" },
            ].map((box, idx) => (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_50px_rgba(3,86,162,0.1)] transition-all flex flex-col items-center text-center justify-center relative overflow-hidden"
              >
                {/* Card Background Accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <h3 className="text-4xl md:text-5xl font-black text-[#0356A2] mb-4 tracking-tight">
                  <Counter value={box.number} />
                </h3>
                <p className="text-slate-500 font-medium text-sm md:text-base leading-snug uppercase tracking-wide">
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