import React from 'react'

import Hero from "../../components/landingpageComponents/Hero"
// import AnimationHero from "../Components/AnimationHero"
import OurServices from "../../components/landingpageComponents/OurServices"
import MeetsOurTeam from "../../components/landingpageComponents/MeetsOurTeam"
import ClientTestimonials from "../../components/landingpageComponents/ClientTestimonials"
import FreightServices from "../../components/landingpageComponents/FreightServices"
// import Footer from "../../components/landingpageComponents/Footer"
// import Navbar from "../../components/landingpageComponents/Navbar"
import LoadCalculatorHero from "../../components/landingpageComponents/LoadCalculatorHero"
import TrackShipment from "../../components/landingpageComponents/TrackShipment"
import LoadPost from "../../components/landingpageComponents/LoadPost"
import FeaturesSection from "../../components/landingpageComponents/FeaturesSection"
import Features from "../../components/landingpageComponents/Features"


const Landingpage = () => {
  return (
    <div>
      {/* <Navbar /> */}
      <Hero />
      {/* <AnimationHero /> */}
      <OurServices />
     
      <LoadCalculatorHero />
      <FeaturesSection />
       <Features />
      <LoadPost />
      <MeetsOurTeam />
       <TrackShipment />
      <ClientTestimonials />
      <FreightServices />
      {/* <Footer /> */}
    </div>
  )
}

export default Landingpage
