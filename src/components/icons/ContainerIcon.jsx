import React from 'react';
import { SvgIcon } from '@mui/material';

const ContainerIcon = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      {/* Container - isometric view with corrugated sides and double doors */}
      
      {/* Left side (visible) with corrugated vertical lines */}
      <path
        d="M3 7 L3 19 L11 23 L11 11 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Corrugated vertical lines on left side */}
      <path d="M5 9 L5 19" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 10 L7 19" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M9 11 L9 19" fill="none" stroke="currentColor" strokeWidth="1.2" />
      
      {/* Front face with double doors */}
      <path
        d="M11 11 L19 7 L19 19 L11 23 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Vertical divider for double doors */}
      <path d="M15 11 L15 23" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* Horizontal door frame lines */}
      <path d="M11 15 L19 11" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M11 19 L19 15" fill="none" stroke="currentColor" strokeWidth="1" />
      
      {/* Top edge */}
      <path d="M3 7 L11 11 L19 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </SvgIcon>
  );
};

export default ContainerIcon;

