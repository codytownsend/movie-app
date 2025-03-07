// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import AuthWrapper from './components/AuthWrapper'
import { checkRequiredEnvVars } from './utils/envChecker'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'

// Add some global styles
import './styles/animations.css'

// Check environment variables on startup
checkRequiredEnvVars();

// Log the current environment
console.log(`Running in ${import.meta.env.MODE} mode`);

// Determine if we should use touch backend
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
const dndBackend = isTouchDevice ? TouchBackend : HTML5Backend;

// Options for touch backend to enable touch to drag
const touchBackendOptions = {
  enableMouseEvents: true,
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DndProvider backend={dndBackend} options={isTouchDevice ? touchBackendOptions : undefined}>
      <AuthProvider>
        <AppProvider>
          <AuthWrapper>
            <App />
          </AuthWrapper>
        </AppProvider>
      </AuthProvider>
    </DndProvider>
  </StrictMode>,
)