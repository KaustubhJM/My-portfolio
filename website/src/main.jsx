import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { animate, lowPower } from './lib/motion';
import App from './App';
import './styles.css';

window.inkReady = true; // tells the <head> fallback that JS loaded
// Reduced motion: drop the hidden start states so everything simply shows
if (!animate) document.documentElement.classList.remove('js');
if (lowPower) document.documentElement.classList.add('low-power');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
