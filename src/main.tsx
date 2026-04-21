import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// StrictMode entfernt, damit p5.js nur einmal startet
createRoot(document.getElementById('root')!).render(
  <App />
)