import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Modern animations
import {
  Calendar, Clock, User, Mail, Building2, Phone, CheckCircle2, Globe, MapPin, 
  ShieldCheck, ChevronRight, LayoutGrid, ExternalLink, BarChart3, Zap, 
  Truck, Plus, Minus, Star, ZapOff, Fingerprint, Layers, Lock, Award, Briefcase
} from "lucide-react";

// --- Animation Variants (Settings) ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function ScheduleADemo() {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", company: "", 
    phone: "", location: "", date: "", time: "",
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [loadingGeodata, setLoadingGeodata] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  // Data Fetching
  useEffect(() => {
    fetch("https://countriesnow.space/api/v0.1/countries/positions")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setCountries(data.data.sort((a, b) => a.name.localeCompare(b.name)));
        }
      })
      .catch(err => console.error("Error fetching countries:", err));
  }, []);

  useEffect(() => {
    if (!selectedCountry) return;
    setLoadingGeodata(true);
    const countryObj = countries.find(c => c.iso2 === selectedCountry);
    if (countryObj) {
      fetch("https://countriesnow.space/api/v0.1/countries/states", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: countryObj.name })
      })
        .then((res) => res.json())
        .then((data) => {
          setStates(!data.error ? data.data.states : []);
          setLoadingGeodata(false);
        })
        .catch(() => setLoadingGeodata(false));
    }
  }, [selectedCountry, countries]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "country") {
      setSelectedCountry(value);
      setFormData(prev => ({ ...prev, location: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const countryName = countries.find(c => c.iso2 === selectedCountry)?.name || "";
    const dataToSend = {
      _subject: `New Demo Request: ${formData.firstName} ${formData.lastName}`,
      _template: "table",
      _captcha: "false",
      ...formData,
      country: countryName
    };

    try {
      const response = await fetch("https://formsubmit.co/ajax/contact@vpower-logistics.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(dataToSend)
      });
      if (response.ok) {
        setSubmitted(true);
        setFormData({ firstName: "", lastName: "", email: "", company: "", phone: "", location: "", date: "", time: "" });
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, icon: Icon, ...props }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3b82f6] transition-colors">
          <Icon size={18} />
        </div>
        {props.type === "select" ? (
          <select {...props} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 outline-none focus:border-[#3b82f6] focus:ring-4 focus:ring-blue-50 transition-all appearance-none cursor-pointer">{props.children}</select>
        ) : (
          <input {...props} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 outline-none focus:border-[#3b82f6] focus:ring-4 focus:ring-blue-50 transition-all" />
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-blue-100 scroll-smooth overflow-x-hidden">
      
      {/* 1. Navigation */}
      <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-200 px-6 py-4 sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col cursor-pointer group" 
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          >
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black text-[#3b82f6]">V</span>
              <span className="text-2xl font-black text-[#f97316]">/</span>
              <span className="text-2xl font-black text-[#334155]">PL</span>
            </div>
            <span className="text-[10px] font-bold tracking-[0.3em] text-slate-400 uppercase leading-none group-hover:text-blue-500 transition-colors">Logistics</span>
          </motion.div>
          
          <div className="hidden md:flex gap-10 text-[13px] font-bold text-slate-600 uppercase tracking-widest">
            {["features", "trust", "faq"].map((item) => (
              <a key={item} href={`#${item}`} className="hover:text-blue-600 transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </a>
            ))}
          </div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-slate-900 text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-blue-600 transition-all shadow-lg"
          >
            Client Login
          </motion.button>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-28 grid lg:grid-cols-2 gap-20 items-center">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-blue-50 text-[#3b82f6] px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.15em] mb-8 border border-blue-100">
            <ShieldCheck size={14} className="fill-current" /> ISO 27001 Certified Platform
          </motion.div>
          <motion.h1 variants={fadeInUp} className="text-6xl lg:text-[84px] font-black text-[#0f172a] leading-[0.95] mb-8 tracking-tighter">
            Smart Logistics. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Zero Friction.</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-xl text-slate-500 leading-relaxed mb-10 max-w-lg font-medium">
            The world's most advanced logistics operating system. Reduce spend by <span className="text-slate-900 font-bold underline decoration-blue-500">14% on average</span>.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-6 max-w-md">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-blue-900/5">
              <p className="text-3xl font-black text-blue-600">$4.2B+</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Freight Managed</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-orange-900/5">
              <p className="text-3xl font-black text-orange-500">99.9%</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Uptime SLA</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Schedule Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-orange-50 rounded-[40px] blur-2xl opacity-50 -z-10"></div>
          <div className="bg-white border border-slate-200 rounded-[32px] shadow-2xl overflow-hidden">
            <div className="bg-[#0f172a] p-10 text-white relative overflow-hidden">
              <motion.div 
                animate={{ x: [0, 10, 0] }} 
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute top-0 right-0 p-8 opacity-20"
              >
                <Truck size={80} />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">Schedule A Demo</h3>
              <p className="text-slate-400 text-sm">Join Logistics supply chain leaders.</p>
            </div>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-20 text-center"
                >
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"
                  >
                    <CheckCircle2 size={48} />
                  </motion.div>
                  <h2 className="text-3xl font-black text-slate-900">Meeting Requested</h2>
                  <p className="text-slate-500 mt-3 mb-10 text-lg">Our team will contact you shortly.</p>
                  <button onClick={() => setSubmitted(false)} className="px-10 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">Go Back</button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} className="p-10 space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <InputField label="First Name" name="firstName" icon={User} placeholder="Jane" required value={formData.firstName} onChange={handleChange} />
                    <InputField label="Last Name" name="lastName" icon={User} placeholder="Smith" required value={formData.lastName} onChange={handleChange} />
                  </div>
                  <InputField label="Corporate Email" name="email" type="email" icon={Mail} placeholder="jane@global-logistics.com" required value={formData.email} onChange={handleChange} />
                  
                  <div className="grid grid-cols-2 gap-5">
                    <InputField label="Region" name="country" type="select" icon={Globe} required value={selectedCountry} onChange={handleChange}>
                      <option value="">Select Country</option>
                      {countries.map(c => <option key={c.iso2} value={c.iso2}>{c.name}</option>)}
                    </InputField>
                    <InputField label={loadingGeodata ? "Loading..." : "State/Prov"} name="location" type="select" icon={MapPin} required value={formData.location} onChange={handleChange} disabled={!selectedCountry}>
                      <option value="">Select State</option>
                      {states.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                    </InputField>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <InputField label="Preferred Date" name="date" type="date" icon={Calendar} required value={formData.date} onChange={handleChange} />
                    <InputField label="Time Window" name="time" type="select" icon={Clock} required value={formData.time} onChange={handleChange}>
                      <option value="">Select Time</option>
                      <option value="09:00 AM">Morning (09:00 AM)</option>
                      <option value="02:00 PM">Afternoon (02:00 PM)</option>
                    </InputField>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 mt-4 group"
                  >
                    {loading ? "Processing..." : (
                      <>Schedule A Demo <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-[40px] font-black mb-6 tracking-tight text-slate-900">Built for Enterprise <br /> <span className="text-blue-600">Reliability.</span></h2>
            <div className="h-1.5 w-24 bg-blue-600 mx-auto rounded-full"></div>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-10"
          >
            {[
              { icon: Briefcase, title: "Carrier Governance", desc: "Automated verification of carrier safety ratings.", color: "bg-blue-600" },
              { icon: Layers, title: "Unified Command", desc: "One glass pane for air, ocean, LTL, and FTL.", color: "bg-indigo-600" },
              { icon: BarChart3, title: "Cost Recovery AI", desc: "Neural network scans and initiates refund claims.", color: "bg-orange-600" }
            ].map((feat, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                whileHover={{ y: -15 }}
                className="group p-12 bg-slate-50 rounded-[40px] hover:bg-white border border-transparent hover:border-slate-200 transition-all hover:shadow-2xl"
              >
                <div className={`${feat.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-white shadow-lg`}>
                  <feat.icon size={32} />
                </div>
                <h4 className="text-2xl font-black mb-4 text-slate-900">{feat.title}</h4>
                <p className="text-slate-500 leading-relaxed font-medium">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Trust Section */}
      <div id="trust" className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-black mb-8 leading-tight">The industry standard.</h2>
              <div className="space-y-8">
                {["18% Average spend reduction", "2,500+ Audit checkpoints", "Global network integration"].map((text, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                    key={i} 
                    className="flex items-center gap-4"
                  >
                    <div className="bg-blue-500 rounded-full p-1"><CheckCircle2 size={18} /></div>
                    <span className="text-xl font-bold text-slate-300">{text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 p-12 rounded-[48px] border border-white/10 backdrop-blur-sm"
            >
              <div className="flex gap-1 text-orange-400 mb-8">
                {[1,2,3,4,5].map(s => <Star key={s} size={24} fill="currentColor" />)}
              </div>
              <p className="text-2xl font-medium text-slate-200 italic mb-10 leading-relaxed">
                "VPL didn't just give us software; they gave us a competitive advantage."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-full flex items-center justify-center font-black text-xl">MD</div>
                <div>
                  <h5 className="font-black text-xl">Marcus Davies</h5>
                  <p className="text-sm text-blue-400 font-bold tracking-widest uppercase">Director, NexaCorp</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="py-32 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black mb-4">Support & FAQ</h2>
            <p className="text-slate-500 font-medium">Everything you need to know.</p>
          </motion.div>
          <div className="space-y-4">
            {[
              { q: "Implementation time?", a: "Most clients are integrated within 14-21 days with zero downtime." },
              { q: "Does it replace brokers?", a: "No, it works alongside them to provide real-time transparency and cost auditing." },
              { q: "Is data secure?", a: "Yes, we are SOC2 Type II compliant with banking-grade AES-256 encryption." }
            ].map((faq, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-slate-100 overflow-hidden"
              >
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)} 
                  className="w-full px-8 py-6 flex justify-between items-center text-left font-bold text-lg hover:bg-slate-50 transition-colors"
                >
                  <span className={activeFaq === i ? "text-blue-600" : "text-slate-900"}>{faq.q}</span>
                  <motion.div animate={{ rotate: activeFaq === i ? 180 : 0 }}>
                    {activeFaq === i ? <Minus size={20} className="text-blue-600" /> : <Plus size={20} className="text-slate-400" />}
                  </motion.div>
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-8 pb-8 text-slate-500 leading-relaxed overflow-hidden"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}