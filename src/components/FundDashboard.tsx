import React, { useState, useEffect } from "react";
import { FundConfig, NAVEntry } from "../types";
import FundSelector from "./FundSelector";
import FrequencySelector from "./FrequencySelector";
import CustomDateRangePicker from "./DateRangePicker";
import ChartTypeSelector from "./ChartTypeSelector";
import NAVChart from "./NAVChart";
import { filterAndDownsample } from "../utils/navUtils";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

interface Props { funds: FundConfig[] }

const FundDashboard: React.FC<Props> = ({ funds }) => {
  const [selectedFund, setSelectedFund] = useState<string>(funds[0]?.code || '');
  const [navFrequency, setNavFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [navData, setNavData] = useState<NAVEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState<'line'|'bar'|'pie'>('line');

  useEffect(() => {
    if (!dateRange[0] || !dateRange[1] || !selectedFund) return;
    setLoading(true);
    fetch(`https://api.mfapi.in/mf/${selectedFund}`).then(res => res.json()).then(json => {
      const data = Array.isArray(json.data) ? json.data.map((item: any) => ({
        date: item.date, nav: parseFloat(item.nav)
      })) : [];
      const filtered = filterAndDownsample(data, navFrequency, dateRange[0], dateRange[1]);
      setNavData(filtered);
      setLoading(false);
    });
  }, [selectedFund, navFrequency, dateRange, funds]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Paper elevation={2} sx={{ p: 4, width: '100%', maxWidth: 1100 }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '1.5rem', fontFamily: 'inherit' }}>
          Mutual Fund NAV Chart Dashboard
        </div>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: '2rem', rowGap: '1rem', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', sm: '45%' }, mb: 2 }}>
            {/* <label style={{ width: 130, minWidth: 130, fontSize: '1rem', marginRight: 8 }}>Select Fund:</label> */}
            <FundSelector funds={funds} selected={selectedFund || ''} onChange={v=>setSelectedFund(v)} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', sm: '45%' }, mb: 2 }}>
            {/* <label style={{ width: 130, minWidth: 130, fontSize: '1rem', marginRight: 8 }}>Frequency:</label> */}
            <FrequencySelector value={navFrequency} onChange={setNavFrequency} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: '2rem', rowGap: '1rem', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', sm: '45%' }, mb: 2 }}>
            {/* <label style={{ width: 130, minWidth: 130, fontSize: '1rem', marginRight: 8 }}>Date Range:</label> */}
            <CustomDateRangePicker value={dateRange} onChange={setDateRange} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', sm: '45%' }, mb: 2 }}>
            {/* <label style={{ width: 130, minWidth: 130, fontSize: '1rem', marginRight: 8 }}>Chart Type:</label> */}
            <ChartTypeSelector value={chartType} onChange={setChartType} />
          </Box>
        </Box>
        <Box mt={3} sx={{ width: '100%' }}>
          {loading
            ? <div style={{ fontSize: '1rem' }}>Loading NAV data…</div>
            : <NAVChart data={navData} fund={funds.find(f => f.code === selectedFund)} chartType={chartType} />
          }
        </Box>
      </Paper>
    </Box>
  );
};

export default FundDashboard;
