import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Pie } from "react-chartjs-2";
import { NAVEntry, FundConfig, ChartType } from "../types";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);
type Props = {
  data: NAVEntry[];
  fund: FundConfig | undefined;
  chartType: 'line' | 'bar' | 'pie';
};

const NAVChart: React.FC<Props> = ({ data, fund, chartType }) => {
  if (!data || data.length === 0 || !fund) return <p>No data to display.</p>;

  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: fund.name,
        data: data.map((d) => d.nav),
        backgroundColor: 'rgba(54,162,235,0.2)',
        borderColor: 'rgba(54,162,235,1)',
        borderWidth: 1,
      },
    ],
  };

  if (chartType === 'line') return <Line data={chartData} />;
  if (chartType === 'bar') return <Bar data={chartData} />;
  if (chartType === 'pie') {
    return (
      <Pie
        data={{
          labels: data.map((d) => d.date),
          datasets: [
            {
              label: fund.name,
              data: data.map((d) => d.nav),
              backgroundColor: data.map(
                () =>
                  `rgb(${Math.floor(Math.random() * 255)},
                      ${Math.floor(Math.random() * 255)},
                      ${Math.floor(Math.random() * 255)})`
              ),
            },
          ],
        }}
      />
    );
  }
  return null;
};

export default NAVChart;
