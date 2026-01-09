import React from "react";
import { motion } from "framer-motion";
import {
  Truck,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoadCalculatorHero = () => {
  const navigate = useNavigate();

  // 🔐 MAIN HANDLER
  const handleStartOptimization = () => {
    const token = localStorage.getItem("token"); // ✅ login check
    const usedBefore = localStorage.getItem("loadCalculatorUsed");

    // ✅ If logged in → unlimited access
    if (token) {
      navigate("/loadcalculator");
      return;
    }

    // ❌ Not logged in
    if (usedBefore) {
      navigate("/login");
    } else {
      localStorage.setItem("loadCalculatorUsed", "true");
      navigate("/loadcalculator");
    }
  };

  // Animations
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 md:px-10 overflow-hidden border-b-4 border-t-4 border-orange-500">

      {/* Background Effects */}
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

      {/* Card */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ amount: 0.2 }}
        variants={containerVariants}
        className="max-w-7xl w-full bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl overflow-hidden border"
      >
        <div className="grid lg:grid-cols-12">

          {/* LEFT */}
          <div className="lg:col-span-7 relative min-h-[420px]">
            <motion.img
              initial={{ scale: 1.1 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 1.5 }}
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2000"
              alt="Logistics"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/95 via-slate-900/50 to-transparent" />

            <div className="relative z-10 p-10 md:p-14 h-full flex flex-col justify-between">
              <motion.div variants={itemVariants}>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-6">
                  <Zap size={14} className="animate-pulse" />
                  V Power Logistics
                </div>

                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-5">
                  Precision Load <br />
                  <span className="text-blue-400">Optimization</span>
                </h1>

                <p className="text-slate-300 text-lg max-w-lg">
                  Advanced 3D load planning & real-time container optimization.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex gap-10 mt-10">
                <Metric label="Capacity Gain" value="15%" />
                <Divider />
                <Metric label="3D Planning" value="Live" />
                <Divider />
                <Metric label="Setup Time" value="0 min" />
              </motion.div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-5 p-10 md:p-14 flex flex-col justify-center">
            <motion.div variants={itemVariants} className="mb-10">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <Truck size={32} className="text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Calculate Your Load</h2>
              <p className="text-slate-500">
                Trusted by enterprise logistics teams worldwide.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4 mb-10">
              <BenefitItem text="Maximize container utilization" />
              <BenefitItem text="Reduce fuel & shipping cost" />
              <BenefitItem text="Eliminate manual planning errors" />
            </motion.div>

            {/* 🔥 ACTION BUTTON */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button
                onClick={handleStartOptimization}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 shadow-xl"
              >
                Start Load Optimization
                <ArrowRight />
              </button>
            </motion.div>

            <p className="mt-6 text-xs text-slate-400 flex items-center gap-2 uppercase font-semibold">
              <ShieldCheck size={14} className="text-green-500" />
              Secure & Enterprise Ready
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

/* ---------------- Components ---------------- */

const BenefitItem = ({ text }) => (
  <div className="flex items-center gap-3">
    <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
      <CheckCircle2 size={14} className="text-green-600" />
    </span>
    <span className="font-medium">{text}</span>
  </div>
);

const Metric = ({ value, label }) => (
  <div className="text-white">
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-xs text-slate-400 uppercase">{label}</div>
  </div>
);

const Divider = () => <div className="w-px h-10 bg-white/20" />;

export default LoadCalculatorHero;
