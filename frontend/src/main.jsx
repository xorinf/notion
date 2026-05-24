import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// Set axios base URL — all API calls go through vite proxy
axios.defaults.baseURL = '/api'
axios.defaults.withCredentials = true

// Initialize socket connection lazily (will connect when user logs in)
// import { useSocket } from '../store/socketStore.js'
// Connection is now handled in authStore.js upon successful login/auth

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
