// src/Root.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import ComparisonPage from './pages/ComparisonPage';

const Root: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/compare" element={<ComparisonPage />} />
    </Routes>
  </Router>
);

export default Root;
