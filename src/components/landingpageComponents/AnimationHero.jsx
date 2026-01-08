import React, { useState, useEffect, useRef } from "react";

// The main component that handles the scroll reveal animation logic.
const AnimatedSection = ({ children, delay = "delay-0" }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Use Intersection Observer for efficient scroll detection
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Stop observing once it has become visible
          observer.unobserve(element);
        }
      },
      {
        root: null, // viewport
        rootMargin: "0px",
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Initial state (hidden/lowered) vs visible state
  const transitionClasses = isVisible
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-16"; // Starts 16 units lower

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${delay} ${transitionClasses}`}
    >
      {children}
    </div>
  );
};

// Placeholder URLs for images (using placeholders to match the design style)
const profilePlaceholder = "/heroimg.jpg";
const mainImage = "/heroimg.jpg";

const AnimationHero = () => {
  // Mock data for the client profiles
  const clients = Array(4).fill(profilePlaceholder);

  return (
    <div className="flex items-center justify-center font-['Inter']">
      <div className="max-w-8xl w-full bg-white rounded-2xl">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 p-6 sm:p-12">
          <div className="relative flex flex-col lg:flex-row justify-center items-center h-auto lg:h-[500px] p-4 sm:p-6 md:p-8 lg:p-10 lg:col-span-2 overflow-visible">
            {/* Decorative background left shape */}
            <div
              className="absolute hidden lg:block inset-0 bg-[#1F4E79] z-0 overflow-hidden 
      rounded-l-3xl rounded-tl-[100px] w-[200px] h-[450px]
      transform translate-x-7 translate-y-6 scale-110 shadow-inner"
            ></div>

            {/* Decorative top-right shape */}
            <div
              className="absolute hidden lg:block bg-[#1F4E79] z-0 overflow-hidden 
      h-[200px] w-[200px] top-0 right-0 
      transform -translate-x-8 -translate-y-2 shadow-inner"
            ></div>

            {/* Main Image Container */}
            <div className="relative z-10 w-full max-w-[450px] h-[350px] sm:h-[420px] md:h-[480px] lg:h-[500px] rounded-tl-[100px] rounded-2xl overflow-visible shadow-2xl">
              <img
                src={mainImage}
                alt="A woman working on a laptop, representing efficient logistics management."
                className="w-full h-full object-cover rounded-tl-[80px] rounded-bl-2xl"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/400x500/dbeafe/1e3a8a?text=Logistics+Manager";
                }}
              />

              {/* 50K+ Satisfied Clients Box */}
              <div
                className="absolute top-[25%] left-[-30px] sm:left-[-70px] md:left-[-50px]
        bg-white p-3 sm:p-4 rounded-tl-[50px] rounded-bl-xl 
        shadow-xl border-l-4 border-[#1F4E79] w-[120px] sm:w-[130px] md:w-32 
        text-center z-20 overflow-visible"
              >
                <p className="text-xl sm:text-2xl font-bold text-blue-900">
                  50K+
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  Satisfied Clients
                </p>
                <div className="flex justify-center -space-x-2">
                  {clients.map((src, index) => (
                    <img
                      key={index}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white object-cover"
                      src={src}
                      alt={`Client profile ${index + 1}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = profilePlaceholder;
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* 25 Years of Experience Box */}
              <div
                className="absolute bottom-[25%] right-[-30px] sm:right-[-70px] md:right-[-50px]
        bg-white p-4 sm:p-5 rounded-tl-[50px] rounded-bl-xl 
        shadow-2xl border-l-4 border-[#1F4E79] w-[120px] sm:w-[130px] md:w-32 
        text-center z-20 overflow-visible"
              >
                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black">
                  25
                </p>
                <p className="text-xs sm:text-sm font-semibold text-black">
                  Years of Experience
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center mb-12 lg:col-span-3">
            {/* Introductory Title (No animation needed, visible from start) */}
            <h3 className="text-3xl font-bold text-[#1F4E79] mb-12">
              Welcome To V Power Logistics
            </h3>

            {/* Main Animated Content Block */}
            <AnimatedSection>
              <h1 className="text-4xl sm:text-4xl font-extrabold text-gray-800 leading-tight mb-4">
                Your Trust 3PL Partner Efficient, Reliable, And Scalable
                Logistics Solutions
              </h1>
            </AnimatedSection>

            <AnimatedSection delay="delay-150">
              <p className="text-gray-600 text-lg mb-32">
                At V Power Logistics, we specialize in providing comprehensive
                third-party logistics (3PL) services tailored to meet the unique
                needs of businesses across various industries. Our expertise in
                supply chain management ensures that your products are stored,
                handled, and transported with the utmost care and efficiency.
              </p>
            </AnimatedSection>

            {/* CTA Button */}
            <AnimatedSection delay="delay-300">
              <button className="flex items-center -mt-10 group transition duration-300">
                <span className="bg-white text-black border-2 border-[#1F4E79] px-6 py-3 text-lg font-medium transition-colors group-hover:bg-blue-50">
                  Explore More
                </span>
                <span className="bg-[#1F4E79] p-3 shadow-md transition-colors group-hover:bg-blue-900">
                  {/* Custom Arrow Icon (matches the design style) */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </button>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationHero;
