// ComparisonPage.tsx
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import fundsConfig from '../config/funds.json'; 
import { FundConfig, NAVEntry, ChartType } from '../types';
import { filterAndDownsample, parseDate } from '../utils/navUtils';
import { Link } from 'react-router-dom';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const categories = Array.from(new Set(fundsConfig.map(f => f.category)));

type PercentageNavEntry = {
  date: string;
  value: number;  // percentage change from start date NAV
};

function calculatePercentageChange(navData: NAVEntry[]): PercentageNavEntry[] {
  if (navData.length === 0) return [];
  const baseNav = navData[0].nav;
  return navData.map(d => ({
    date: d.date,
    value: ((d.nav - baseNav) / baseNav) * 100,
  }));
}

const ComparisonPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [comparisonData, setComparisonData] = useState<Record<string, PercentageNavEntry[]>>({});
  const [loading, setLoading] = useState(false);

  // Fetch NAV data and calculate percentage change for all funds in selected category
  useEffect(() => {
    if (!dateRange[0] || !dateRange[1]) return;

    const funds = fundsConfig.filter(f => f.category === selectedCategory);
    setLoading(true);

    Promise.all(
      funds.map(async (fund) => {
        const res = await fetch(`https://api.mfapi.in/mf/${fund.code}`);
        const json = await res.json();
        const navData: NAVEntry[] = json.data.map((item: any) => ({ date: item.date, nav: parseFloat(item.nav) }));

        // Filter and downsample
        const filteredData = filterAndDownsample(navData, frequency, dateRange[0], dateRange[1]);

        // Calculate percentage change
        const pctChangeData = calculatePercentageChange(filteredData);

        return { fundName: fund.name, data: pctChangeData };
      })
    ).then(results => {
      const record: Record<string, PercentageNavEntry[]> = {};
      results.forEach(r => {
        record[r.fundName] = r.data;
      });
      setComparisonData(record);
      setLoading(false);
    });
  }, [selectedCategory, frequency, dateRange]);

  // Prepare chart data to plot multiple datasets (one per fund)

  const labelsSet = new Set<string>();
  Object.values(comparisonData).forEach(arr => arr.forEach(entry => labelsSet.add(entry.date)));
  const labels = Array.from(labelsSet).sort((a, b) => parseDate(a).getTime() - parseDate(b).getTime());

  const datasets = Object.entries(comparisonData).map(([fundName, data], idx) => {
    // Map nav % change to match all labels with null for missing dates
    const dataMap = new Map(data.map(d => [d.date, d.value]));
    const dataPoints = labels.map(label => (dataMap.has(label) ? dataMap.get(label) : null));

    // Generate color
    const color = `hsl(${(idx * 70) % 360},70%,50%)`;

    return {
      label: fundName,
      data: dataPoints,
      fill: false,
      backgroundColor: color,
      borderColor: color,
      spanGaps: true,
    };
  });

  const chartData = {
    labels,
    datasets,
  };

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 20, fontFamily: 'Arial' }}>
      <h2>Mutual Fund NAV % Change Comparison</h2>
      <Link to="/" style={{ display: 'inline-block', marginBottom: 20 }}>
        Back to Home
       </Link>
      <label>
        Select Category:<br />
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={{width:'100%', padding:8, marginBottom:20}}>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </label>

      <label>
        Select Frequency:<br/>
        <select value={frequency} onChange={e => setFrequency(e.target.value as any)} style={{width:'100%', padding:8, marginBottom:20}}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </label>

      <label>
        Select Date Range:<br/>
        <DatePicker selectsRange startDate={dateRange[0]} endDate={dateRange[1]} onChange={update => setDateRange(update)} isClearable={true}
          dateFormat="dd-MM-yyyy" maxDate={new Date()} showMonthDropdown showYearDropdown dropdownMode="select"/>
      </label>

      <label>
        Select Chart Type:<br/>
        <select value={chartType} onChange={e => setChartType(e.target.value as ChartType)} style={{width:'100%', padding:8, marginBottom:20}}>
          <option value="line">Line</option>
          <option value="bar">Bar</option>
          <option value="pie">Pie</option>
        </select>
      </label>

      <div>
        {loading && <p>Loading data, please wait...</p>}
        {!loading && datasets.length > 0 && (chartType === 'line' || chartType === 'bar') && (
          chartType === 'line' ? <Line data={chartData} /> : <Bar data={chartData} />
        )}
        {/* Pie chart comparisons of % change over time are not as meaningful and not implemented */}
        {!loading && datasets.length === 0 && <p>No data found for selected filters.</p>}
      </div>
    </div>
  );
};

export default ComparisonPage;
