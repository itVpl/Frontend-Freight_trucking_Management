import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landingpage from './pages/Landingpage';
import AboutUs from './pages/AboutUs';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
// import { PiChatsCircleBold } from "react-icons/pi";
import ContactUs from "./pages/ContactUs"
import ShippingSelector from "./pages/ShippingSelector"
import Login from './pages/Login';
import ShipmentForm from './Components/Shipping/ShipmentForm';
import ShipmentType from './Components/Shipping/ShipmentType';
import ShipperDetails from './Components/Shipping/ShipperDetails';
import StepHeader from './Components/Shipping/StepHeader';
import ReceiverDetails from './Components/Shipping/ReceiverDetails';
import ThankYou from './Components/Shipping/ThankYou';
import PaymentOptions from './Components/Shipping/PaymentOptions';
import SignUp from "./pages/SignUp"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import Services from "./pages/Services"
import OTPValidationForm from "./pages/OTPValidationForm"
import ScheduleADemo from "./pages/ScheduleADemo"

const App = () => {
  return (
    <Router>
      {/* Navbar should be visible on all pages */}
      <Navbar />

      {/* Define all page routes */}
      <Routes>
        <Route path="/" element={<Landingpage />} />
        <Route path="/login" element={<Login />} />
         <Route path="/signup" element={<SignUp />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/forgetpassword" element={<ForgotPasswordPage />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/shippingselector" element={<ShippingSelector />} />
        <Route path="/services" element={<Services />} />
        <Route path="/otpvalidation" element={<OTPValidationForm />} />
        <Route path="/scheduleademo" element={<ScheduleADemo />} />
        
        {/*Shipiing page routes */}
        <Route path="/ShipmentForm" element={<ShipmentForm />} />
        <Route path="/ShipmentType" element={<ShipmentType />} />
         <Route path="/ShipperDetails" element={<ShipperDetails />} />
        <Route path="/StepHeader" element={<StepHeader />} />
         <Route path="/ReceiverDetails" element={<ReceiverDetails />} />
        <Route path="/ThankYou" element={<ThankYou />} />
         <Route path="/PaymentOptions" element={<PaymentOptions />} />
        
      </Routes>

      {/* Footer should be visible on all pages */}
      <Footer />
    <div>
  <div className="fixed bottom-24 z-99 right-6 p-3 bg-white rounded-full shadow-2xl border-2 border-gray-100 cursor-pointer">
    <div className="w-12 h-12 flex items-center justify-center rounded-full">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="36"
        height="36"
        viewBox="0 0 26 26"
        className="text-[#0356A2]"
        fill="currentColor"
      >
        <path d="M10 0C4.547 0 0 3.75 0 8.5c0 2.43 1.33 4.548 3.219 6.094a4.8 4.8 0 0 1-.969 2.25a14 14 0 0 1-.656.781a2.5 2.5 0 0 0-.313.406c-.057.093-.146.197-.187.407s.015.553.187.812l.125.219l.25.125c.875.437 1.82.36 2.688.125c.867-.236 1.701-.64 2.5-1.063S8.401 17.792 9 17.469c.084-.045.138-.056.219-.094C10.796 19.543 13.684 21 16.906 21c.031.004.06 0 .094 0c1.3 0 5.5 4.294 8 2.594c.1-.399-2.198-1.4-2.313-4.375c1.957-1.383 3.22-3.44 3.22-5.719c0-3.372-2.676-6.158-6.25-7.156C18.526 2.664 14.594 0 10 0m0 2c4.547 0 8 3.05 8 6.5S14.547 15 10 15c-.812 0-1.278.332-1.938.688s-1.417.796-2.156 1.187c-.64.338-1.25.598-1.812.781c.547-.79 1.118-1.829 1.218-3.281l.032-.563l-.469-.343C3.093 12.22 2 10.423 2 8.5C2 5.05 5.453 2 10 2" />
      </svg>
    </div>
  </div>
</div>

    </Router>

   
  );
};

export default App;
