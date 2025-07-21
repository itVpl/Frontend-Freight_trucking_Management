import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global Alertify setup
import alertify from 'alertifyjs';
import 'alertifyjs/build/css/alertify.css';
import 'alertifyjs/build/css/themes/default.css';

// Configure Alertify defaults
alertify.set('notifier', 'position', 'top-right');
alertify.set('notifier', 'delay', 4);

// Make alertify globally available
window.alertify = alertify;

// Add custom CSS for better styling
const customAlertifyCSS = `
  .ajs-message {
    border-radius: 8px !important;
    font-weight: 500 !important;
    font-size: 14px !important;
    padding: 12px 16px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    border: none !important;
  }
  
  .ajs-error {
    background: linear-gradient(135deg, #ff6b6b, #ee5a52) !important;
    color: white !important;
  }
  
  .ajs-success {
    background: linear-gradient(135deg, #51cf66, #40c057) !important;
    color: white !important;
  }
  
  .ajs-warning {
    background: linear-gradient(135deg, #ffd43b, #fcc419) !important;
    color: #333 !important;
  }
  
  .ajs-info {
    background: linear-gradient(135deg, #74c0fc, #4dabf7) !important;
    color: white !important;
  }
  
  .ajs-close {
    color: rgba(255, 255, 255, 0.8) !important;
    font-size: 18px !important;
    font-weight: bold !important;
  }
  
  .ajs-close:hover {
    color: white !important;
  }
  
  .ajs-message.ajs-warning .ajs-close {
    color: rgba(0, 0, 0, 0.6) !important;
  }
  
  .ajs-message.ajs-warning .ajs-close:hover {
    color: #333 !important;
  }
`;

// Inject custom CSS
const style = document.createElement('style');
style.textContent = customAlertifyCSS;
document.head.appendChild(style);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
