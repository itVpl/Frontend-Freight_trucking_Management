import React, { useEffect, useState, useRef } from "react";
import { PiGreaterThanBold } from "react-icons/pi";
import TransportSection from "../../components/landingpageComponents/TransportSection";

const AnimatedSection = ({ children, delay = "delay-0" }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Isse animation baar baar trigger hogi (jb jb screen pr aayega)
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Isse slide-up effect aayega
  const animationState = isVisible
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-10";

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${delay} ${animationState}`}
    >
      {children}
    </div>
  );
};

const profilePlaceholder = "/heroimg.jpg";
const mainImage = "/heroimg.jpg";

const AboutUs = () => {
  const clients = Array(4).fill(profilePlaceholder);

  return (
    <div>
      {/* Aboutus SECTION */}
      <div
        className="relative h-[60vh] bg-cover bg-center flex flex-col items-center justify-center"
        style={{
          backgroundImage: "url('/aboutuspic.png')",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <h1 className="relative text-4xl md:text-5xl font-bold text-white z-10">
          About Us
        </h1>
        <p className="relative mt-2 text-lg z-10 text-white flex items-center gap-2">
          <span className="text-blue-300 cursor-pointer hover:underline transition">
            Home
          </span>
          <PiGreaterThanBold className="text-white text-sm" />
          <span>About Us</span>
        </p>
      </div>

      {/* MAIN CONTENT SECTION */}
      <div className="flex items-center mt-24 justify-center font-['Inter']">
        <div className="max-w-8xl w-full bg-white rounded-2xl">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 p-6 sm:p-12">
            
            {/* LEFT SIDE (Wrapped in Animation) */}
            <div className="relative flex flex-col items-center h-auto lg:h-[500px] p-4 sm:p-6 md:p-8 lg:p-10 lg:col-span-2 overflow-visible">
              <AnimatedSection>
                <div className="relative z-10 w-full max-w-[450px] h-[350px] sm:h-[420px] md:h-[480px] lg:h-[500px] rounded-tl-[100px] overflow-visible">
                  <div className="relative flex flex-col lg:flex-row justify-center items-center h-auto lg:h-[300px] p-4 sm:p-6 md:p-8 lg:p-10 lg:col-span-2 overflow-visible">
                    <div className="absolute hidden lg:block inset-0 bg-[#1F4E79] z-0 overflow-hidden rounded-l-3xl rounded-tl-[100px] w-[300px] h-[450px] transform translate-x-7 -translate-y-19 scale-110 shadow-inner"></div>
                    <div className="absolute hidden lg:block bg-[#1F4E79] z-0 overflow-hidden h-[200px] w-[200px] top-0 right-0 transform -translate-x-8 -translate-y-27 shadow-inner"></div>

                    <div className="relative z-10 w-full max-w-[450px] h-[350px] sm:h-[420px] md:h-[480px] lg:h-[500px] rounded-tl-[100px] rounded-2xl overflow-visible shadow-2xl">
                      <img
                        src={mainImage}
                        alt="Logistics"
                        className="w-full h-full object-cover rounded-tl-[80px] rounded-bl-2xl"
                      />
                      <div className="absolute top-[25%] left-[-30px] sm:left-[-70px] md:left-[-50px] bg-white p-3 sm:p-4 rounded-tl-[50px] rounded-bl-xl shadow-xl border-l-4 border-[#1F4E79] w-[120px] sm:w-[130px] md:w-32 text-center z-20 overflow-visible">
                        <p className="text-xl sm:text-2xl font-bold text-blue-900">50K+</p>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">Satisfied Clients</p>
                        <div className="flex justify-center -space-x-2">
                          {clients.map((src, index) => (
                            <img key={index} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white object-cover" src={src} alt="client" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-[25%] right-[-30px] sm:right-[-70px] md:right-[-50px] bg-white p-4 sm:p-5 rounded-tl-[50px] rounded-bl-xl shadow-2xl border-l-4 border-[#1F4E79] w-[120px] sm:w-[130px] md:w-32 text-center z-20">
                    <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black">25</p>
                    <p className="text-xs sm:text-sm font-semibold text-black">Years of Experience</p>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* RIGHT CONTENT SECTION */}
            <div className="flex flex-col justify-center mb-12 lg:col-span-3">
              <AnimatedSection delay="delay-100">
                <h3 className="text-3xl font-bold text-[#1F4E79] mb-8">
                  Welcome To V Power Logistics
                </h3>
              </AnimatedSection>

              <AnimatedSection delay="delay-200">
                <h1 className="text-4xl sm:text-4xl font-extrabold text-gray-800 leading-tight mb-4">
                  Your Trust 3PL Partner Efficient, Reliable, And Scalable
                  Logistics Solutions
                </h1>
              </AnimatedSection>

              <AnimatedSection delay="delay-300">
                <p className="text-gray-600 text-lg mb-32">
                  At V Power Logistics, we specialize in providing comprehensive
                  third-party logistics (3PL) services tailored to meet the
                  unique needs of businesses across various industries.
                </p>
              </AnimatedSection>

              <AnimatedSection delay="delay-500">
                <button className="flex items-center -mt-10 group transition duration-300">
                  <span className="bg-white text-black border-2 border-[#1F4E79] hover:border-[#FD6309] px-6 py-3 text-lg font-medium group-hover:bg-blue-50">
                    Explore More
                  </span>
                  <span className="bg-[#1F4E79] p-3 group-hover:bg-[#FD6309]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </div>
      <TransportSection />
    </div>
  );
};

export default AboutUs;