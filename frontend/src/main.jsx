import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// React adds page tags instead of replacing existing ones, so drop the static copies first.
document.querySelectorAll('[data-static-seo]').forEach((el) => el.remove())

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
