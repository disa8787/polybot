import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { AppProvider } from './contexts/AppContext'
import { initTelegram } from './lib/telegram'
import './index.css'

// Initialize Telegram Web App (theme, expand, etc.)
initTelegram()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
)
