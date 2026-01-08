import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { LayoutDashboard, MapPin, Truck, ChevronRight } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const featureData = [
  {
    title: "Advanced Dashboard",
    tag: "Management",
    desc: "Control your entire logistics empire from a single, high-fidelity command center. Monitor performance with surgical precision.",
    icon: <LayoutDashboard className="text-amber-600" size={28} />,
    type: "image",
    contentUrl: "/home/dashboard.png",
    route: "/dashboard"
  },
  {
    title: "3D Load Preview",
    tag: "Load Calculator",
    desc: "Professional load calculator trusted by logistics companies for accuracy, efficiency, and cost optimization.",
    icon: <Truck className="text-amber-600" size={28} />,
    type: "video",
    contentUrl: "/home/vedio.mp4",
    route: "/loadcalculator"
  },
  {
    title: "Real-time Live Tracker",
    tag: "Tracking",
    desc: "Never lose sight of your cargo. Our hyper-accurate GPS integration provides minute-by-minute updates and predictive delay alerts.",
    icon: <MapPin className="text-amber-600" size={28} />,
    type: "image",
    contentUrl: "/home/tracking.png",
    route: "/live-tracker"
  }
];

const FeatureRow = ({ feature, index }) => {
  const isEven = index % 2 === 0;
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const textY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const imageY = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  useEffect(() => {
    if (feature.type === "video" && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [feature.type]);

  /* 🔐 ONLY LOGIC CHANGE */
  const handleExplore = () => {
    const isLoggedIn = !!localStorage.getItem("token");

    if (!isLoggedIn) {
      navigate("/login", { state: { redirectTo: feature.route } });
    } else {
      navigate(feature.route);
    }
  };

  return (
    <motion.div 
      ref={containerRef}
      style={{ opacity }}
      className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-16 md:gap-32 py-32 border-b border-orange-200 last:border-none relative`}
    >
      {/* Text Side */}
      <motion.div style={{ y: textY }} className="flex-1 space-y-8 z-10">
        <motion.div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-md border border-orange-200 px-5 py-2 rounded-2xl shadow-sm">
          <div className="p-2 bg-orange-100 rounded-lg">{feature.icon}</div>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">{feature.tag}</span>
        </motion.div>

        <h2 className="text-5xl md:text-7xl font-bold text-gray-900 leading-[0.9] tracking-tighter">
          {feature.title}
        </h2>

        <p className="text-gray-600 text-xl leading-relaxed max-w-lg">
          {feature.desc}
        </p>

        <button
          onClick={handleExplore}
          className="group relative flex items-center gap-4 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold overflow-hidden transition-all hover:scale-105 active:scale-95"
        >
          <span className="relative z-10">Explore Now</span>
          <ChevronRight className="relative z-10 group-hover:translate-x-2 transition-transform" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </motion.div>

      {/* Visual Side */}
      <motion.div style={{ y: imageY, scale }} className="flex-1 w-full relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 border-t-4 border-l-4 border-orange-500 rounded-tl-[3rem]" />
        <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-4 border-r-4 border-orange-500 rounded-br-[3rem]" />

        <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] bg-white border-[10px] border-white group">
          {feature.type === "video" ? (
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
            >
              <source src={feature.contentUrl} type="video/mp4" />
            </video>
          ) : (
            <img
              src={feature.contentUrl}
              alt={feature.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const Features = () => {
  return (
    <div className="relative bg-[#f8fbff] py-20 px-6 md:px-20 border-y-[6px] border-orange-500 overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {featureData.map((feature, index) => (
          <FeatureRow key={index} feature={feature} index={index} />
        ))}
      </div>
    </div>
  );
};

export default Features;
