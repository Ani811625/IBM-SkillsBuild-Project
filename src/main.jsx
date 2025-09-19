import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initServiceWorker } from './utils/serviceWorker.js'

// Initialize the app
const root = createRoot(document.getElementById('root'))

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Initialize service worker for offline support
initServiceWorker().then((success) => {
  if (success) {
    console.log('🚀 Recipe Finder ready for offline use!');
  }
}).catch((error) => {
  console.error('Service Worker initialization error:', error);
});
