import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Target,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  PackageCheck,
} from "lucide-react";

/* ================= TRANSPORT MODES CONTENT ================= */

const tabs = [
  {
    id: "surface",
    label: "Surface Transport",
    tagline: "Smart Road Logistics",
    image: "/ustruck.avif",
    description1:
      "Powering domestic and cross-border trade through reliable road transportation.",
    description2:
      "Our technology-driven fleet operations, GPS-enabled vehicles, and optimized routing ensure on-time deliveries across cities, industrial zones, and remote locations with complete shipment visibility.",
  },
  {
    id: "air",
    label: "Air Freight",
    tagline: "Time-Critical Air Cargo",
    image: "/plane.jpg",
    description1:
      "Fast, secure, and priority-based air freight solutions worldwide.",
    description2:
      "We partner with leading airlines to deliver express and premium air cargo services for urgent and high-value shipments, ensuring speed, safety, and strict international compliance.",
  },
  {
    id: "sea",
    label: "Sea Shipment",
    tagline: "Global Ocean Freight",
    image: "/b1.jpg",
    description1:
      "Cost-effective maritime logistics connecting global markets.",
    description2:
      "From LCL to FCL shipments, our ocean freight services offer scalable capacity, transparent pricing, and seamless port-to-door coordination for international trade.",
  },
];

/* ================= SERVICES ================= */

const services = [
  "Warehousing & Distribution",
  "Domestic & International Freight",
  "Customs Clearance",
  "Cargo Insurance",
  "Cold Chain Logistics",
  "Supply Chain Optimization",
  "Last-Mile Delivery",
];

export default function TransportSection() {
  const [activeTab, setActiveTab] = useState("surface");
  const activeData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="flex flex-col w-full bg-[#f8fafc] font-sans">
      {/* ================= SECTION 1 : TRANSPORT MODES ================= */}
      <section className="relative w-full py-24 px-6 md:px-16 lg:px-32 overflow-hidden bg-white border-t-4 border-orange-100">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="mb-12">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-orange-600 font-bold tracking-[0.2em] uppercase text-xs"
            >
              Integrated Logistics Solutions
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-extrabold text-[#063567] mt-3 tracking-tight"
            >
              Delivering your cargo,
              <br />
              <span className="text-slate-400 font-light italic text-3xl md:text-4xl">
                across borders with confidence.
              </span>
            </motion.h2>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-4 mb-16 border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                  activeTab === tab.id
                    ? "text-[#063567]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-orange-500"
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-12 gap-16 items-center">
            {/* Content */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <h3 className="text-orange-500 font-semibold mb-2 flex items-center gap-2">
                    <span className="w-8 h-[1px] bg-orange-500"></span>
                    {activeData.tagline}
                  </h3>

                  <h4 className="text-3xl md:text-4xl font-bold text-[#063567] mb-6 leading-[1.1]">
                    {activeData.description1}
                  </h4>

                  <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-2xl">
                    {activeData.description2}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    {services.map((service, i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-3 group cursor-default"
                      >
                        <PackageCheck
                          size={18}
                          className="text-orange-500 opacity-70 group-hover:opacity-100 transition-opacity"
                        />
                        <span className="text-gray-700 font-semibold text-[11px] tracking-[0.15em] uppercase">
                          {service}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Image */}
            <div className="lg:col-span-5 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.6, ease: "anticipate" }}
                  className="relative z-10"
                >
                  <div className="rounded-[2rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(6,53,103,0.4)] border-[12px] border-white">
                    <img
                      src={activeData.image}
                      alt={activeData.label}
                      className="w-full h-[400px] md:h-[550px] object-cover"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="absolute inset-0 bg-orange-500/10 -m-8 rounded-[3rem] -z-10 transform -rotate-2" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 2 : VISION & MISSION ================= */}
      <section className="relative w-full py-28 px-6 md:px-16 lg:px-32 bg-[#063567] overflow-hidden border-t-5 border-orange-500">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/servicepic.png"
            alt="Logistics Operations"
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-20">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-orange-400 font-bold tracking-[0.4em] uppercase text-[10px] bg-white/5 px-4 py-2 rounded-full border border-white/10"
            >
              Our Core Values
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold mt-6 text-white"
            >
              Connecting Businesses
              <br />
              <span className="text-blue-400">Through Smart Logistics.</span>
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group relative p-10 lg:p-14 rounded-[3.5rem] bg-white/5 backdrop-blur-md border border-white/10 hover:border-orange-500/50 transition-all duration-500"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform">
                <Eye size={32} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold text-orange-500 mb-6">
                Our Vision
              </h3>
              <p className="text-white text-lg leading-relaxed mb-8">
                To become a globally trusted logistics partner by combining
                technology, sustainability, and operational excellence to move
                goods faster, safer, and smarter.
              </p>
              {/* <div className="flex items-center gap-3 text-orange-400 font-bold uppercase text-[10px] tracking-widest group-hover:gap-5 transition-all">
                <span>Explore Innovation</span>
                <ArrowRight size={16} />
              </div> */}
            </motion.div>

            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group relative p-10 lg:p-14 rounded-[3.5rem] bg-white text-[#063567] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500"
            >
              <div className="w-16 h-16 bg-[#063567] rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform">
                <Target size={32} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-6">Our Mission</h3>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                To simplify logistics for businesses by delivering reliable
                transportation, transparent operations, and customer-focused
                supply chain solutions across domestic and international markets.
              </p>
              {/* <div className="flex items-center gap-3 text-blue-600 font-bold uppercase text-[10px] tracking-widest group-hover:gap-5 transition-all">
                <span>View Methodology</span>
                <ArrowRight size={16} />
              </div> */}
            </motion.div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-24 pt-12 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Globe, label: "Worldwide Network" },
              { icon: Zap, label: "Fast Turnaround" },
              { icon: ShieldCheck, label: "Secure & Insured" },
              { icon: PackageCheck, label: "Real-Time Tracking" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-4 text-orange-400 hover:text-white transition-colors cursor-default"
              >
                <item.icon size={24} />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
