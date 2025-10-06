import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { Line, Bar } from 'react-chartjs-2';
import { FundConfig, NAVEntry, ChartType } from '../types';
import { filterAndDownsample, parseDate } from '../utils/navUtils';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

type Props = { funds: FundConfig[]; categories: string[] };
type PercentageNavEntry = { date: string; value: number };

function calculatePercentageChange(navData: NAVEntry[]): PercentageNavEntry[] {
  if (!navData.length) return [];
  const baseNav = navData[0].nav;
  return navData.map(d => ({ date: d.date, value: ((d.nav - baseNav) / baseNav) * 100 }));
}

const fieldBox = {
  display: 'flex', alignItems: 'center', marginBottom: '1rem',
  width: { xs: '100%', sm: '45%' }
};
const labelStyle = { width: 130, minWidth: 130, fontSize: '1rem', marginRight: 8 };

const ComparisonPage: React.FC<Props> = ({ funds, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0] ?? '');
  const [frequency, setFrequency] = useState<'daily'|'weekly'|'monthly'>('weekly');
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
        const navData: NAVEntry[] = Array.isArray(json.data) ? json.data.map((i:any)=>({date:i.date, nav:parseFloat(i.nav)})) : [];
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

  const datasets = Object.entries(comparisonData).map(([name, data], idx) => {
    const map = new Map(data.map(d => [d.date, d.value]));
    const points = labels.map(l => map.has(l) ? map.get(l) : null);
    const color = `hsl(${(idx*70)%360},70%,50%)`;
    return { label: name, data: points, fill:false, backgroundColor: color, borderColor: color, spanGaps:true };
  });

  const chartData = { labels, datasets };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Paper elevation={2} sx={{ p: 4, width: '100%', maxWidth: 1100 }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '1.5rem', fontFamily: 'inherit' }}>
          Mutual Fund NAV % Change Comparison
        </div>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: '2rem', rowGap: '1rem', mb: 2 }}>
          <Box sx={fieldBox}>
            <label style={labelStyle}>Select Category:</label>
            <select
              style={{ width: 200, height: 32, fontSize: '1rem' }}
              value={selectedCategory}
              onChange={e=>setSelectedCategory(String(e.target.value))}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Box>
          <Box sx={fieldBox}>
            <label style={labelStyle}>Select Frequency:</label>
            <select
              style={{ width: 200, height: 32, fontSize: '1rem' }}
              value={frequency}
              onChange={e => setFrequency(e.target.value as any)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: '2rem', rowGap: '1rem', mb: 2 }}>
          <Box sx={fieldBox}>
            <label style={labelStyle}>Select Date Range:</label>
            <DatePicker
              selectsRange
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              onChange={u=>setDateRange(u as [Date|null,Date|null])}
              isClearable
              dateFormat="dd-MM-yyyy"
              maxDate={new Date()}
              wrapperClassName="date-range-picker"
              customInput={
                <input style={{ width: 160, height: 28, fontSize: '1rem', paddingLeft: 6 }} />
              }
            />
          </Box>
          <Box sx={fieldBox}>
            <label style={labelStyle}>Select Chart Type:</label>
            <select
              style={{ width: 200, height: 32, fontSize: '1rem' }}
              value={chartType}
              onChange={e=>setChartType(e.target.value as ChartType)}
            >
              <option value="line">Line</option>
              <option value="bar">Bar</option>
            </select>
          </Box>
        </Box>
        <Box mt={3} sx={{ width: '100%' }}>
          {loading ? <div style={{ fontSize: '1rem' }}>Loading data…</div>
            : (datasets.length > 0
              ? (chartType === 'line' ? <Line data={chartData} /> : <Bar data={chartData} />)
              : <div style={{ fontSize: '1rem' }}>No data found for selected filters.</div>)}
        </Box>
      </Paper>
    </Box>
  );
};

export default ComparisonPage;
