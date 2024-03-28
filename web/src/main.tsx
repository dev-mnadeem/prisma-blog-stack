import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// Self-hosted faces, loaded here so the stylesheet stays plain style rules.
import '@fontsource/source-serif-4/400.css';
import '@fontsource/source-serif-4/600.css';
import '@fontsource/source-sans-3/400.css';
import '@fontsource/source-sans-3/600.css';
import './styles/global.scss';

const container = document.getElementById('root');
if (!container) {
  throw new Error('index.html is missing the #root element');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
