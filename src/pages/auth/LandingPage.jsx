import React, { useEffect, useRef, useState } from "react";
import logo from "../../../public/images/logo_vpower.png";
import groupphoto from "../../assets/Icons super admin/Groupphoto.png"; // <- aapka image import

/** ====== TUNING ====== **/
const SPEED_SLOW = 22;  // seconds per loop (bigger = slower)
const STAGGER = 5;      // 0s, 5s, 10s start gaps (max 3 trucks)

const LandingPage = () => {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  // ESC + body scroll lock while modal is open
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setIsDemoOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = isDemoOpen ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isDemoOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eaf3ff] to-white text-slate-800">
      {/* NAVBAR */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="logo" width={100} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDemoOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#2563eb]/20 hover:translate-y-[-1px] transition"
            >
              Schedule a Demo
            </button>
            <a
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-white shadow-sm"
            >
              <span className="inline-block h-6 w-6 rounded-full bg-slate-900 text-white grid place-items-center text-[12px]">•</span>
              Login
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="home" className="relative overflow-hidden">
        <WavyRibbonBackground />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 lg:pt-16 pb-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Copy */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                Providing the Safest
                <br />
                Logistics Solutions
                <br />
                <span className="text-slate-900">with Integrity</span>
              </h1>

              <p className="mt-5 text-slate-600 text-base sm:text-lg max-w-xl">
                Cargo’s efficiency, connectivity, and global reach ensure seamless
                logistics, timely deliveries, and robust international trade, driving
                economic growth and innovation.
              </p>

              <div className="mt-8">
                <a
                  onClick={() => setIsDemoOpen(true)}
                  className="group inline-flex items-center gap-3 rounded-full bg-[#2563eb] px-6 py-3 text-white font-semibold shadow-lg shadow-[#2563eb]/20 hover:translate-y-[-1px] transition"
                  style={{ cursor: "pointer" }}
                >
                  Schedule a Demo
                  <span className="grid place-items-center h-8 w-8 rounded-full bg-white/20 border border-white/30">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-0.5 transition">
                      <path d="M5 12h14M13 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </a>
              </div>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-3 max-w-lg gap-6">
                <div>
                  <div className="text-3xl font-extrabold">3.5x</div>
                  <div className="text-sm text-slate-500">Faster than others</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold">30%</div>
                  <div className="text-sm text-slate-500">Cheaper Costs</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold">10+</div>
                  <div className="text-sm text-slate-500">Years of Experience</div>
                </div>
              </div>
            </div>

            {/* Illustration */}
<div className="relative">
  <img
        src={groupphoto}                // <- aapka image import
        alt="VPower logistics illustration"
        loading="lazy"
        className="h-full w-full object-contain"
        
      />
</div>

          </div>
        </div>

        {/* soft blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-[#cfe1ff] blur-3xl opacity-60" />
          <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-[#d8ebff] blur-3xl opacity-60" />
        </div>
      </section>

      {/* QUICK LINKS */}
      <section id="service" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Global Freight", desc: "Sea, Air & Land forwarding" },
            { title: "Real-time Tracking", desc: "Live status & notifications" },
            { title: "Load Calculator", desc: "Plan capacity with precision" },
            { title: "Transparent Pricing", desc: "No surprises, only savings" },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition">
              <div className="font-semibold">{item.title}</div>
              <div className="text-sm text-slate-500 mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-8 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} Vpower Logistics — All rights reserved.</p>
          <div className="flex items-center gap-4 text-sm">
            <a className="hover:underline" href="#privacy">Privacy</a>
            <a className="hover:underline" href="#terms">Terms</a>
            <a className="hover:underline" href="#contact">Contact</a>
          </div>
        </div>
      </footer>

      {/* DEMO MODAL */}
      <DemoModal open={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  );
};


