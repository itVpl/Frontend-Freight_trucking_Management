import React from "react";

const StreamlineLogistics = () => {
  return (
    <section className="container mx-auto px-4 py-8 md:py-16">
      {/* Outer Blue Container */}
      <div
        className="relative bg-[#0356A2] text-white rounded-2xl flex flex-col items-center justify-center text-center"
        style={{ minHeight: "360px" }}
      >
        {/* Background Map Image (replace with your own dotted map image if needed) */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage:
              "url('/map.jpg')", // <-- add a dotted map image in your public folder
          }}
        ></div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-semibold leading-tight mb-6">
            Streamline Your Logistics Today!
          </h2>

          <p className="text-base md:text-lg text-blue-100 mb-10">
            Discover a world of effortless logistics, ready to transform
            the way you move forward.
          </p>

          {/* Button */}
          <a href="/contactus" className="w-full block text-center">
            <button className="inline-flex items-center bg-white text-[#2E6EB5] font-semibold py-3 px-8 rounded-full shadow-md hover:bg-gray-100 transition-all duration-300 ease-in-out">
              Get a Quote
              <svg
                className="ml-3 w-5 h-5 text-[#2E6EB5]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default StreamlineLogistics;
