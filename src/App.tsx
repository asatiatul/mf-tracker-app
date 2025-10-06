// src/App.tsx
import React from "react";
import { FundConfig } from "./types";
import FundConfigUploader from "./components/FundConfigUploader";
import FundDashboard from "./components/FundDashboard";
import ComparisonPage from "./pages/ComparisonPage";
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';

export interface AppProps {
  funds: FundConfig[];
  setFunds: React.Dispatch<React.SetStateAction<FundConfig[]>>;
}

function TabPanel(props: { children: React.ReactNode; value: number; index: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const App: React.FC<AppProps> = ({ funds, setFunds }) => {
  const [tab, setTab] = React.useState(0);
  const categories = Array.from(new Set(funds.map(f => f.category)));

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={4} sx={{ p: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          indicatorColor="primary"
          textColor="primary"
          centered
          sx={{ mb: 2 }}
        >
          <Tab label="Chart Dashboard" />
          <Tab label="Comparison" />
        </Tabs>

        <FundConfigUploader onConfigUpload={setFunds} />

        <TabPanel value={tab} index={0}>
          <FundDashboard funds={funds} />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <ComparisonPage funds={funds} categories={categories} />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default App;
