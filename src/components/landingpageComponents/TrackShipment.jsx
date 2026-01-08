import React, { useState } from "react";
import { Search, Package, Truck, ChevronRight, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const TrackShipment = () => {
  const [trackingId, setTrackingId] = useState("");
  const navigate = useNavigate();

  const handleTrack = (e) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      alert("Please enter Tracking ID");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: "/live-tracker", trackingId } });
      return;
    }
    navigate("/live-tracker", { state: { trackingId } });
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  const imageReveal = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.8, ease: "easeOut" } 
    }
  };

  return (
    <section className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center py-10 px-4 md:px-12 font-sans overflow-hidden">
      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center">

        {/* LEFT SECTION */}
        <div className="relative">
          {/* Pulsing background glow */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 blur-3xl rounded-full opacity-50"></div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            className="relative"
          >
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-6"
            >
              Track your <br />
              <span className="text-[#FD6309]">Luxury</span> Goods.
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-lg text-slate-500 max-w-md mb-8 leading-relaxed font-medium"
            >
              Experience the next generation of logistics with real-time shipment intelligence.
            </motion.p>

            <motion.div 
              variants={imageReveal}
              whileHover={{ y: -10 }}
              className="relative rounded-[40px] overflow-hidden shadow-2xl border-8 border-white cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1000"
                alt="Logistics"
                className="w-full h-[400px] object-cover hover:scale-110 transition-transform duration-1000"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* RIGHT SECTION */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="bg-white border border-slate-200 rounded-[48px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] p-8 md:p-12"
        >
          <div className="space-y-8">

            <motion.div variants={fadeInUp} className="flex items-center gap-3">
              <div className="w-10 h-[2px] bg-blue-600"></div>
              <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">
                Live Status
              </span>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <h3 className="text-3xl font-bold text-slate-900">
                Enter Tracking ID
              </h3>
              <p className="text-slate-400 font-medium">
                Get instant package location & delivery updates.
              </p>
            </motion.div>

            <motion.form variants={fadeInUp} onSubmit={handleTrack} className="space-y-4">
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Search size={22} />
                </div>

                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. SHIP00000000"
                  className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-[24px] outline-none text-lg font-bold text-slate-800 transition-all shadow-inner"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "#ce8c40ff" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-blue-700 text-white py-6 rounded-[24px] font-extrabold text-lg transition-all shadow-xl flex items-center justify-center gap-3"
              >
                Verify & Track 
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                >
                  <ChevronRight size={20} />
                </motion.span>
              </motion.button>
            </motion.form>

            <motion.div 
              variants={fadeInUp}
              className="pt-4 flex items-center justify-between opacity-40 grayscale italic text-xs font-bold"
            >
              <span className="flex items-center gap-2 hover:text-blue-600 transition-colors cursor-default">
                <Globe size={14} /> AIR FREIGHT
              </span>
              <span className="flex items-center gap-2 hover:text-blue-600 transition-colors cursor-default">
                <Truck size={14} /> LAST MILE
              </span>
              <span className="flex items-center gap-2 hover:text-blue-600 transition-colors cursor-default">
                <Package size={14} /> SECURE PACK
              </span>
            </motion.div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default TrackShipment;