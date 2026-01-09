import React from "react";
import { motion } from "framer-motion"; // 1. Import Framer Motion
import {
  Truck,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const LoadCalculatorHero = () => {
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, staggerChildren: 0.2 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 md:px-10 font-sans overflow-hidden border-b-[4px] border-b-orange-500 border-t-[4px] border-t-orange-500">
      
      {/* Background Glows with breathing animation */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-200/30 blur-[120px] rounded-full" 
      />
      <motion.div 
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-indigo-200/30 blur-[120px] rounded-full" 
      />

      {/* Main Card */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }} // Trigger every time it's 20% in view
        variants={containerVariants}
        className="relative max-w-7xl w-full bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[32px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.15)] overflow-hidden"
      >
        <div className="grid lg:grid-cols-12">

          {/* LEFT : Visual Story */}
          <div className="lg:col-span-7 relative min-h-[420px] group">
            <motion.img
              initial={{ scale: 1.1 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 1.5 }}
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2000"
              alt="Global logistics"
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/95 via-slate-900/50 to-transparent" />

            <div className="relative z-10 h-full p-10 md:p-14 flex flex-col justify-between">
              <motion.div variants={itemVariants}>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-white/20 text-blue-300 text-xs font-semibold uppercase tracking-widest mb-6">
                  <Zap size={14} className="animate-pulse" />
                  V Power Logistics
                </div>

                <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-5">
                  Precision Load <br />
                  <span className="text-blue-400">Optimization Platform</span>
                </h1>

                <p className="text-slate-300 text-lg max-w-lg leading-relaxed">
                  Enterprise-grade load planning with advanced 3D stuffing and
                  real-time capacity intelligence for modern logistics teams.
                </p>
              </motion.div>

              {/* Metrics */}
              <motion.div variants={itemVariants} className="flex gap-10 mt-10">
                <Metric label="Capacity Gain" value="15%" />
                <Divider />
                <Metric label="3D Planning" value="Live" />
                <Divider />
                <Metric label="Setup Time" value="0 min" />
              </motion.div>
            </div>
          </div>

          {/* RIGHT : Action + Trust */}
          <div className="lg:col-span-5 p-10 md:p-14 flex flex-col justify-center">
            <motion.div variants={itemVariants} className="text-center lg:text-left mb-10">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-6 mx-auto lg:mx-0 shadow-inner">
                <Truck className="text-blue-600" size={32} />
              </div>

              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Calculate Your Load
              </h2>

              <p className="text-slate-500 leading-relaxed">
                Professional load calculator trusted by logistics companies for
                accuracy, efficiency, and cost optimization.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4 mb-10">
              <BenefitItem text="Increase container utilization instantly" delay={0.1} />
              <BenefitItem text="Reduce fuel & shipping costs" delay={0.2} />
              <BenefitItem text="Avoid manual planning errors" delay={0.3} />
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <a href="/loadcalculator">
                <button className="group w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-semibold text-lg shadow-xl shadow-blue-200 transition-all duration-300 flex items-center justify-center gap-3">
                  Start Load Optimization
                  <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </button>
              </a>
            </motion.div>

            <motion.p variants={itemVariants} className="mt-6 text-xs text-slate-400 flex items-center justify-center lg:justify-start gap-2 uppercase tracking-widest font-semibold">
              <ShieldCheck size={14} className="text-green-500" />
              Enterprise-grade security & compliance
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Footer Trust Row */}
      {/* <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.8 }}
        viewport={{ once: false }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 text-slate-400 text-sm font-medium flex gap-8"
      >
        <span>20ft / 40ft / 45ft Containers</span>
        <span>Cloud-Based Analytics</span>
        <span>Real-time Visualization</span>
      </motion.div> */}
    </section>
  );
};

/* ---------------- Sub Components ---------------- */

const BenefitItem = ({ text, delay }) => (
  <motion.div 
    initial={{ opacity: 0, x: 10 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="flex items-center gap-3 text-slate-700"
  >
    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-green-100">
      <CheckCircle2 size={14} className="text-green-600" />
    </span>
    <span className="text-[15px] font-medium">{text}</span>
  </motion.div>
);

const Metric = ({ value, label }) => (
  <div className="text-white">
    <motion.div 
      initial={{ scale: 0.5 }}
      whileInView={{ scale: 1 }}
      className="text-2xl font-bold"
    >
      {value}
    </motion.div>
    <div className="text-xs text-slate-400 uppercase tracking-wider">
      {label}
    </div>
  </div>
);

const Divider = () => (
  <div className="w-px h-10 bg-white/20" />
);

export default LoadCalculatorHero;