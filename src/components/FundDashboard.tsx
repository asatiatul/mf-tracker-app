import React, { useState, useEffect } from "react";
import { FundConfig, NAVEntry } from "../types";
import FundSelector from "./FundSelector";
import FrequencySelector from "./FrequencySelector";
import CustomDateRangePicker from "./DateRangePicker";
import ChartTypeSelector from "./ChartTypeSelector";
import NAVChart from "./NAVChart";
import { filterAndDownsample } from "../utils/navUtils";

interface Props { funds: FundConfig[] }

const INPUT_WIDTH = 400;
const INPUT_HEIGHT = 44;

const FundDashboard: React.FC<Props> = ({ funds }) => {
  const [selectedFund, setSelectedFund] = useState<string>(funds[0]?.code || '');
  const [navFrequency, setNavFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [navData, setNavData] = useState<NAVEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState<'line'|'bar'|'pie'>('line');

  useEffect(() => {
    if (!dateRange[0] || !dateRange[1] || !selectedFund) return;
    setLoading(true);
    fetch(`https://api.mfapi.in/mf/${selectedFund}`).then(res => res.json()).then(json => {
      const data = Array.isArray(json.data)
        ? json.data.map((item: any) => ({ date: item.date, nav: parseFloat(item.nav) }))
        : [];
      const filtered = filterAndDownsample(data, navFrequency, dateRange[0], dateRange[1]);
      setNavData(filtered);
      setLoading(false);
    });
  }, [selectedFund, navFrequency, dateRange, funds]);

  return (
    <div className="card">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 27 }}>
        <span role="img" aria-label="chart">📊</span> Mutual Fund NAV Chart Dashboard
      </h2>
      <form
        className="form-grid"
        style={{ gridTemplateColumns: `repeat(4, minmax(${INPUT_WIDTH}px, 1fr))`, marginBottom: 0 }}
      >
        <div className="form-group">
          <label>Select Fund:</label>
          <FundSelector
            funds={funds}
            selected={selectedFund}
            onChange={setSelectedFund}
          />
        </div>
        <div className="form-group">
          <label>Frequency:</label>
          <FrequencySelector
            value={navFrequency}
            onChange={setNavFrequency}
          />
        </div>
        <div className="form-group">
          <label>Date Range:</label>
          <CustomDateRangePicker
            value={dateRange}
            onChange={setDateRange}
            inputStyle={{ width: 240, height: INPUT_HEIGHT, fontSize: "1.05rem", paddingLeft: 12 }}
            inputClassName="datepicker-input"
          />
        </div>
        <div className="form-group">
          <label>Chart Type:</label>
          <ChartTypeSelector
            value={chartType}
            onChange={setChartType}
          />
        </div>
      </form>
      <div className="chart-container">
        {loading
          ? <span>Loading NAV data…</span>
          : <NAVChart data={navData} fund={funds.find(f => f.code === selectedFund)} chartType={chartType} />
        }
      </div>
    </div>
  );
};

export default FundDashboard;
