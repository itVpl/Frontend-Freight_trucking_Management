import React, { createContext, useState, useContext } from 'react';

const NegotiationContext = createContext();

export const useNegotiation = () => {
  return useContext(NegotiationContext);
};

export const NegotiationProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [negotiationData, setNegotiationData] = useState(null);

  const openNegotiation = (data) => {
    setNegotiationData(data);
    setIsOpen(true);
  };

  const closeNegotiation = () => {
    setIsOpen(false);
    setNegotiationData(null);
  };

  const value = {
    isOpen,
    negotiationData,
    openNegotiation,
    closeNegotiation
  };

  return (
    <NegotiationContext.Provider value={value}>
      {children}
    </NegotiationContext.Provider>
  );
};
