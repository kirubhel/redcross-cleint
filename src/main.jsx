import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onRegisteredSW(swScriptUrl) {
      console.log('Service Worker registered:', swScriptUrl)
    },
    onOfflineReady() {
      console.log('App ready for offline use')
    },
    onRegisterError(error) {
      console.error('Service Worker registration error:', error)
    }
  })
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)



