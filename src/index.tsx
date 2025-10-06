// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './Root';      // Your Router component file
import 'react-datepicker/dist/react-datepicker.css'; // global styles for datepicker

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
