import React, { useState, useEffect, useRef } from 'react';
import { Truck, MapPin, Package, Clock, Users, CreditCard, BarChart3, Mail } from 'lucide-react';

const FeaturesSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Jab section screen me aaye (entry.isIntersecting true hoga)
        // Jab bahar jaye toh false kar denge taaki wapas aane par re-animate ho
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 } // 10% section dikhte hi animation start
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  const features = [
    { icon: <Truck />, title: "Live Tracking", description: "Real-time GPS tracking for all shipments", color: "from-blue-500 to-cyan-500" },
    { icon: <Package />, title: "Load Management", description: "Efficient load board system for deliveries", color: "from-purple-500 to-pink-500" },
    { icon: <MapPin />, title: "Route Optimization", description: "Smart routing for cost-effective delivery", color: "from-orange-500 to-red-500" },
    { icon: <Clock />, title: "Delivery Scheduling", description: "Advanced system to manage timelines", color: "from-green-500 to-emerald-500" },
    { icon: <Users />, title: "Driver Management", description: "Performance tracking and assignments", color: "from-indigo-500 to-blue-500" },
    { icon: <CreditCard />, title: "Billing & Invoicing", description: "Automated billing and payment tracking", color: "from-yellow-500 to-orange-500" },
    { icon: <BarChart3 />, title: "Analytics & Reports", description: "Data-driven decision making reports", color: "from-pink-500 to-rose-500" },
    { icon: <Mail />, title: "Consignment Tracking", description: "End-to-end status notifications", color: "from-teal-500 to-cyan-500" }
  ];

  return (
    <div ref={sectionRef} className="min-h-screen relative py-20 px-4 overflow-hidden bg-slate-950">
      {/* Custom Keyframes for Flying Effect */}
      <style>{`
        @keyframes flyIn3D {
          0% { 
            opacity: 0; 
            transform: translateY(200px) translateZ(-500px) rotateX(45deg); 
          }
          60% {
            transform: translateY(-20px) translateZ(50px) rotateX(-10deg);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) translateZ(0) rotateX(0); 
          }
        }
      `}</style>

      {/* Background Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-blue/70 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2070" 
          alt="Background"
          className="w-full h-full object-cover opacity-40"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-30">
        {/* Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <h2 className="text-5xl font-extrabold text-white mb-6 tracking-tight">
            Next-Gen <span className="text-[#FD6309]">Logistics</span> Features
          </h2>
           <div className="flex justify-center">
          <div className="w-24 h-4 border-t-4 border-[#FD6309] rounded-t-full"></div>
        </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" style={{ perspective: '1200px' }}>
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 
                         hover:bg-white/10 transition-all duration-300
                         ${isVisible ? 'card-animate' : 'opacity-0'}`}
              style={{ 
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Floating Icon */}
              <div className={`w-14 h-14 mb-6 rounded-2xl bg-gradient-to-br ${feature.color} 
                              flex items-center justify-center text-white shadow-lg 
                              group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500`}>
                {React.cloneElement(feature.icon, { size: 28 })}
              </div>

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Glow */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 blur-2xl transition-opacity`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};    

export default FeaturesSection;