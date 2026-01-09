import React from "react";
import { PiGreaterThanBold } from "react-icons/pi";
import TransportSection from "../../components/landingpageComponents/TransportSection";
import {
  FaPlay,
  FaArrowRight,
  FaGlobeAmericas,
  FaAward,
  FaFingerprint,
} from "react-icons/fa";
import { motion } from "framer-motion";

/* ------------------ REUSABLE ANIMATION ------------------ */
// Changed "once: true" to "once: false" to trigger every time
const FadeIn = ({ children, delay = 0, direction = "up", distance = 40 }) => (
  <motion.div
    initial={{
      opacity: 0,
      y: direction === "up" ? distance : direction === "down" ? -distance : 0,
      x: direction === "left" ? distance : direction === "right" ? -distance : 0,
    }}
    whileInView={{ opacity: 1, y: 0, x: 0 }}
    viewport={{ once: false, amount: 0.2 }} // Re-animates every time 20% of the element is visible
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

const clients = [
  "/client1.jpg",
  "/client2.jpg",
  "/client3.jpg",
  "/client4.jpg",
];

const AboutUs = () => {
  return (
    <div>
      {/* HERO / BREADCRUMB */}
      <div
        className="relative h-[60vh] bg-cover bg-center flex flex-col items-center justify-center"
        style={{
          backgroundImage: "url('/aboutuspic.png')",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="relative text-4xl md:text-5xl font-bold text-white z-10"
        >
          About Us
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ delay: 0.2 }}
          className="relative mt-2 text-lg z-10 text-white flex items-center gap-2"
        >
          <span className="text-blue-300 cursor-pointer hover:underline transition">
            Home
          </span>
          <PiGreaterThanBold className="text-white text-sm" />
          <span>About Us</span>
        </motion.p>
      </div>

      {/* MAIN SECTION */}
      <section className="py-24 lg:py-32 overflow-hidden bg-gradient-to-b from-blue-50 to-slate-500 border-b-4 border-t-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            
            {/* LEFT CONTENT */}
            <div>
              <FadeIn delay={0.1}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-8">
                  <FaAward className="text-orange-600 text-xs" />
                  <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">
                    Premium Service 2024
                  </span>
                </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                <h2 className="text-4xl md:text-6xl font-bold text-slate-900 leading-[1.1] mb-8">
                  Moving the world, <br />
                  <span className="text-orange-400 font-light italic">
                    one mile at a time.
                  </span>
                </h2>
              </FadeIn>

              <FadeIn delay={0.3}>
                <p className="text-gray-600 text-lg leading-relaxed mb-10 max-w-lg">
                  We specialize in high-precision logistics. From complex global
                  supply chains to last-mile delivery, we combine human
                  expertise with cutting-edge technology to keep your business
                  moving forward.
                </p>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="flex flex-wrap items-center gap-6 mb-16">
                  <button className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-sm tracking-wide hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 transition-all duration-300 flex items-center gap-3">
                    EXPLORE SOLUTIONS <FaArrowRight size={12} />
                  </button>

                  {/* <button className="flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-full border-2 border-gray-100 flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                      <FaPlay className="text-blue-600 text-[10px] ml-1" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      Corporate Video
                    </span>
                  </button> */}
                </div>
              </FadeIn>

              <div className="grid grid-cols-2 gap-8 border-t border-gray-100 pt-10">
                <FadeIn delay={0.5} direction="up">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                      <FaFingerprint className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-slate-900">100%</h4>
                      <p className="text-[10px] text-white uppercase font-bold tracking-widest">
                        Secure Delivery
                      </p>
                    </div>
                  </div>
                </FadeIn>

                <FadeIn delay={0.6} direction="up">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
                      <FaGlobeAmericas className="text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-slate-900">24/7</h4>
                      <p className="text-[10px] text-white uppercase font-bold tracking-widest">
                        Global Support
                      </p>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <div className="relative">
              <FadeIn direction="left" delay={0.2}>
                <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] group">
                  <img
                    src="/heroimg.jpg"
                    alt="Team"
                    className="w-full h-[600px] object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
              </FadeIn>

              {/* CLIENT AVATARS */}
              <FadeIn delay={0.4} direction="up">
                <div className="absolute -bottom-10 -left-10 z-20 bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-50 hidden md:block">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex -space-x-3">
                      {clients.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt="Client"
                          className="w-10 h-10 rounded-full border-4 border-white object-cover"
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-400">
                      +500 Clients
                    </span>
                  </div>
                  <p className="text-slate-900 font-bold text-lg leading-tight">
                    Trusted by World's <br /> Leading Brands
                  </p>
                </div>
              </FadeIn>

              <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-50 rounded-full -z-0 blur-3xl opacity-60" />
            </div>
          </div>
        </div>
      </section>

      <TransportSection />
    </div>
  );
};

export default AboutUs;