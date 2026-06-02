import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeSampleData } from './data/sampleData'

// Initialize sample data for testing
initializeSampleData();

createRoot(document.getElementById("root")!).render(<App />);
