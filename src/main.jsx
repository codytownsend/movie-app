// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import AuthWrapper from './components/AuthWrapper'
import { checkRequiredEnvVars } from './utils/envChecker'

// Add some global styles
import './styles/animations.css'

// Check environment variables on startup
checkRequiredEnvVars();

// Log the current environment
console.log(`Running in ${import.meta.env.MODE} mode`);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AppProvider>
        <AuthWrapper>
          <App />
        </AuthWrapper>
      </AppProvider>
    </AuthProvider>
  </StrictMode>,
)