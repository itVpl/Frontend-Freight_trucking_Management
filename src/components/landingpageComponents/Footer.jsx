import React from 'react';
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaLinkedinIn, FaYoutube, FaInstagram, FaFacebookF, FaChevronRight } from 'react-icons/fa';

const FooterLink = ({ href, children }) => (
  <li>
    <a
      href={href}
      className="text-gray-400 hover:text-[#Fd6309] transition-all duration-300 text-sm flex items-center group"
    >
      <FaChevronRight className="text-[10px] mr-2 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all duration-300" />
      {children}
    </a>
  </li>
);

const Footer = () => {
  return (
    <footer className="w-full font-sans">
      {/* === LAYER 1: THE BRAND BAR === 
          White background ensures logo is perfectly visible and professional.
      */}
      <div className="bg-white border-t-4 border-[#Fd6309] py-1 shadow-sm">
        <div className="container mx-auto px-6 lg:px-16 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <img
              src="/vpl_logo.png"
              alt="V Power Logistics"
              className="h-16 md:h-30 w-auto object-contain"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
             {/* Replace these with partner icons or trust badges if you have them */}
             <span className="text-lg font-bold tracking-[0.3em] text-gray-800 uppercase">AIR Freight</span>
             <span className="text-lg font-bold tracking-[0.3em] text-gray-800 uppercase">OCEAN Freight</span>
             <span className="text-lg font-bold tracking-[0.3em] text-gray-800 uppercase">ROAD Freight</span>
          </div>
        </div>
      </div>

      {/* === LAYER 2: THE MAIN CONTENT (DEEP NAVY) === */}
      <div className="bg-[#0b121f] text-white pt-16 pb-12 relative overflow-hidden">
        {/* Subtle decorative background truck */}
        <img 
          src="/truccc.png" 
          alt="" 
          className="absolute right-0 bottom-0 h-full opacity-5 pointer-events-none grayscale invert"
        />

        <div className="relative container mx-auto px-6 lg:px-16 z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            
            {/* Reach Us Column */}
            <div className="space-y-6">
              <h4 className="text-[#Fd6309] font-bold text-xs uppercase tracking-[0.4em] mb-8">Reach Us</h4>
              <div className="space-y-6">
                <div className="flex gap-4 group">
                  <FaMapMarkerAlt className="text-[#Fd6309] mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">India HQ</p>
                    <p className="text-sm text-gray-300 leading-relaxed">C-14, Udyog Vihar Phase V, Gurugram, 122008</p>
                  </div>
                </div>
                <div className="flex gap-4 group border-t border-gray-800 pt-6">
                  <FaMapMarkerAlt className="text-[#Fd6309] mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">USA Branch</p>
                    <p className="text-sm text-gray-300 leading-relaxed">100 N Howard St E R, Spokane WA, 99201</p>
                    <p className="text-sm text-gray-300 leading-relaxed mt-1">53 Frontage Rd, 1st Floor,Hampton, New Jersey 08827</p>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                <a href="mailto:contact@vpower-logistics.com" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <FaEnvelope className="text-[#Fd6309]" /> contact@vpower-logistics.com
                </a>
              </div>
              <div className="flex gap-4">
                <a href="tel:+919310023990" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <FaPhoneAlt className="text-[#Fd6309]" /> +91 9310023990
                </a>
              </div>
              </div>
            </div>

            {/* Quick Navigation */}
            <div>
              <h4 className="text-[#Fd6309] font-bold text-xs uppercase tracking-[0.4em] mb-8">Company</h4>
              <ul className="space-y-4">
                <FooterLink href="#">Home</FooterLink>
                <FooterLink href="#">About Our Vision</FooterLink>
                <FooterLink href="#">Service Portfolio</FooterLink>
                <FooterLink href="#">Career Hub</FooterLink>
                <FooterLink href="#">Track Shipments</FooterLink>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-[#Fd6309] font-bold text-xs uppercase tracking-[0.4em] mb-8">Logistics</h4>
              <ul className="space-y-4">
                <FooterLink href="#">Air Freight Solutions</FooterLink>
                <FooterLink href="#">Surface Transport</FooterLink>
                <FooterLink href="#">Global Warehousing</FooterLink>
                <FooterLink href="#">Customs & Compliance</FooterLink>
                <FooterLink href="#">E-commerce Logistics</FooterLink>
              </ul>
            </div>

            {/* Newsletter / Contact */}
            <div className="space-y-8">
              <h4 className="text-[#Fd6309] font-bold text-xs uppercase tracking-[0.4em] mb-8">Newsletter</h4>
              <p className="text-sm text-gray-400">Get the latest global logistics news and industry updates.</p>
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="Email Address"
                  className="w-full bg-white/5 border-b-2 border-gray-800 px-0 py-3 text-sm focus:outline-none focus:border-[#Fd6309] transition-all"
                />
                <button className="absolute right-0 bottom-3 text-[#Fd6309] font-bold text-xs uppercase hover:tracking-widest transition-all">
                  Join
                </button>
              </div>
              
            </div>

          </div>
        </div>
      </div>

      {/* === LAYER 3: SOCIAL & LEGAL (BLACK) === */}
      <div className="bg-[#05080f] py-8 border-t border-gray-900">
        <div className="container mx-auto px-6 lg:px-16 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-6">
            <a href="#" className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center text-white hover:bg-[#Fd6309] hover:border-[#Fd6309] transition-all">
              <FaLinkedinIn size={14} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center text-white hover:bg-[#Fd6309] hover:border-[#Fd6309] transition-all">
              <FaYoutube size={14} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center text-white hover:bg-[#Fd6309] hover:border-[#Fd6309] transition-all">
              <FaInstagram size={14} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center text-white hover:bg-[#Fd6309] hover:border-[#Fd6309] transition-all">
              <FaFacebookF size={14} />
            </a>
          </div>
          
          <div className="text-[10px] font-bold tracking-[0.2em] text-gray-600 uppercase flex flex-wrap justify-center gap-6">
            <span>© 2026 V Power Logistics</span>
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Use</a>
            <a href="#" className="hover:text-white">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;