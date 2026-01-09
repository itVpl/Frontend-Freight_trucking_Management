import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Phone,
  Mail,
  MoveRight
} from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleEnter = (name) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenDropdown(name);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <div className="fixed top-0 left-0 w-full z-[1000]">
      {/* Top Utility Bar */}
      <div
        className={`bg-orange-400 text-white transition-all duration-500 overflow-hidden ${
          isScrolled ? "h-0" : "h-10"
        }`}
      >
        <div className="container mx-auto px-6 h-full flex justify-between items-center text-[10px] uppercase tracking-[0.2em] font-medium">
          <div className="flex gap-8">
            <a
              href="mailto:contact@vpower-logistics.com"
              className="flex items-center gap-2 hover:opacity-80"
            >
              <Mail className="w-3 h-3 text-[#0356A2]" />
              contact@vpower-logistics.com
            </a>
          </div>
          <div className="flex gap-6">
            <a href="tel:+919310023990">Call: +91 9310023990</a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`transition-all duration-500 ${
          isScrolled ? "bg-white shadow-2xl py-2" : "bg-white/95 py-0"
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img
                src="/vpl_logo.png"
                alt="Logo"
                className={`transition-all duration-500 object-contain ${
                  isScrolled ? "h-14" : "h-20"
                }`}
              />
            </Link>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center">
              <div className="flex items-center border-r border-slate-100">
                {["Home", "AboutUs", "Services", "ContactUs"].map((link) => (
                  <Link
                    key={link}
                    to={`/${link.toLowerCase()}`}
                    className="px-5 text-[13px] font-black uppercase tracking-widest text-slate-800 hover:text-[#0356A2] transition-all relative group"
                  >
                    {link === "AboutUs"
                      ? "About"
                      : link === "ContactUs"
                      ? "Contact"
                      : link}
                    <span className="absolute bottom-[-24px] left-0 w-0 h-1 bg-[#0356A2] transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Action Section */}
            <div className="flex items-center gap-4">
              {!isLoggedIn ? (
                <>
                  {/* 🔥 Carrier Login Button */}
                  <Link to="/login" className="hidden lg:block">
                    <button className="bg-white border-2 border-slate-800 cursor-pointer text-slate-800 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-slate-800 hover:text-white transition-all shadow-[6px_6px_0px_rgba(30,41,59,0.15)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                      Carrier Login
                    </button>
                  </Link>

                  {/* Client Login Button */}
                  <Link to="/login" className="hidden lg:block">
                    <button className="bg-slate-800 cursor-pointer text-white px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-slate-700 transition-all shadow-[6px_6px_0px_rgba(30,41,59,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                      Client Login
                    </button>
                  </Link>
                </>
              ) : (
                <div
                  className="relative"
                  onMouseEnter={() => handleEnter("user")}
                  onMouseLeave={handleLeave}
                >
                  <button className="flex items-center gap-2 bg-slate-100 px-4 py-3 rounded font-bold text-xs uppercase tracking-widest cursor-pointer">
                    <User className="w-4 h-4 text-[#0356A2]" /> Account
                  </button>
                  {openDropdown === "user" && (
                    <div className="absolute right-0 top-full pt-2 w-48">
                      <div className="bg-white border-t-4 border-[#0356A2] shadow-2xl py-2">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Link to="/scheduleademo" className="hidden lg:block">
                <button className="bg-[#FF7F50] cursor-pointer text-white px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-[6px_6px_0px_rgba(255,127,80,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                  Schedule a Demo
                </button>
              </Link>

              <Link to="/contactus">
                <button className="bg-[#0356A2] cursor-pointer text-white px-8 py-3 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-[6px_6px_0px_rgba(3,86,162,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                  Get a Quote
                </button>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden text-slate-900 ml-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
