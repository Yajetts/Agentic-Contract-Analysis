import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Light mode by default (removed dark mode class)

createRoot(document.getElementById("root")!).render(<App />);
