import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { AppProvider } from './contexts/AppContext'
import { BotProvider } from './contexts/BotContext'
import { TelegramProvider } from './contexts/TelegramContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TelegramProvider>
      <AppProvider>
        <BotProvider>
          <App />
        </BotProvider>
      </AppProvider>
    </TelegramProvider>
  </React.StrictMode>
)
