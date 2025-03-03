import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import AuthWrapper from './components/AuthWrapper'

// Add some global styles
import './styles/animations.css'

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