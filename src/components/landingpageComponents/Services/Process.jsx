import React from "react";
import { motion } from "framer-motion";

const Process = () => {
  /* ================= ANIMATIONS ================= */

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.4 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const ProcessStep = ({ number, title, description }) => (
    <motion.div variants={cardVariants} className="relative group mb-12">
      <div className="flex items-center gap-6 mb-4">
        <div className="relative">
          {/* Glow Ring */}
          <div className="absolute inset-0 bg-[#FD6209] blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-full" />
          <span className="relative flex items-center justify-center w-14 h-14 rounded-full border border-white/10 bg-white/5 text-[#FD6209] font-mono text-xl backdrop-blur-sm">
            {number}
          </span>
        </div>

        <h3 className="text-2xl md:text-3xl font-light tracking-tight text-white group-hover:text-[#FD6209] transition-colors duration-300">
          {title}
        </h3>
      </div>

      <div className="pl-20">
        <p className="text-gray-400 font-light leading-relaxed max-w-md border-l border-white/10 pl-6 group-hover:border-[#FD6209] transition-colors duration-700">
          {description}
        </p>
      </div>
    </motion.div>
  );

  return (
    <section className="relative bg-[#050A14] py-24 lg:py-40 overflow-hidden text-white">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#013B80]/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FD6209]/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-20">
          {/* LEFT SIDE */}
          <div className="lg:w-1/2 lg:sticky lg:top-2 lg:h-fit">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-[#FD6209] tracking-[0.5em] uppercase text-xs font-bold mb-6 block"
            >
              Our Logistics Workflow
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-extralight leading-none mb-10"
            >
              From Planning <br />
              <span className="italic font-serif text-white/50">
                to Final Delivery.
              </span>
            </motion.h2>

            <div className="w-24 h-[1px] bg-gradient-to-r from-[#FD6209] to-transparent mb-10" />

            {/* Imageaaaa */}
            <div className="hidden lg:block relative w-full h-64 overflow-hidden rounded-2xl border border-white/5">
              <img
                src="/servicepic.png"
                alt="Logistics Operations"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <motion.div
            className="lg:w-1/2"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <ProcessStep
              number="01"
              title="Shipment Assessment & Planning"
              description="We analyze your cargo type, delivery timeline, and destination to design the most efficient and cost-effective logistics plan."
            />

            <ProcessStep
              number="02" 
              title="Route Optimization & Compliance"
              description="Our logistics experts plan optimized routes while ensuring full compliance with customs, safety regulations, and international trade standards."
            />

            <ProcessStep
              number="03"
              title="Real-Time Transportation & Tracking"
              description="Your shipment moves through our trusted network with GPS-enabled tracking, proactive monitoring, and continuous status updates."
            />

            <ProcessStep
              number="04"
              title="Secure Final Delivery"
              description="We ensure safe, timely, and damage-free delivery with last-mile precision, proof of delivery, and complete customer satisfaction."
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Process;
