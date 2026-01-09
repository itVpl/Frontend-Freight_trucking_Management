import React, { useState, useEffect } from 'react';
import StepHeader from './StepHeader';
import ShipmentType from './ShipmentType';
import ShipperDetails from './ShipperDetails';
import ReceiverDetails from './ReceiverDetails';
import PaymentOptions from './PaymentOptions';
import ThankYou from './ThankYou';

const totalSteps = 4; // Excluding Thank You page

const ShipmentForm = () => {
  // ✅ Load from localStorage
  const [currentStep, setCurrentStep] = useState(() => {
    const savedStep = localStorage.getItem('currentStep');
    return savedStep ? Number(savedStep) : 1;
  });

  const [formData, setFormData] = useState(() => {
    const savedForm = localStorage.getItem('formData');
    return savedForm ? JSON.parse(savedForm) : {};
  });

  // ✅ Persist progress
  useEffect(() => {
    localStorage.setItem('currentStep', currentStep);
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [currentStep, formData]);

  const handleNext = (newData = {}) => {
    const updatedData = { ...formData, ...newData };
    setFormData(updatedData);
    setCurrentStep(prev => (prev < totalSteps + 1 ? prev + 1 : prev));
  };

  const handleBack = () => {
    setCurrentStep(prev => (prev > 1 ? prev - 1 : prev));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ShipmentType onNext={handleNext} initialData={formData} />;
      case 2:
        return <ShipperDetails onNext={handleNext} onBack={handleBack} initialData={formData} />;
      case 3:
        return <ReceiverDetails onNext={handleNext} onBack={handleBack} initialData={formData} />;
      case 4:
        return <PaymentOptions onNext={handleNext} onBack={handleBack} initialData={formData} />;
      case 5:
        // ✅ Reset after completion
        localStorage.removeItem('currentStep');
        localStorage.removeItem('formData');
        return <ThankYou />;
      default:
        return <div>Error: Invalid Step</div>;
    }
  };

  return (
    <div className=" mt-4 md:mt-12 bg-gray-100 flex items-start justify-center p-8">  
      <div className="w-full max-w-4xl mt-12">
        {currentStep <= totalSteps && (
          <div className="bg-white p-6 h-16 md:h-24 rounded-lg shadow-md mb-4"> 
            <StepHeader currentStep={currentStep} totalSteps={totalSteps} />
          </div>
        )}
        
        <div className="bg-white p-8 rounded-lg shadow-xl"> 
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default ShipmentForm;
