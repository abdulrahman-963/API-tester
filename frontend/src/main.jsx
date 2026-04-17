import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import keycloak from './keycloak.js'

// Initialize Keycloak ONCE before mounting React.
// This prevents StrictMode's double-useEffect from calling init() twice,
// which would consume the auth code and cause an infinite redirect loop.
keycloak
  .init({
    onLoad: 'check-sso',
    checkLoginIframe: false,
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
  })
  .then(() => {
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  })
