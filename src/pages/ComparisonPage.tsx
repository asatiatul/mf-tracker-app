import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { Line, Bar } from 'react-chartjs-2';
import { FundConfig, NAVEntry, ChartType } from '../types';
import { filterAndDownsample, parseDate } from '../utils/navUtils';
import CustomDateRangePicker from "../components/DateRangePicker";

type Props = { funds: FundConfig[]; categories: string[] };
type PercentageNavEntry = { date: string; value: number };

function calculatePercentageChange(navData: NAVEntry[]): PercentageNavEntry[] {
  if (!navData.length) return [];
  const baseNav = navData[0].nav;
  return navData.map(d => ({ date: d.date, value: ((d.nav - baseNav) / baseNav) * 100 }));
}

const INPUT_WIDTH = 400;
const INPUT_HEIGHT = 44;

const ComparisonPage: React.FC<Props> = ({ funds, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0] ?? '');
  const [frequency, setFrequency] = useState<'daily'|'weekly'|'monthly'>('daily');
  const [dateRange, setDateRange] = useState<[Date|null,Date|null]>([null,null]);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [comparisonData, setComparisonData] = useState<Record<string, PercentageNavEntry[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dateRange[0] || !dateRange[1] || !selectedCategory) return;
    const list = funds.filter(f => f.category === selectedCategory);
    if (!list.length) { setComparisonData({}); return; }
    setLoading(true);
    Promise.all(
      list.map(async fund => {
        const res = await fetch(`https://api.mfapi.in/mf/${fund.code}`);
        const json = await res.json();
        const navData: NAVEntry[] = Array.isArray(json.data)
          ? json.data.map((i:any)=>({date:i.date, nav:parseFloat(i.nav)})) : [];
        const filtered = filterAndDownsample(navData, frequency, dateRange[0]!, dateRange[1]!);
        const pct = calculatePercentageChange(filtered);
        return { fundName: fund.name, data: pct };
      })
    ).then(results => {
      const rec: Record<string, PercentageNavEntry[]> = {};
      results.forEach(r => rec[r.fundName] = r.data);
      setComparisonData(rec);
      setLoading(false);
    }).catch(()=>{ setComparisonData({}); setLoading(false);});
  }, [funds, selectedCategory, frequency, dateRange]);

  const labelsSet = new Set<string>();
  Object.values(comparisonData).forEach(arr => arr.forEach(e=>labelsSet.add(e.date)));
  const labels = Array.from(labelsSet).sort((a,b)=>parseDate(a).getTime()-parseDate(b).getTime());

  const COLOR_PALETTE = [
    "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
    "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe",
    "#008080", "#e6beff", "#9a6324", "#fffac8", "#800000",
    "#aaffc3", "#808000", "#ffd8b1", "#000075", "#808080"
  ];
  
  const datasets = Object.entries(comparisonData).map(([name, data], idx) => {
    const map = new Map(data.map(d => [d.date, d.value]));
    const points = labels.map(l => map.has(l) ? map.get(l) : null);
    const color = COLOR_PALETTE[idx % COLOR_PALETTE.length];
    return {
      label: name,
      data: points,
      fill: false,
      borderColor: color,
      backgroundColor: color,
      spanGaps: true,
      pointRadius: 3,
      borderWidth: 2,
    };
  });

  // const datasets = Object.entries(comparisonData).map(([name, data], idx) => {
  //   const map = new Map(data.map(d => [d.date, d.value]));
  //   const points = labels.map(l => map.has(l) ? map.get(l) : null);
  //   const color = idx === 0 ? 'red' : 'green';
  //   return {
  //     label: name,
  //     data: points,
  //     fill: false,
  //     backgroundColor: color,
  //     borderColor: color,
  //     spanGaps: true
  //   };
  // });

  const chartData = { labels, datasets };

  return (
    <div className="card">
      <h2>📈 Mutual Fund NAV % Change Comparison</h2>
      <form className="form-grid" style={{ gridTemplateColumns: `repeat(4, minmax(${INPUT_WIDTH}px, 1fr))` }}>
        <div className="form-group">
          <label>Select Category:</label>
          <select
            style={{ width: INPUT_WIDTH, height: INPUT_HEIGHT, fontSize: "1.05rem", paddingLeft: 12 }}
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Select Frequency:</label>
          <select
            style={{ width: INPUT_WIDTH, height: INPUT_HEIGHT, fontSize: "1.05rem", paddingLeft: 12 }}
            value={frequency}
            onChange={e => setFrequency(e.target.value as any)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="form-group">
          <label>Select Date Range:</label>
          <CustomDateRangePicker
            value={dateRange}
            onChange={setDateRange}
            inputStyle={{ width: 240, height: INPUT_HEIGHT, fontSize: "1.05rem", paddingLeft: 12 }}
            inputClassName="datepicker-input"
          />
          {/* <DatePicker
            selectsRange
            startDate={dateRange[0]}
            endDate={dateRange[1]}
            onChange={v=>setDateRange(v as [Date|null,Date|null])}
            isClearable
            dateFormat="dd-MM-yyyy"
            maxDate={new Date()}
            customInput={
              <input
                className="datepicker-input"
                style={{
                  width: INPUT_WIDTH,
                  height: INPUT_HEIGHT,
                  fontSize: '1.05rem',
                  paddingLeft: 12
                }}
              />
            }
          /> */}
        </div>
        <div className="form-group">
          <label>Select Chart Type:</label>
          <select
            style={{ width: INPUT_WIDTH, height: INPUT_HEIGHT, fontSize: "1.05rem", paddingLeft: 12 }}
            value={chartType}
            onChange={e=>setChartType(e.target.value as ChartType)}
          >
            <option value="line">Line</option>
            <option value="bar">Bar</option>
          </select>
        </div>
      </form>
      <div className="chart-container">
        {loading ? (
          <span>Loading data…</span>
        ) : datasets.length > 0 ? (
          chartType === "line" ? (
            <Line data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true } }
              }}
            />
          ) : (
            <Bar data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true } }
              }}
            />
          )
        ) : (
          <span>No data found for selected filters.</span>
        )}
      </div>
    </div>
  );
};

export default ComparisonPage;
