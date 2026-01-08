import React from "react";
import { Plus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const LoadPost = () => {
  return (
    <section className="relative bg-white py-36 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Luxury Container */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          // key change: once: false taaki har baar animation chale
          viewport={{ once: false, amount: 0.2 }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-[36px] bg-[#0b1220] overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,0.45)]"
        >
          
          {/* Background Glows (Always Animate) */}
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[160px]" 
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 px-10 py-20 md:px-20 items-center">

            {/* LEFT CONTENT */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-4xl md:text-6xl font-semibold text-white leading-tight tracking-tight">
               <span className="text-[#FD6309]"> Post your load.</span>
                <br />
                <span className="text-slate-400 font-normal">
                  Move cargo with confidence.
                </span>
              </h2>

              <p className="mt-8 text-lg md:text-xl text-slate-400 leading-relaxed max-w-xl">
                A premium logistics loadboard designed for serious shippers.
                Publish your shipment and receive bids only from verified partners.
              </p>

              {/* CTA Buttons */}
              <div className="mt-14 flex flex-col sm:flex-row gap-6">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/loadboard"
                  className="group inline-flex items-center gap-4 rounded-full bg-blue-700 px-10 py-5 text-lg font-medium text-white transition"
                >
                  Post Requirement
                  <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                </motion.a>

                {/* <button className="group inline-flex items-center gap-2 text-slate-400 text-lg hover:text-white transition">
                  See how it works
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button> */}
              </div>
            </motion.div>

            {/* RIGHT IMAGES */}
            <div className="relative hidden lg:block">
              {/* Main Image */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="relative rounded-3xl overflow-hidden shadow-2xl"
              >
                <img
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
                  alt="Cargo"
                  className="w-full h-[420px] object-cover"
                />
              </motion.div>

              {/* Floating Image (Har baar slide in aur fir float karega) */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                animate={{ y: [0, -15, 0] }} // Gentle floating
                transition={{ 
                  x: { duration: 0.8, delay: 0.5 },
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute -bottom-16 -left-16 w-64 rounded-2xl overflow-hidden shadow-xl border border-white/10"
              >
                <img
                  src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80"
                  alt="Truck"
                  className="w-full h-40 object-cover"
                />
              </motion.div>
            </div>
          </div>

          {/* Bottom Line (Animated Width) */}
          <motion.div 
            initial={{ width: "0%" }}
            whileInView={{ width: "100%" }}
            viewport={{ once: false }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="absolute bottom-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" 
          />
        </motion.div>
      </div>
    </section>
  );
};

export default LoadPost;