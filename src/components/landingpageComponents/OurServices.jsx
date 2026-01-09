import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GoArrowUpRight } from "react-icons/go";
import { motion } from "framer-motion"; // Add this

const services = [
  {
    title: "Express Freight And Cargo Services",
    description: "Fast secure delivery for urgent cargo across domistic and international routes.",
    image: 'bg-[url("/s1.jpg")]',
    alt: "Warehouse interior",
  },
  {
    title: "End-to-End Supply Chain Solutions",
    description: "Comprehensive logistics support from sourcing to final delivery.",
    image: 'bg-[url("/servicepic.png")]',
    alt: "Various transport vehicles",
  },
  {
    title: "Ocean Freight",
    description: "Secure global cargo transport via sea routes with cost efficiency.",
    image: 'bg-[url("/s8.jpg")]',
    alt: "Container ship at sea",
  },
  {
    title: "Express Freight & Cargo Services",
    description: "Need it there fast? Our express freight solutions ensure your goods arrive on time.",
    image: 'bg-[url("/s9.jpg")]',
    alt: "Airplane taking off",
  },
  {
    title: "Rail Cargo Delivery Services",
    description: "Seamless integration with warehousing and last-mile delivery.",
    image: 'bg-[url("/s2.jpg")]',
    alt: "Train on tracks at night",
  },
  {
    title: "Road Freight",
    description: "Fast, reliable road freight delivery across cities and industrial zones.",
    image: 'bg-[url("/s1.jpg")]',
    alt: "Trucks on a highway",
  },
];

const ServiceCard = ({ service, index }) => (
  <motion.div
    // ANIMATION ADDED HERE
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: false, amount: 0.2 }} // once: false makes it work "every time"
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{ y: -5 }} // Slight hover lift
    className="
      flex-shrink-0 w-64 h-[18rem] 
      bg-white rounded-xl shadow-lg
      overflow-hidden transform transition duration-300 hover:shadow-2xl
      mb-4 mr-4
    "
  >
    <div className="p-3 h-[60%] flex items-center justify-center bg-white">
      <div
        className={`
          ${service.image} w-full h-full 
          bg-cover bg-center rounded-lg 
          border-b-2 border-transparent 
        `}
        role="img"
        aria-label={service.alt}
      />
    </div>

    <div className="p-1 h-[40%] flex flex-col justify-between">
      <div>
        <h3 className="text-xs font-bold text-gray-800 mb-1">{service.title}</h3>
        <p className="text-xs text-gray-600">{service.description}</p>
      </div>
      <button
        className="
          flex items-center text-sm font-semibold text-black hover:text-white hover:bg-[#FD6309]
          transition duration-150 mt-1 self-center border border-[#FD6309] rounded-lg p-1 mb-2
        "
      >
        Learn More <GoArrowUpRight />
      </button>
    </div>
  </motion.div>
);

const OurServices = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      const currentScroll = scrollRef.current.scrollLeft;

      if (direction === "left") {
        scrollRef.current.scroll({
          left: currentScroll - scrollAmount,
          behavior: "smooth",
        });
      } else if (direction === "right") {
        scrollRef.current.scroll({
          left: currentScroll + scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <>
      <section className="bg-[#87A6C2] p-10 h-[580px] flex flex-col justify-center items-center font-sans">
        {/* Animated Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="text-center mb-12 mt-2 max-w-2xl"
        >
          <h2 className="text-5xl text-white mb-4">
            Our{" "}
            <span className="text-transparent bg-clip-text bg-[#FD6309]">
              Services
            </span>
          </h2>
          <div className="flex justify-center">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "6rem" }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
              className="h-4 border-t-4 border-[#FD6309] rounded-t-full"
            ></motion.div>
          </div>
          <p className="text-lg text-white/90">
            Transportation is the most powerful weapon you can use to change the world
          </p>
        </motion.div>

        <div className="relative w-full max-w-8xl">
          <button
            onClick={() => scroll("left")}
            className="absolute left-[-2rem] top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition hidden md:block"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-[-2rem] top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition hidden md:block"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>

          <div
            ref={scrollRef}
            className="flex space-x-8 overflow-x-auto p-4 hide-scrollbar"
          >
            {services.map((service, index) => (
              <ServiceCard key={index} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default OurServices;