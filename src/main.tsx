import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { assertRequiredEnv } from './config/env'

document.documentElement.classList.add('dark')

assertRequiredEnv()

createRoot(document.getElementById('root')!).render(
    <App />
)
