import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!clientId) {
    console.error("Google Client ID is missing. Check .env configuration.");
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        {clientId ? (
            <GoogleOAuthProvider clientId={clientId}>
                <App />
            </GoogleOAuthProvider>
        ) : (
            <App />
        )}
    </StrictMode>,
)
