import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register Service Worker for offline & instant Android/iOS updates
registerSW({
  immediate: true,
  onOfflineReady() {
    // App assets precached for offline usage
  },
});

createRoot(document.getElementById('root')!).render(<App />);
