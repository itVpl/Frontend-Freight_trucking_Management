import React from "react";
import { FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";

const teamMembers = [
  { id: 1, name: "Rishi Jyoti", designation: "CEO", imageUrl: "/Rishijyoti.jpg" },
  { id: 2, name: "Vivek Lamba", designation: "Director of Operations", imageUrl: "/VivekLamba.jpg" },
  { id: 3, name: "Akshay Kathauria", designation: "General Manager", imageUrl: "/AkshayKathuia.jpg" },
  { id: 4, name: "Harsh Pathak", designation: "IT Manager", imageUrl: "/Harshpatahk.png" },
];

const ShareIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const TeamCard = ({ member, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="relative flex-shrink-0 cursor-default w-full sm:w-1/2 lg:w-[20%] xl:w-[20%] p-4"
  >
    <div className="relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl bg-gray-100 group">
      {/* 🔥 HEIGHT INCREASED HERE */}
      <img
        src={member.imageUrl}
        alt={member.name}
        className="w-full h-[380px] object-cover object-center transition-transform duration-500 group-hover:scale-110"
        onError={(e) => {
          e.target.src =
            "https://placehold.co/400x500/6B7280/FFFFFF?text=Image+Error";
        }}
      />

      <button className="absolute top-4 right-4 p-2 bg-white rounded-full">
        <ShareIcon className="w-5 h-5" />
      </button>

      <div className="absolute inset-x-0 bottom-0 p-4 flex justify-between items-center bg-[#066466]/50 backdrop-blur-md text-white rounded-2xl">
        <div>
          <span className="text-lg font-semibold">{member.name}</span>
          <p className="text-sm text-yellow-500">
            ({member.designation})
          </p>
        </div>
        <button className="p-3 bg-yellow-100 border-4 border-[#FD6309] rounded-full hover:scale-110 transition">
          <FaArrowRight className="text-[#FD6309]" />
        </button>
      </div>
    </div>
  </motion.div>
);

export default function MeetOurTeam() {
  const visibleMembers = teamMembers.slice(0, 4);

  return (
    <div className="bg-blue-100 mb-10 py-12 overflow-hidden border-b-[4px] border-b-orange-500 border-t-[4px] border-t-orange-500">
      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mt-12 mb-12 max-w-xl mx-auto"
      >
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          Meets <span className="text-[#FD6309]">Our</span> Team
        </h2>
        <p className="text-gray-600">
          Education is the most powerful weapon you can use to change the world
        </p>
      </motion.header>

      {/* CENTERED CARDS */}
      <div className="max-w-8xl mx-auto flex justify-center">
        {visibleMembers.map((member, index) => (
          <TeamCard key={member.id} member={member} index={index} />
        ))}
      </div>
    </div>
  );
}
