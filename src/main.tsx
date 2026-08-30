import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Leaflet's stylesheet is bundled rather than pulled from a CDN. Without it,
// markers and tiles lose their absolute positioning and the map renders as a
// broken stack, so a CDN outage or a blocked network would silently break the
// only view that matters.
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
