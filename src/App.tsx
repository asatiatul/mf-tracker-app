import React from "react";
import FundConfigUploader from "./components/FundConfigUploader";
import FundDashboard from "./components/FundDashboard";
import ComparisonPage from "./pages/ComparisonPage";
import { FundConfig } from "./types";
import './custom-layout.css';

export interface AppProps {
  funds: FundConfig[];
  setFunds: React.Dispatch<React.SetStateAction<FundConfig[]>>;
}

const App: React.FC<AppProps> = ({ funds, setFunds }) => {
  const [tab, setTab] = React.useState(0);
  const categories = Array.from(new Set(funds.map(f => f.category)));

  return (
    <div className="container">
      <nav className="navbar">
        <div
          className={`nav-item${tab === 0 ? ' active' : ''}`}
          onClick={() => setTab(0)}
        >
          NAV Tracker
        </div>
        <div
          className={`nav-item${tab === 1 ? ' active' : ''}`}
          onClick={() => setTab(1)}
        >
          Fund Category Comparison
        </div>
      </nav>
      <div className="upload-section">
        <FundConfigUploader onConfigUpload={setFunds} />
      </div>
      {tab === 0 &&
        <FundDashboard funds={funds} />
      }
      {tab === 1 &&
        <ComparisonPage funds={funds} categories={categories} />
      }
    </div>
  );
};

export default App;
