// src/App.tsx
import React, { useEffect, useState } from "react";
import fundConfig from "./config/funds.json";
import { FundConfig, NAVEntry } from "./types";
import FundConfigUploader from "./components/FundConfigUploader";
import FundSelector from "./components/FundSelector";
import FrequencySelector from "./components/FrequencySelector";
import CustomDateRangePicker from "./components/DateRangePicker";
import ChartTypeSelector from "./components/ChartTypeSelector";
import NAVChart from "./components/NAVChart";
import { filterAndDownsample } from "./utils/navUtils";
import { Link } from 'react-router-dom';

const App: React.FC = () => {
  const [funds, setFunds] = useState<FundConfig[]>(fundConfig);
  const [selectedFund, setSelectedFund] = useState<string>(fundConfig[0]?.code);
  const [navFrequency, setNavFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [navData, setNavData] = useState<NAVEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState<"line" | "bar" | "pie">("line");


  const fetchNAVData = async (schemeCode: string) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
      const json = await res.json();
      return json.data.map((item: any) => ({
        date: item.date,
        nav: parseFloat(item.nav),
      }));
    } catch {
      alert("Error fetching NAV data.");
      return [];
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!dateRange[0] || !dateRange[1]) return;
    if (!selectedFund) return;


    fetchNAVData(selectedFund).then((data) => {
      const filtered = filterAndDownsample(data, navFrequency, dateRange[0], dateRange[1]);
      setNavData(filtered);
    });
  }, [selectedFund, navFrequency, dateRange]);


  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
      <h3>Mutual Fund NAV Chart Dashboard</h3>
      
      <Link to="/compare" style={{ display: 'inline-block', marginBottom: 20 }}>
        Go to Comparison Page
      </Link>

      <FundConfigUploader onConfigUpload={cfg => setFunds(cfg)} />


      <FundSelector
        funds={funds}
        selected={selectedFund}
        onChange={setSelectedFund}
      />
      <FrequencySelector value={navFrequency} onChange={setNavFrequency} />
      <CustomDateRangePicker value={dateRange} onChange={setDateRange} />
      <ChartTypeSelector value={chartType} onChange={setChartType} />


      {loading ? (
        <p>Loading NAV data…</p>
      ) : (
        <NAVChart
          data={navData}
          fund={funds.find((f) => f.code === selectedFund)}
          chartType={chartType}
        />
      )}
    </div>
  );
};


export default App;
