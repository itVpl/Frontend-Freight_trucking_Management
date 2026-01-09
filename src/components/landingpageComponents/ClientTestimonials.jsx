import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

// --- Testimonial Data ---
const testimonialsData = [
  {
    id: 1,
    name: "Jenny Wilson",
    location: "New York",
    quote: "Supply's dedicated team keeps our freight moving on time without hassle. Their clear quick solutions have made them our trusted partner.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  },
  {
    id: 2,
    name: "Devon Lane",
    location: "UAE",
    quote: "Supply's dedicated team keeps our freight moving on time without hassle. Their clear quick solutions have made them our trusted partner.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
  {
    id: 3,
    name: "Devon Lane",
    location: "Australia",
    quote: "Supply's dedicated team keeps our freight moving on time without hassle. Their clear quick solutions have made them our trusted partner.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
  },
  {
    id: 4,
    name: "Robert Fox",
    location: "Germany",
    quote: "Supply's dedicated team keeps our freight moving on time without hassle. Their clear quick solutions have made them our trusted partner.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
  },
  {
    id: 5,
    name: "Jane Doe",
    location: "Canada",
    quote: "Supply's dedicated team keeps our freight moving on time without hassle. Their clear quick solutions have made them our trusted partner.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
  },
  {
    id: 6,
    name: "Emily Chen",
    location: "Japan",
    quote: "Supply's dedicated team keeps our freight moving on time without hassle. Their clear quick solutions have made them our trusted partner.",
    image: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=400&fit=crop",
  },
];

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Cards will pop one by one
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 }
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

// --- Testimonial Card Component ---
const TestimonialCard = ({ testimonial }) => (
  <motion.div 
    variants={cardVariants}
    className="bg-white p-4 rounded-xl shadow-lg flex-none w-[260px] sm:w-[300px] md:w-[320px] lg:w-[350px] xl:w-[400px] mr-4 relative h-[180px] flex flex-col justify-between"
  >
    <div className="flex items-start mb-2">
      <div className="w-24 h-24 md:w-32 md:h-32 mr-4 mt-2 rounded-2xl overflow-hidden shrink-0">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col mt-2">
        <div className="text-yellow-500 text-base mb-1 flex">
          {"★".repeat(5)}
        </div>
        <p className="text-gray-700 text-sm line-clamp-4">
          {testimonial.quote}
        </p>
        <div className="flex justify-start text-xs pt-2">
          <span className="font-semibold text-gray-800">
            {testimonial.name}
          </span>
          <span className="text-gray-500 ml-2">{testimonial.location}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

// --- Main Component ---
const ClientTestimonials = () => {
  const [currentScrollGroup, setCurrentScrollGroup] = useState(0);
  const [scrollGroupSize, setScrollGroupSize] = useState(4);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateGroupSize = () => {
      if (window.innerWidth < 768) {
        setScrollGroupSize(1);
      } else {
        setScrollGroupSize(4);
      }
    };
    updateGroupSize();
    window.addEventListener("resize", updateGroupSize);
    return () => window.removeEventListener("resize", updateGroupSize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScrollGroup((prevGroup) => {
        const totalGroups = Math.ceil(testimonialsData.length / scrollGroupSize);
        return (prevGroup + 1) % totalGroups;
      });
    }, 3000); // 3 seconds for smoother transition
    return () => clearInterval(interval);
  }, [scrollGroupSize]);

  const getCarouselXOffset = () => {
    const cardWidth = window.innerWidth < 768 ? 260 : 300; 
    const margin = 16;
    const scrollDistance = currentScrollGroup * scrollGroupSize * (cardWidth + margin);
    return -scrollDistance;
  };

  return (
    <motion.div 
      className="bg-[#87A6C2] py-12 px-4 flex flex-col items-center overflow-hidden border-b-[4px] border-b-orange-500 border-t-[4px] border-t-orange-500"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }} // triggers every time you scroll back
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={headerVariants} className="text-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-800 mb-1">
          Our Client<span className="text-[#F29D38]"> Say</span>
        </h1>
        <div className="flex justify-center">
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-4 border-t-4 border-amber-500 rounded-t-full"
          />
        </div>
        <p className="text-gray-600 text-base mt-2">
          Education is the most powerful weapon you can use to change the world
        </p>
      </motion.div>

      {/* Carousel */}
      <div ref={containerRef} className="w-full max-w-7xl mb-12 overflow-hidden relative">
        <motion.div
          className="flex flex-nowrap"
          animate={{ x: getCarouselXOffset() }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        >
          {testimonialsData.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
          {/* Duplicate for seamless feel */}
          {testimonialsData.slice(0, scrollGroupSize).map((testimonial, index) => (
            <TestimonialCard key={`dup-${index}`} testimonial={testimonial} />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ClientTestimonials;