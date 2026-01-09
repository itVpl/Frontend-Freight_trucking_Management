import React from 'react'
import PartnersSection from "../../components/landingpageComponents/Services/PartnersSection"
import LogixServices from '../../components/landingpageComponents/Services/LogixServices'
import Process from "../../components/landingpageComponents/Services/Process"
 import StreamlineLogistics from "../../components/landingpageComponents/Services/StreamlineLogistics"

const Services = () => {
  return (
      <div>
          <PartnersSection />
          <LogixServices />
          <Process />
          <StreamlineLogistics/>
    </div>
  )
}

export default Services