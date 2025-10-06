// src/Root.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App, { AppProps } from './App';
import fundConfig from './config/funds.json';
import { FundConfig } from './types';

// Root that provides funds state and renders App.
// NOTE: keep Root as default export only if your index.tsx imports it.

const RootComponent: React.FC = () => {
  const [funds, setFunds] = React.useState<FundConfig[]>(fundConfig);
  const categories = Array.from(new Set(funds.map(f => f.category)));

  return (
    <Router>
      <Routes>
        <Route path="/" element={<App funds={funds} setFunds={setFunds} />} />
        <Route path="/compare" element={<App funds={funds} setFunds={setFunds} />} />
      </Routes>
    </Router>
  );
};

export default RootComponent;
