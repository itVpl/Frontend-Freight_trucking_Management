import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../landingpageComponents/Navbar';
import Footer from '../landingpageComponents/Footer';

const PublicLayout = () => {
  return (
    <div className="public-layout">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