/** ====== POPUP: Schedule a Demo (FREE APIs: RESTCountries + CountriesNow) ====== */
const DemoModal = ({ open, onClose }) => {
  const [revealExtra, setRevealExtra] = useState(false);
  const [companyType, setCompanyType] = useState("");

  // Country/State (FREE)
  const [countries, setCountries] = useState([]);     // [{name, iso2}]
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [countriesErr, setCountriesErr] = useState("");

  const [countryIso2, setCountryIso2] = useState("");
  const [countryName, setCountryName] = useState("");

  const [states, setStates] = useState([]);           // [{name}]
  const [statesLoading, setStatesLoading] = useState(false);
  const [statesErr, setStatesErr] = useState("");
  const [stateVal, setStateVal] = useState("");

  const handleAnyFocus = () => setRevealExtra(true);
  const handleCompanyChange = (e) => {
    setCompanyType(e.target.value);
    setRevealExtra(true);
  };

  // ---------- FREE-ONLY PROVIDERS ----------
  async function getCountries() {
    // Try cache first (avoid repeated network calls)
    const cached = localStorage.getItem("free_countries_v1");
    if (cached) {
      try { return JSON.parse(cached); } catch {}
    }

    const res = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2");
    if (!res.ok) throw new Error(`RESTCountries ${res.status}`);
    const data = await res.json(); // [{name:{common}, cca2}]
    const list = data
      .map(c => ({ name: c?.name?.common ?? "", iso2: c?.cca2 ?? "" }))
      .filter(c => c.name)
      .sort((a, b) => a.name.localeCompare(b.name));

    try { localStorage.setItem("free_countries_v1", JSON.stringify(list)); } catch {}
    return list;
  }

  async function getStatesByCountryName(name) {
    // Try cache by name
    const key = `free_states_${name}`;
    const cached = localStorage.getItem(key);
    if (cached) {
      try { return JSON.parse(cached); } catch {}
    }

    // CountriesNow (free, no key)
    const res = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: name }),
    });
    if (!res.ok) throw new Error(`CountriesNow ${res.status}`);
    const data = await res.json(); // {data:{states:[{name}]}}
    const list = (data?.data?.states ?? []).map(s => ({ name: s.name }));

    try { localStorage.setItem(key, JSON.stringify(list)); } catch {}
    return list;
  }

  // Load countries when modal opens
  useEffect(() => {
    if (!open) return;
    setCountriesLoading(true);
    setCountriesErr("");
    getCountries()
      .then(setCountries)
      .catch((e) => setCountriesErr(e.message || "Failed to load countries"))
      .finally(() => setCountriesLoading(false));
  }, [open]);

  // Fetch states when country changes
  useEffect(() => {
    if (!countryName) {
      setStates([]); setStateVal(""); setStatesErr("");
      return;
    }
    setStatesLoading(true);
    setStatesErr("");
    getStatesByCountryName(countryName)
      .then(setStates)
      .catch((e) => setStatesErr(e.message || "Failed to load states"))
      .finally(() => setStatesLoading(false));
  }, [countryName]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // const payload = Object.fromEntries(new FormData(e.currentTarget)); // if needed
    alert("Thanks! We'll reach out shortly.");
    onClose();
  };

  const isCarrier = companyType === "Carrier" || companyType === "Carrier + Broker";
  const isBroker  = companyType === "Broker"  || companyType === "Carrier + Broker";
  const showState = states.length > 0;

  return (
    <div aria-hidden={!open} aria-modal="true" role="dialog" className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Dialog (no overflow-hidden; chip visible) */}
      <div className="relative mx-4 w-full max-w-xl rounded-2xl bg-white shadow-2xl">
        {/* Blue outline + glow */}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-[#2563eb]" />
        <div className="absolute -inset-2 rounded-3xl bg-[#2563eb]/5 blur-xl pointer-events-none" />

        {/* Top chip title */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
          <div className="rounded-full bg-white px-5 py-2 text-[#2563eb] font-semibold shadow-md ring-1 ring-[#2563eb]/40">
            Schedule a Demo
          </div>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Scroll container */}
        <div className="relative max-h-[80vh] overflow-y-auto pt-8">
          <form onSubmit={handleSubmit} className="relative p-6 sm:p-8 pt-0 space-y-4">
            {/* ===== Basic fields ===== */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                onFocus={() => setRevealExtra(true)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb]"
                placeholder="you@company.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  onFocus={() => setRevealExtra(true)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb]"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  onFocus={() => setRevealExtra(true)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb]"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                required
                onFocus={() => setRevealExtra(true)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb]"
                placeholder="+91 98XXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="company"
                required
                onFocus={() => setRevealExtra(true)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb]"
                placeholder="Lotina Logistics"
              />
            </div>

            {/* ===== Extra fields (slide down) ===== */}
            <div
              className={`transition-all duration-300 overflow-hidden ${
                revealExtra ? "max-h-[2000px] opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
              }`}
            >
              <div className="space-y-4 pt-2">
                {/* Company Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    How would you best describe your company? <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="companyType"
                    required
                    value={companyType}
                    onChange={handleCompanyChange}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb]"
                  >
                    <option value="" disabled>Please Select</option>
                    <option value="Carrier">Carrier</option>
                    <option value="Broker">Broker</option>
                    <option value="Carrier + Broker">Carrier + Broker</option>
                  </select>
                </div>

                {/* Carrier ⇒ Number of Drivers */}
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    (companyType === "Carrier" || companyType === "Carrier + Broker") ? "max-h-48 opacity-100 mt-1" : "max-h-0 opacity-0 mt-0"
                  }`}
                >
                  <label className="block text-sm font-medium text-slate-700">
                    Number of Drivers <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="numberOfDrivers"
                    min={0}
                    required={companyType === "Carrier" || companyType === "Carrier + Broker"}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb]"
                  />
                </div>

                {/* Broker ⇒ Loads last year */}
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    (companyType === "Broker" || companyType === "Carrier + Broker") ? "max-h-48 opacity-100 mt-1" : "max-h-0 opacity-0 mt-0"
                  }`}
                >
                  <label className="block text-sm font-medium text-slate-700">
                    Approximately how many loads did your company move in the past year? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="loadsLastYear"
                    min={0}
                    required={companyType === "Broker" || companyType === "Carrier + Broker"}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb]"
                  />
                </div>

                {/* Country (FREE) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="country"
                    required
                    value={countryIso2 || countryName}
                    onChange={(e) => {
                      const val = e.target.value;
                      const found = countries.find(c => c.iso2 === val) || countries.find(c => c.name === val);
                      setCountryIso2(found?.iso2 || "");
                      setCountryName(found?.name || val);
                      setStateVal("");
                    }}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb]"
                  >
                    <option value="" disabled>{countriesLoading ? "Loading..." : "Please Select"}</option>
                    {countries.map((c) => (
                      <option key={c.iso2 || c.name} value={c.iso2 || c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {countriesErr && <p className="mt-1 text-xs text-red-600">Couldn’t load countries: {countriesErr}</p>}
                </div>

                {/* State (FREE) */}
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    countryName ? "max-h-48 opacity-100 mt-1" : "max-h-0 opacity-0 mt-0"
                  }`}
                >
                  <label className="block text-sm font-medium text-slate-700">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="state"
                    required={showState}
                    disabled={statesLoading || !showState}
                    value={stateVal}
                    onChange={(e) => setStateVal(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb]"
                  >
                    <option value="" disabled>
                      {statesLoading ? "Loading..." : showState ? "Please Select" : "No states found"}
                    </option>
                    {states.map((s) => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                  {statesErr && <p className="mt-1 text-xs text-red-600">Couldn’t load states: {statesErr}</p>}
                </div>

                {/* How did you hear about us? */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    How did you hear about us? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="hearAbout"
                    required
                    rows={3}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] resize-y"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-b from-[#2f6af0] to-[#1f53d8] py-3 font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.35)] active:translate-y-[1px]"
              >
                Schedule a Demo
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};





/** ====== SINGLE PATH ROAD + 3 TRUCKS (rotate + on-track) ====== */
const WavyRibbonBackground = () => {
  return (
    <svg
      className="absolute inset-0 z-0 pointer-events-none"
      viewBox="0 0 1200 700"
      preserveAspectRatio="none"
      role="img"
      aria-label="Single road path with trucks moving"
    >
      <defs>
        {/* filters */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>

        {/* soft shadow gradient */}
        <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>

        {/* road edges color */}
        <linearGradient id="roadEdge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#cfe2ff" /><stop offset="100%" stopColor="#b9f3bf" />
        </linearGradient>

        {/* PATH */}
        <path
          id="roadPath"
          d="
            M -60,220
            C 160,80   360,80   520,195
            S 840,330  1040,230
            S 1180,120 1260,180
          "
        />

        {/* truck artwork */}
        <g id="truckArtwork">
          <ellipse cx="0" cy="50" rx="78" ry="10" fill="url(#shadowGrad)" opacity="0.40" />
          <g>
            <rect x="-40" y="-15" width="150" height="46" rx="7" fill="#1e40af" />
            <rect x="-40" y="-15" width="150" height="8" fill="#4275ff" opacity="0.35" />
            {Array.from({ length: 11 }).map((_, i) => (
              <rect key={i} x={-34 + i * 12} y="-13" width="3" height="42" fill="#0f2e81" opacity="0.40" />
            ))}
            <rect x="104" y="-15" width="2" height="46" fill="#0a1b3f" opacity="0.6" />
            <rect x="110" y="24" width="6" height="6" rx="2" fill="#ff6b6b" />
            <rect x="118" y="24" width="6" height="6" rx="2" fill="#ff6b6b" />
          </g>
          <rect x="-46" y="10" width="8" height="12" rx="2" fill="#222" />
          <g>
            <rect x="-100" y="-5" width="54" height="32" rx="7" fill="#0b1220" />
            <rect x="-74" y="-5" width="2" height="32" fill="#1b2433" opacity="0.6" />
            <rect x="-96" y="-1" width="24" height="16" rx="3" fill="#a9c7de" />
            <rect x="-108" y="4" width="10" height="12" rx="2" fill="#dfe5ea" stroke="#5f6b74" strokeWidth="1" />
            <rect x="-60" y="18" width="6" height="4" rx="2" fill="#ffd089" />
          </g>
          <g>
            <g>
              <circle cx="-58" cy="33" r="11.5" fill="#1f2937" />
              <circle cx="-58" cy="33" r="5.8" fill="#9ca3af" />
              <animateTransform attributeName="transform" type="rotate" from="0 -58 33" to="360 -58 33" dur="1.05s" repeatCount="indefinite" />
            </g>
            <g>
              <circle cx="-36" cy="35" r="12.5" fill="#1f2937" />
              <circle cx="-36" cy="35" r="6" fill="#9ca3af" />
              <animateTransform attributeName="transform" type="rotate" from="0 -36 35" to="360 -36 35" dur="0.98s" repeatCount="indefinite" />
            </g>
            <g>
              <circle cx="32" cy="35" r="12.5" fill="#1f2937" />
              <circle cx="32" cy="35" r="6" fill="#9ca3af" />
              <animateTransform attributeName="transform" type="rotate" from="0 32 35" to="360 32 35" dur="0.95s" repeatCount="indefinite" />
            </g>
            <g>
              <circle cx="52" cy="35" r="12.5" fill="#1f2937" />
              <circle cx="52" cy="35" r="6" fill="#9ca3af" />
              <animateTransform attributeName="transform" type="rotate" from="0 52 35" to="360 52 35" dur="0.95s" repeatCount="indefinite" />
            </g>
          </g>
        </g>

        {/* symbol aligned so wheels touch the path */}
        <symbol id="truckRight" viewBox="-110 -55 220 110">
          <g transform="scale(-1,1) translate(0,-48)">
            <use href="#truckArtwork" />
          </g>
        </symbol>
      </defs>

      {/* ROAD visuals */}
      <use href="#roadPath" stroke="url(#roadEdge)" strokeWidth="24" fill="none" filter="url(#glow)" opacity="0.25" />
      <use href="#roadPath" stroke="url(#roadEdge)" strokeWidth="12" fill="none" opacity="0.9" />
      <use href="#roadPath" stroke="#ffffff" strokeWidth="3" strokeDasharray="20 22" fill="none" opacity="0.7" />

      {/* 3 TRUCKS: on-track + rotate */}
      <use href="#truckRight" width="72" height="36">
        <animateMotion dur={`${SPEED_SLOW}s`} repeatCount="indefinite" rotate="auto" begin="0s">
          <mpath href="#roadPath" />
        </animateMotion>
      </use>

      <use href="#truckRight" width="78" height="39" opacity="0.98">
        <animateMotion dur={`${SPEED_SLOW}s`} repeatCount="indefinite" rotate="auto" begin={`${STAGGER}s`}>
          <mpath href="#roadPath" />
        </animateMotion>
      </use>

      <use href="#truckRight" width="84" height="42" opacity="1">
        <animateMotion dur={`${SPEED_SLOW}s`} repeatCount="indefinite" rotate="auto" begin={`${STAGGER * 2}s`}>
          <mpath href="#roadPath" />
        </animateMotion>
      </use>
    </svg>
  );
};

export default LandingPage;
